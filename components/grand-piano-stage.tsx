"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  Box3,
  Color,
  EquirectangularReflectionMapping,
  FrontSide,
  Group,
  MathUtils,
  Matrix4,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Mesh,
  Object3D,
  PCFSoftShadowMap,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Quaternion,
  SRGBColorSpace,
  SpotLight,
  Vector2,
  Texture,
  Vector3,
  type Material,
  type WebGLRenderTarget,
} from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  Component,
  Suspense,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const MODEL_PATH = "/models/grand_piano.glb";
const TARGET_SIZE = 4.4;
const CAMERA_POSITION: [number, number, number] = [5.4, 3.1, 12.2];
const MOBILE_CAMERA_POSITION: [number, number, number] = [6.3, 3.45, 7.3];
const CAMERA_TARGET: [number, number, number] = [0, 0, 0];
const PIANO_ROTATION: [number, number, number] = [0.04, -0.56, 0];
const PEDAL_ANCHOR_X_SHIFT = -0.08;
const PEDAL_ANCHOR_Y_RATIO = 0.28;
const PEDAL_ANCHOR_Z_SHIFT = 0.04;
const STAGE_ENV_BASE_EXR_PATH = "/models/studio_small_03_1k.exr";
const STAGE_ENV_UPGRADE_EXR_PATH = "/models/studio_small_03_4k.exr";
const KEY_LIGHT_ORBIT_RADIUS = 8.2;
const KEY_LIGHT_ORBIT_SPEED = 0.21;
const KEY_LIGHT_HEIGHT_BASE = 2.3;
const KEY_LIGHT_HEIGHT_SWAY = 0.34;
const SHADOW_CATCHER_Y = -1.55;
const SHADOW_CATCHER_SIZE = 28;
const LIGHT_IDLE_INTENSITY = 114;
const LIGHT_ACTIVE_INTENSITY = 130;
const LIGHT_IDLE_SWAY = 3.6;
const LIGHT_ACTIVE_SWAY = 11.2;
const LIGHT_ACTIVITY_SMOOTHING = 2.9;
const LIGHT_INTENSITY_SMOOTHING = 4.7;
const ENV_INTENSITY_IDLE = 1.04;
const ENV_INTENSITY_ACTIVE = 2.05;
const ENV_ACTIVITY_SMOOTHING = 2.8;
const ENV_INTENSITY_SMOOTHING = 4.1;
const ENV_UPGRADE_IDLE_TIMEOUT_MS = 2600;
const TARGET_DRIFT_IDLE = 0.01;
const TARGET_DRIFT_ACTIVE = 0.052;
const TARGET_DRIFT_SMOOTHING = 3.8;
const CAMERA_BREATH_IDLE = 0.0072;
const CAMERA_BREATH_ACTIVE = 0.037;
const CAMERA_BREATH_SMOOTHING = 2.8;
const CAMERA_POSITION_SMOOTHING = 5.2;
const STAR_PARTICLE_COUNT_DESKTOP = 192;
const DUST_PARTICLE_COUNT_DESKTOP = 332;
const PARTICLE_MOBILE_RATIO = 0.6;
const PARTICLE_ACTIVITY_SMOOTHING = 2.6;
const STAR_OPACITY_IDLE = 0.23;
const STAR_OPACITY_ACTIVE = 0.68;
const DUST_OPACITY_IDLE = 0.11;
const DUST_OPACITY_ACTIVE = 0.36;
const STAR_SIZE_DESKTOP = 0.067;
const STAR_SIZE_MOBILE = 0.076;
const DUST_SIZE_DESKTOP = 0.104;
const DUST_SIZE_MOBILE = 0.117;
const PARTICLE_SIZE_SMOOTHING = 3.2;
const PARTICLE_OPACITY_SMOOTHING = 4.2;
const STAGE_LAZY_RENDER_MARGIN = 900;

useGLTF.preload(MODEL_PATH);

type GrandPianoStageErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type GrandPianoStageErrorBoundaryState = {
  hasError: boolean;
};

class GrandPianoStageErrorBoundary extends Component<
  GrandPianoStageErrorBoundaryProps,
  GrandPianoStageErrorBoundaryState
> {
  state: GrandPianoStageErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): GrandPianoStageErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function bindMediaQueryListener(query: MediaQueryList, handler: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }

  query.addListener(handler);
  return () => query.removeListener(handler);
}

function cloneMaterial(material: Material) {
  const materialName = material.name.toLowerCase();
  const isKeyMaterial = materialName.includes("key") || materialName.includes("ivory");
  const nextMaterial = new MeshPhysicalMaterial({
    name: material.name,
    side: FrontSide,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    envMapIntensity: 1.22,
    ior: 1.5,
  });
  const sourceMaterial = material as Material & {
    map?: Texture | null;
    normalMap?: Texture | null;
    aoMap?: Texture | null;
    roughnessMap?: Texture | null;
    metalnessMap?: Texture | null;
    alphaMap?: Texture | null;
    emissiveMap?: Texture | null;
    normalScale?: Vector2;
    aoMapIntensity?: number;
    roughness?: number;
    metalness?: number;
    emissiveIntensity?: number;
    side?: number;
    transparent?: boolean;
    opacity?: number;
    alphaTest?: number;
  };

  // Recover physically based details from the source glTF materials first,
  // then apply our palette/look tuning below.
  if (sourceMaterial.map) {
    sourceMaterial.map.colorSpace = SRGBColorSpace;
    nextMaterial.map = sourceMaterial.map;
  }
  if (sourceMaterial.normalMap) {
    nextMaterial.normalMap = sourceMaterial.normalMap;
    if (sourceMaterial.normalScale) {
      nextMaterial.normalScale.copy(sourceMaterial.normalScale);
      nextMaterial.normalScale.multiplyScalar(0.72);
    }
  }
  if (sourceMaterial.aoMap) {
    nextMaterial.aoMap = sourceMaterial.aoMap;
    nextMaterial.aoMapIntensity = (sourceMaterial.aoMapIntensity ?? 1) * 0.82;
  }
  if (sourceMaterial.roughnessMap) {
    nextMaterial.roughnessMap = sourceMaterial.roughnessMap;
  }
  if (sourceMaterial.metalnessMap) {
    nextMaterial.metalnessMap = sourceMaterial.metalnessMap;
  }
  if (sourceMaterial.alphaMap) {
    nextMaterial.alphaMap = sourceMaterial.alphaMap;
  }
  if (typeof sourceMaterial.side === "number") {
    nextMaterial.side = sourceMaterial.side;
  }
  if (typeof sourceMaterial.transparent === "boolean") {
    nextMaterial.transparent = sourceMaterial.transparent;
  }
  if (typeof sourceMaterial.opacity === "number") {
    nextMaterial.opacity = sourceMaterial.opacity;
  }
  if (typeof sourceMaterial.alphaTest === "number") {
    nextMaterial.alphaTest = sourceMaterial.alphaTest;
  }

  if (isKeyMaterial && materialName.includes("white")) {
    nextMaterial.color = new Color("#ede8de");
    nextMaterial.roughness = 0.32;
    nextMaterial.metalness = 0.02;
    nextMaterial.clearcoat = 0.08;
    nextMaterial.clearcoatRoughness = 0.2;
  } else if (isKeyMaterial && materialName.includes("black")) {
    nextMaterial.color = new Color("#111722");
    nextMaterial.roughness = 0.18;
    nextMaterial.metalness = 0.04;
    nextMaterial.clearcoat = 0.62;
    nextMaterial.clearcoatRoughness = 0.08;
  } else if (materialName.includes("metal")) {
    nextMaterial.color = new Color("#9f9586");
    nextMaterial.roughness = 0.2;
    nextMaterial.metalness = 0.95;
  } else if (materialName.includes("wood")) {
    nextMaterial.color = new Color("#3b3027");
    nextMaterial.roughness = 0.46;
    nextMaterial.metalness = 0.02;
    nextMaterial.clearcoat = 0.18;
    nextMaterial.clearcoatRoughness = 0.26;
  } else if (materialName.includes("velvet")) {
    nextMaterial.color = new Color("#25201c");
    nextMaterial.roughness = 0.9;
    nextMaterial.metalness = 0.02;
  } else if (materialName.includes("body")) {
    nextMaterial.color = new Color("#101722");
    nextMaterial.roughness = 0.08;
    nextMaterial.metalness = 0.03;
    nextMaterial.clearcoat = 1;
    nextMaterial.clearcoatRoughness = 0.045;
    nextMaterial.envMapIntensity = 1.38;
  } else if (materialName.includes("logo")) {
    nextMaterial.color = new Color("#cfbc9f");
    nextMaterial.roughness = 0.24;
    nextMaterial.metalness = 0.35;
    nextMaterial.clearcoat = 0.22;
    nextMaterial.clearcoatRoughness = 0.2;
    nextMaterial.transparent = true;
    nextMaterial.alphaTest = Math.max(sourceMaterial.alphaTest ?? 0, 0.06);
  } else if (materialName.includes("chair")) {
    nextMaterial.color = new Color("#171d28");
    nextMaterial.roughness = 0.72;
    nextMaterial.metalness = 0.03;
  } else {
    nextMaterial.color = new Color("#141c28");
    nextMaterial.roughness = 0.14;
    nextMaterial.metalness = 0.02;
    nextMaterial.clearcoat = 0.88;
    nextMaterial.clearcoatRoughness = 0.08;
  }

  // Keep shading driven by external lights, not self-illumination.
  nextMaterial.emissive = new Color("#000000");
  nextMaterial.emissiveIntensity = 0;
  nextMaterial.emissiveMap = null;

  nextMaterial.needsUpdate = true;

  return nextMaterial;
}

function createPianoScene(scene: Object3D) {
  scene.updateMatrixWorld(true);

  const nextScene = new Group();
  const rootInverse = new Matrix4().copy(scene.matrixWorld).invert();
  const childMatrix = new Matrix4();
  const childPosition = new Vector3();
  const childQuaternion = new Quaternion();
  const childScale = new Vector3();

  scene.traverse((child) => {
    if (!(child instanceof Mesh) || !child.geometry) {
      return;
    }

    childMatrix.multiplyMatrices(rootInverse, child.matrixWorld);
    childMatrix.decompose(childPosition, childQuaternion, childScale);

    if (child.geometry.attributes.uv && !child.geometry.attributes.uv2) {
      child.geometry.setAttribute("uv2", child.geometry.attributes.uv);
    }

    const sourceMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    const nextMaterials = sourceMaterials.map(cloneMaterial);

    const nextMesh = new Mesh(
      child.geometry,
      Array.isArray(child.material) ? nextMaterials : nextMaterials[0]
    );

    nextMesh.name = child.name;
    nextMesh.visible = child.visible;
    nextMesh.renderOrder = child.renderOrder;
    nextMesh.position.copy(childPosition);
    nextMesh.quaternion.copy(childQuaternion);
    nextMesh.scale.copy(childScale);
    nextMesh.castShadow = true;
    nextMesh.receiveShadow = false;
    nextMesh.frustumCulled = false;

    const outline = new Mesh(
      child.geometry,
      new MeshBasicMaterial({
        color: "#544a3e",
        transparent: true,
        opacity: 0.14,
        side: BackSide,
        depthWrite: false,
      })
    );

    outline.scale.multiplyScalar(1.012);
    outline.frustumCulled = false;
    nextMesh.add(outline);
    nextScene.add(nextMesh);
  });

  if (nextScene.children.length === 0) {
    return nextScene;
  }

  nextScene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(nextScene);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const scale = TARGET_SIZE / (Math.max(size.x, size.y, size.z) || 1);
  const pedalAnchor = new Vector3(
    center.x + size.x * PEDAL_ANCHOR_X_SHIFT,
    bounds.min.y + size.y * PEDAL_ANCHOR_Y_RATIO,
    center.z + size.z * PEDAL_ANCHOR_Z_SHIFT
  );

  nextScene.position.sub(pedalAnchor);
  nextScene.scale.setScalar(scale);

  return nextScene;
}

function GrandPianoStageFallback() {
  return null;
}

function GrandPianoModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const pianoScene = useMemo(() => createPianoScene(scene), [scene]);

  useEffect(() => {
    return () => {
      pianoScene.traverse((child) => {
        if (!(child instanceof Mesh)) {
          return;
        }

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          material.dispose();
        });
      });
    };
  }, [pianoScene]);

  return (
    <group rotation={PIANO_ROTATION}>
      <primitive object={pianoScene} />
    </group>
  );
}

function PianoStageEnvironment({
  isActive,
  reducedMotion,
}: {
  isActive: boolean;
  reducedMotion: boolean;
}) {
  const { gl, scene } = useThree();
  const environmentActivityRef = useRef(0);
  const environmentIntensityRef = useRef(ENV_INTENSITY_IDLE);
  const requestHighQualityRef = useRef<(() => void) | null>(null);

  useFrame((state, delta) => {
    const sceneWithEnvironmentIntensity = scene as typeof scene & {
      environmentIntensity?: number;
    };
    const activityTarget = isActive ? 1 : 0;
    environmentActivityRef.current = MathUtils.damp(
      environmentActivityRef.current,
      activityTarget,
      ENV_ACTIVITY_SMOOTHING,
      delta
    );

    const intensityBase = MathUtils.lerp(
      ENV_INTENSITY_IDLE,
      ENV_INTENSITY_ACTIVE,
      environmentActivityRef.current
    );
    const pulse = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.34 + 0.5) *
        MathUtils.lerp(0.02, 0.16, environmentActivityRef.current);
    const intensityTarget = intensityBase + pulse;

    environmentIntensityRef.current = MathUtils.damp(
      environmentIntensityRef.current,
      intensityTarget,
      ENV_INTENSITY_SMOOTHING,
      delta
    );
    sceneWithEnvironmentIntensity.environmentIntensity = environmentIntensityRef.current;
  });

  useEffect(() => {
    if (!isActive || !requestHighQualityRef.current) {
      return;
    }

    requestHighQualityRef.current();
  }, [isActive]);

  useEffect(() => {
    const pmremGenerator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const previousEnvironment = scene.environment;
    const sceneWithEnvironmentIntensity = scene as typeof scene & {
      environmentIntensity?: number;
    };
    const previousEnvironmentIntensity =
      sceneWithEnvironmentIntensity.environmentIntensity;
    const renderTargets = new Set<WebGLRenderTarget>();
    const fallbackRenderTarget = pmremGenerator.fromScene(room, 0.05);
    renderTargets.add(fallbackRenderTarget);
    let disposed = false;
    let hasRequestedUpgrade = false;
    let idleCallbackId: number | null = null;
    let fallbackTimeoutId: number | null = null;

    scene.environment = fallbackRenderTarget.texture;
    sceneWithEnvironmentIntensity.environmentIntensity = ENV_INTENSITY_IDLE;

    const exrLoader = new EXRLoader();

    const applyEnvironmentRenderTarget = (target: WebGLRenderTarget) => {
      renderTargets.add(target);

      if (disposed) {
        return;
      }

      scene.environment = target.texture;
    };

    const requestUpgradeEnvironment = () => {
      if (hasRequestedUpgrade || disposed) {
        return;
      }

      hasRequestedUpgrade = true;

      exrLoader.load(
        STAGE_ENV_UPGRADE_EXR_PATH,
        (upgradeTexture) => {
          upgradeTexture.mapping = EquirectangularReflectionMapping;
          const upgradeRenderTarget =
            pmremGenerator.fromEquirectangular(upgradeTexture);
          upgradeTexture.dispose();

          if (disposed) {
            upgradeRenderTarget.dispose();
            return;
          }

          applyEnvironmentRenderTarget(upgradeRenderTarget);
        },
        undefined,
        () => {
          // Keep base environment when 4K upgrade fails.
        }
      );
    };

    requestHighQualityRef.current = requestUpgradeEnvironment;

    const scheduleUpgradeAtIdle = () => {
      const idleWindow = window as Window & {
        requestIdleCallback?: (
          callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
          options?: { timeout: number }
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

      if (typeof idleWindow.requestIdleCallback === "function") {
        idleCallbackId = idleWindow.requestIdleCallback(
          () => {
            requestUpgradeEnvironment();
          },
          { timeout: ENV_UPGRADE_IDLE_TIMEOUT_MS }
        );
        return;
      }

      fallbackTimeoutId = window.setTimeout(
        requestUpgradeEnvironment,
        ENV_UPGRADE_IDLE_TIMEOUT_MS
      );
    };

    exrLoader.load(
      STAGE_ENV_BASE_EXR_PATH,
      (baseTexture) => {
        baseTexture.mapping = EquirectangularReflectionMapping;
        const baseRenderTarget = pmremGenerator.fromEquirectangular(baseTexture);
        baseTexture.dispose();

        if (disposed) {
          baseRenderTarget.dispose();
          return;
        }

        applyEnvironmentRenderTarget(baseRenderTarget);
        scheduleUpgradeAtIdle();
      },
      undefined,
      () => {
        // Keep room fallback if base EXR fails, but still try upgrading directly.
        scheduleUpgradeAtIdle();
      }
    );

    return () => {
      disposed = true;
      requestHighQualityRef.current = null;

      const idleWindow = window as Window & {
        cancelIdleCallback?: (handle: number) => void;
      };
      if (
        idleCallbackId !== null &&
        typeof idleWindow.cancelIdleCallback === "function"
      ) {
        idleWindow.cancelIdleCallback(idleCallbackId);
      }
      if (fallbackTimeoutId !== null) {
        window.clearTimeout(fallbackTimeoutId);
      }

      scene.environment = previousEnvironment;
      sceneWithEnvironmentIntensity.environmentIntensity =
        previousEnvironmentIntensity;

      renderTargets.forEach((target) => {
        target.dispose();
      });
      room.dispose?.();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
}

function createRingParticlePositions({
  count,
  radius,
  thickness,
  verticalSpread,
  verticalBias = 0,
}: {
  count: number;
  radius: number;
  thickness: number;
  verticalSpread: number;
  verticalBias?: number;
}) {
  const positions = new Float32Array(count * 3);
  const halfThickness = thickness * 0.5;

  for (let point = 0; point < count; point += 1) {
    const azimuth = Math.random() * Math.PI * 2;
    const radialOffset = MathUtils.randFloatSpread(thickness);
    const ringRadius = Math.max(radius + radialOffset, radius - halfThickness * 0.8);
    const orbitWarp = 1 + Math.sin(azimuth * 3 + Math.random() * 0.8) * 0.06;
    const x = Math.cos(azimuth) * ringRadius * orbitWarp;
    const z = Math.sin(azimuth) * ringRadius * orbitWarp;
    const y =
      verticalBias +
      MathUtils.randFloatSpread(verticalSpread) +
      Math.sin(azimuth * 2 + Math.random() * 0.5) * verticalSpread * 0.08;
    const index = point * 3;
    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = z;
  }

  return positions;
}

function PianoStageParticles({
  isActive,
  isMobileViewport,
  reducedMotion,
}: {
  isActive: boolean;
  isMobileViewport: boolean;
  reducedMotion: boolean;
}) {
  const starRef = useRef<Points>(null);
  const dustRef = useRef<Points>(null);
  const starMaterialRef = useRef<PointsMaterial>(null);
  const dustMaterialRef = useRef<PointsMaterial>(null);
  const activityRef = useRef(0);
  const starCount = isMobileViewport
    ? Math.round(STAR_PARTICLE_COUNT_DESKTOP * PARTICLE_MOBILE_RATIO)
    : STAR_PARTICLE_COUNT_DESKTOP;
  const dustCount = isMobileViewport
    ? Math.round(DUST_PARTICLE_COUNT_DESKTOP * PARTICLE_MOBILE_RATIO)
    : DUST_PARTICLE_COUNT_DESKTOP;
  const starPositions = useMemo(
    () =>
      createRingParticlePositions({
        count: starCount,
        radius: 2.62,
        thickness: 0.82,
        verticalSpread: 0.44,
        verticalBias: 0.12,
      }),
    [starCount]
  );
  const dustPositions = useMemo(
    () =>
      createRingParticlePositions({
        count: dustCount,
        radius: 2.98,
        thickness: 1.34,
        verticalSpread: 0.66,
        verticalBias: 0.15,
      }),
    [dustCount]
  );

  useFrame((state, delta) => {
    const activityTarget = reducedMotion ? 0 : isActive ? 1 : 0;
    activityRef.current = MathUtils.damp(
      activityRef.current,
      activityTarget,
      PARTICLE_ACTIVITY_SMOOTHING,
      delta
    );

    const time = state.clock.elapsedTime;
    const motionAmount = reducedMotion
      ? 0
      : MathUtils.lerp(0.55, 1.75, activityRef.current);

    if (starRef.current) {
      starRef.current.rotation.y = time * (0.024 * motionAmount);
      starRef.current.rotation.x = Math.cos(time * 0.14 + 0.5) * 0.082 * motionAmount;
      starRef.current.rotation.z = Math.sin(time * 0.12 + 0.9) * 0.065 * motionAmount;
      starRef.current.position.x = Math.sin(time * 0.27 + 0.7) * 0.22 * motionAmount;
      starRef.current.position.y =
        0.08 + Math.cos(time * 0.23 + 1.3) * 0.118 * motionAmount;
      starRef.current.position.z = Math.sin(time * 0.25 + 2.4) * 0.24 * motionAmount;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = -time * (0.019 * motionAmount);
      dustRef.current.rotation.x = Math.cos(time * 0.11 + 1) * 0.053 * motionAmount;
      dustRef.current.rotation.z = Math.sin(time * 0.15 + 0.4) * 0.058 * motionAmount;
      dustRef.current.position.x = Math.cos(time * 0.21 + 0.2) * 0.26 * motionAmount;
      dustRef.current.position.y =
        0.14 + Math.sin(time * 0.17 + 2.1) * 0.128 * motionAmount;
      dustRef.current.position.z = Math.cos(time * 0.24 + 0.9) * 0.28 * motionAmount;
    }

    if (starMaterialRef.current) {
      const pulse = reducedMotion ? 0 : Math.sin(time * 0.51 + 1.8) * 0.082;
      const opacityTarget = Math.max(
        0.05,
        MathUtils.lerp(STAR_OPACITY_IDLE, STAR_OPACITY_ACTIVE, activityRef.current) + pulse
      );
      const baseSize = isMobileViewport ? STAR_SIZE_MOBILE : STAR_SIZE_DESKTOP;
      const sizeTarget = reducedMotion
        ? baseSize
        : baseSize *
          (1 +
            activityRef.current * 0.28 +
            Math.sin(time * 0.36 + 0.6) * 0.07);
      starMaterialRef.current.opacity = MathUtils.damp(
        starMaterialRef.current.opacity,
        opacityTarget,
        PARTICLE_OPACITY_SMOOTHING,
        delta
      );
      starMaterialRef.current.size = MathUtils.damp(
        starMaterialRef.current.size,
        sizeTarget,
        PARTICLE_SIZE_SMOOTHING,
        delta
      );
    }

    if (dustMaterialRef.current) {
      const pulse = reducedMotion ? 0 : Math.cos(time * 0.38 + 0.4) * 0.055;
      const opacityTarget = Math.max(
        0.03,
        MathUtils.lerp(DUST_OPACITY_IDLE, DUST_OPACITY_ACTIVE, activityRef.current) + pulse
      );
      const baseSize = isMobileViewport ? DUST_SIZE_MOBILE : DUST_SIZE_DESKTOP;
      const sizeTarget = reducedMotion
        ? baseSize
        : baseSize *
          (1 +
            activityRef.current * 0.2 +
            Math.sin(time * 0.31 + 2.2) * 0.055);
      dustMaterialRef.current.opacity = MathUtils.damp(
        dustMaterialRef.current.opacity,
        opacityTarget,
        PARTICLE_OPACITY_SMOOTHING,
        delta
      );
      dustMaterialRef.current.size = MathUtils.damp(
        dustMaterialRef.current.size,
        sizeTarget,
        PARTICLE_SIZE_SMOOTHING,
        delta
      );
    }
  });

  return (
    <group position={[0.04, -0.18, 0.08]}>
      <points ref={dustRef} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={dustMaterialRef}
          color="#9fb4d6"
          size={isMobileViewport ? DUST_SIZE_MOBILE : DUST_SIZE_DESKTOP}
          transparent
          opacity={DUST_OPACITY_IDLE}
          depthWrite={false}
          blending={AdditiveBlending}
          sizeAttenuation
          toneMapped
        />
      </points>
      <points ref={starRef} renderOrder={2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={starMaterialRef}
          color="#d8c7a8"
          size={isMobileViewport ? STAR_SIZE_MOBILE : STAR_SIZE_DESKTOP}
          transparent
          opacity={STAR_OPACITY_IDLE}
          depthWrite={false}
          blending={AdditiveBlending}
          sizeAttenuation
          toneMapped
        />
      </points>
    </group>
  );
}

function PianoStageLights({
  isActive,
  reducedMotion,
}: {
  isActive: boolean;
  reducedMotion: boolean;
}) {
  const keyLightRef = useRef<SpotLight>(null);
  const keyLightTargetRef = useRef<Group>(null);
  const lightActivityRef = useRef(0);
  const targetDriftRef = useRef(new Vector3(0.05, -0.82, 0.08));

  useFrame((state, delta) => {
    if (!keyLightRef.current || !keyLightTargetRef.current) {
      return;
    }

    const activityTarget = reducedMotion ? 0 : isActive ? 1 : 0;
    lightActivityRef.current = MathUtils.damp(
      lightActivityRef.current,
      activityTarget,
      LIGHT_ACTIVITY_SMOOTHING,
      delta
    );

    // Weighted orbit to avoid mechanical constant-speed movement.
    const basePhase = state.clock.elapsedTime * KEY_LIGHT_ORBIT_SPEED;
    const orbit = reducedMotion
      ? 0
      : basePhase + Math.sin(basePhase * 0.52) * 0.42;
    const lightX = Math.cos(orbit) * KEY_LIGHT_ORBIT_RADIUS;
    const lightY = KEY_LIGHT_HEIGHT_BASE + Math.sin(orbit * 0.45) * KEY_LIGHT_HEIGHT_SWAY;
    const lightZ = Math.sin(orbit) * KEY_LIGHT_ORBIT_RADIUS;
    keyLightRef.current.position.set(
      lightX,
      lightY,
      lightZ
    );

    const intensityBase = MathUtils.lerp(
      LIGHT_IDLE_INTENSITY,
      LIGHT_ACTIVE_INTENSITY,
      lightActivityRef.current
    );
    const intensitySway = MathUtils.lerp(
      LIGHT_IDLE_SWAY,
      LIGHT_ACTIVE_SWAY,
      lightActivityRef.current
    );
    const intensityTarget = reducedMotion
      ? intensityBase
      : intensityBase +
        Math.sin(state.clock.elapsedTime * 0.36 + 0.8) * intensitySway;
    keyLightRef.current.intensity = MathUtils.damp(
      keyLightRef.current.intensity,
      intensityTarget,
      LIGHT_INTENSITY_SMOOTHING,
      delta
    );

    // Gently drift the light target around the lower-body anchor for more natural highlight motion.
    const driftRadius = MathUtils.lerp(
      TARGET_DRIFT_IDLE,
      TARGET_DRIFT_ACTIVE,
      lightActivityRef.current
    );
    const targetX = reducedMotion
      ? 0.05
      : 0.05 + Math.cos(state.clock.elapsedTime * 0.28) * driftRadius;
    const targetY = reducedMotion
      ? -0.82
      : -0.82 + Math.sin(state.clock.elapsedTime * 0.22 + 0.7) * (driftRadius * 0.42);
    const targetZ = reducedMotion
      ? 0.08
      : 0.08 + Math.sin(state.clock.elapsedTime * 0.31 + 1.4) * (driftRadius * 0.84);
    targetDriftRef.current.set(
      MathUtils.damp(targetDriftRef.current.x, targetX, TARGET_DRIFT_SMOOTHING, delta),
      MathUtils.damp(targetDriftRef.current.y, targetY, TARGET_DRIFT_SMOOTHING, delta),
      MathUtils.damp(targetDriftRef.current.z, targetZ, TARGET_DRIFT_SMOOTHING, delta)
    );

    keyLightTargetRef.current.position.copy(targetDriftRef.current);
    keyLightRef.current.target = keyLightTargetRef.current;
    keyLightRef.current.target.updateMatrixWorld(true);
  });

  return (
    <>
      <group ref={keyLightTargetRef} />
      <spotLight
        ref={keyLightRef}
        position={[
          KEY_LIGHT_ORBIT_RADIUS,
          KEY_LIGHT_HEIGHT_BASE,
          0,
        ]}
        angle={0.28}
        penumbra={0.92}
        intensity={LIGHT_IDLE_INTENSITY}
        distance={38}
        decay={1.55}
        color="#ffe4bf"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00014}
        shadow-normalBias={0.022}
        shadow-camera-near={0.5}
        shadow-camera-far={42}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SHADOW_CATCHER_Y, 0]}
        receiveShadow
      >
        <planeGeometry args={[SHADOW_CATCHER_SIZE, SHADOW_CATCHER_SIZE]} />
        <shadowMaterial transparent opacity={0.48} />
      </mesh>
    </>
  );
}

function StageCameraBreathing({
  isActive,
  isMobileViewport,
  reducedMotion,
}: {
  isActive: boolean;
  isMobileViewport: boolean;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const activityRef = useRef(0);

  useFrame((state, delta) => {
    const basePosition = isMobileViewport ? MOBILE_CAMERA_POSITION : CAMERA_POSITION;
    const activityTarget = reducedMotion ? 0 : isActive ? 1 : 0;
    activityRef.current = MathUtils.damp(
      activityRef.current,
      activityTarget,
      CAMERA_BREATH_SMOOTHING,
      delta
    );

    const breathAmplitude = reducedMotion
      ? 0
      : MathUtils.lerp(CAMERA_BREATH_IDLE, CAMERA_BREATH_ACTIVE, activityRef.current);
    const offsetX =
      Math.sin(state.clock.elapsedTime * 0.22 + 0.2) * breathAmplitude * 1.36;
    const offsetY =
      Math.cos(state.clock.elapsedTime * 0.27 + 0.7) * breathAmplitude * 1.1;
    const offsetZ =
      Math.sin(state.clock.elapsedTime * 0.19 + 1.4) * breathAmplitude * 2.05;

    camera.position.x = MathUtils.damp(
      camera.position.x,
      basePosition[0] + offsetX,
      CAMERA_POSITION_SMOOTHING,
      delta
    );
    camera.position.y = MathUtils.damp(
      camera.position.y,
      basePosition[1] + offsetY,
      CAMERA_POSITION_SMOOTHING,
      delta
    );
    camera.position.z = MathUtils.damp(
      camera.position.z,
      basePosition[2] + offsetZ,
      CAMERA_POSITION_SMOOTHING,
      delta
    );

    const lookX =
      CAMERA_TARGET[0] + Math.sin(state.clock.elapsedTime * 0.18) * breathAmplitude * 1.25;
    const lookY =
      CAMERA_TARGET[1] +
      Math.cos(state.clock.elapsedTime * 0.2 + 0.9) * breathAmplitude * 1.05;
    const lookZ =
      CAMERA_TARGET[2] +
      Math.sin(state.clock.elapsedTime * 0.15 + 0.4) * breathAmplitude * 0.9;
    camera.lookAt(lookX, lookY, lookZ);
  });

  return null;
}

function PianoStageCanvas({
  isMobileViewport,
  isActive,
  reducedMotion,
}: {
  isMobileViewport: boolean;
  isActive: boolean;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      className="pointer-events-none absolute inset-0 h-full w-full"
      shadows
      dpr={isMobileViewport ? [1, 1.5] : [1.2, 2.05]}
      gl={{
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      }}
      camera={{
        position: isMobileViewport ? MOBILE_CAMERA_POSITION : CAMERA_POSITION,
        fov: isMobileViewport ? 32 : 29,
        near: 0.01,
        far: 45,
      }}
      onCreated={({ camera, gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.setClearAlpha(0);
        gl.outputColorSpace = SRGBColorSpace;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = PCFSoftShadowMap;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
        gl.domElement.style.background = "transparent";
        scene.background = null;
        camera.lookAt(...CAMERA_TARGET);
      }}
    >
      <PianoStageEnvironment
        isActive={isActive}
        reducedMotion={reducedMotion}
      />
      <PianoStageLights
        isActive={isActive}
        reducedMotion={reducedMotion}
      />
      <PianoStageParticles
        isActive={isActive}
        isMobileViewport={isMobileViewport}
        reducedMotion={reducedMotion}
      />
      <GrandPianoModel />
      <StageCameraBreathing
        isActive={isActive}
        isMobileViewport={isMobileViewport}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

export function GrandPianoStage({
  isActive = false,
}: {
  isActive?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shouldRenderCanvas, setShouldRenderCanvas] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const mobileViewportQuery = window.matchMedia("(max-width: 1023px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreferences = () => {
      setIsMobileViewport(mobileViewportQuery.matches);
      setReducedMotion(reducedMotionQuery.matches);
    };

    syncPreferences();

    const removeMobileViewportListener = bindMediaQueryListener(
      mobileViewportQuery,
      syncPreferences
    );
    const removeReducedMotionListener = bindMediaQueryListener(
      reducedMotionQuery,
      syncPreferences
    );

    return () => {
      removeMobileViewportListener();
      removeReducedMotionListener();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || shouldRenderCanvas) {
      return;
    }

    let frameId = 0;
    const timeoutIds: number[] = [];

    const checkViewportDistance = () => {
      if (!containerRef.current) {
        return;
      }

      const bounds = containerRef.current.getBoundingClientRect();
      const isNearViewport =
        bounds.top <= window.innerHeight + STAGE_LAZY_RENDER_MARGIN &&
        bounds.bottom >= -STAGE_LAZY_RENDER_MARGIN;

      if (isNearViewport) {
        setShouldRenderCanvas(true);
      }
    };

    const handleViewportChange = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        checkViewportDistance();
      });
    };

    checkViewportDistance();
    timeoutIds.push(window.setTimeout(checkViewportDistance, 180));
    timeoutIds.push(window.setTimeout(checkViewportDistance, 900));

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      timeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [shouldRenderCanvas]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[5/6] overflow-hidden bg-transparent"
      aria-label="Grand piano stage"
    >
      {isMounted && shouldRenderCanvas ? (
        <GrandPianoStageErrorBoundary fallback={<GrandPianoStageFallback />}>
          <Suspense fallback={null}>
            <PianoStageCanvas
              isMobileViewport={isMobileViewport}
              isActive={isActive}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </GrandPianoStageErrorBoundary>
      ) : null}
    </div>
  );
}
