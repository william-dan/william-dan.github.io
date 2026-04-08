"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Group,
  MathUtils,
  Mesh,
  Object3D,
  SRGBColorSpace,
} from "three";

const MODEL_PATH = "/models/moon_small-2048.glb";
const MODEL_SCALE = 0.94;
const BASE_PITCH = 0.36;
const BASE_YAW = 0.86;
const BASE_ROLL = -0.08;
const DRIFT_PITCH_RANGE = 0.018;
const DRIFT_YAW_RANGE = 0.034;
const AUTO_ROTATION_SPEED = 0.1;

useGLTF.preload(MODEL_PATH);

type MoonStageErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type MoonStageErrorBoundaryState = {
  hasError: boolean;
};

class MoonStageErrorBoundary extends Component<
  MoonStageErrorBoundaryProps,
  MoonStageErrorBoundaryState
> {
  state: MoonStageErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): MoonStageErrorBoundaryState {
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

function useMoonStageSettings() {
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const syncPreferences = () => {
      setReducedMotion(reducedMotionQuery.matches);
    };

    syncPreferences();

    const removeReducedMotionListener = bindMediaQueryListener(
      reducedMotionQuery,
      syncPreferences
    );

    return () => {
      removeReducedMotionListener();
    };
  }, []);

  return {
    isMounted,
    reducedMotion,
  };
}

function MoonSceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle_at_36%_30%,rgba(255,255,255,0.18),rgba(194,206,228,0.12)_28%,rgba(115,126,154,0.08)_50%,rgba(10,10,15,0)_76%)] blur-[72px]" />
      <div className="absolute inset-[26%] rounded-full bg-[radial-gradient(circle_at_36%_30%,rgba(255,255,255,0.12),rgba(190,202,226,0.06)_46%,rgba(10,10,15,0)_78%)] opacity-80 blur-2xl" />
    </div>
  );
}

function createMoonScene(scene: Object3D) {
  const clone = scene.clone(true);

  clone.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = false;
    child.frustumCulled = false;

    const sourceMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    const nextMaterials = sourceMaterials.map((sourceMaterial) => {
      const material = sourceMaterial.clone();

      if ("map" in material && material.map) {
        material.map = material.map.clone();
        material.map.colorSpace = SRGBColorSpace;
        material.map.needsUpdate = true;
      }

      if ("metalness" in material) {
        material.metalness = 0;
      }

      if ("roughness" in material) {
        material.roughness = 1;
      }

      if ("clearcoat" in material) {
        material.clearcoat = 0;
      }

      if ("clearcoatRoughness" in material) {
        material.clearcoatRoughness = 1;
      }

      if ("specularIntensity" in material) {
        material.specularIntensity = 0;
      }

      if ("ior" in material) {
        material.ior = 1.16;
      }

      if ("emissive" in material) {
        material.emissive.set("#252c37");
      }

      if ("emissiveIntensity" in material) {
        material.emissiveIntensity = 0.12;
      }

      material.transparent = false;
      material.needsUpdate = true;

      return material;
    });

    child.material = Array.isArray(child.material)
      ? nextMaterials
      : nextMaterials[0];
  });

  return clone;
}

function MoonModel({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF(MODEL_PATH);
  const pivotRef = useRef<Group>(null);
  const rotationRef = useRef<Group>(null);

  const moonScene = useMemo(() => createMoonScene(scene), [scene]);

  useFrame((state, delta) => {
    if (!pivotRef.current || !rotationRef.current) {
      return;
    }

    const driftPitch = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.4) * DRIFT_PITCH_RANGE;
    const driftYaw = reducedMotion
      ? 0
      : Math.cos(state.clock.elapsedTime * 0.28) * DRIFT_YAW_RANGE;

    pivotRef.current.rotation.x = MathUtils.lerp(
      pivotRef.current.rotation.x,
      BASE_PITCH + driftPitch,
      0.08
    );
    pivotRef.current.rotation.y = MathUtils.lerp(
      pivotRef.current.rotation.y,
      BASE_YAW + driftYaw,
      0.08
    );
    pivotRef.current.rotation.z = MathUtils.lerp(
      pivotRef.current.rotation.z,
      BASE_ROLL,
      0.08
    );

    if (!reducedMotion) {
      rotationRef.current.rotation.y += delta * AUTO_ROTATION_SPEED;
    } else {
      rotationRef.current.rotation.y = MathUtils.lerp(
        rotationRef.current.rotation.y,
        0,
        0.08
      );
    }
  });

  return (
    <group ref={pivotRef}>
      <group ref={rotationRef}>
        <Center>
          <primitive object={moonScene} scale={MODEL_SCALE} />
        </Center>
      </group>
    </group>
  );
}

function MoonCanvas({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      className="pointer-events-none absolute inset-0 h-full w-full"
      dpr={[1, 1.35]}
      gl={{
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 6.9], fov: 24, near: 0.1, far: 40 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.setClearAlpha(0);
        gl.domElement.style.background = "transparent";
        scene.background = null;
      }}
    >
      <ambientLight intensity={0.72} color="#d6deea" />
      <hemisphereLight intensity={0.82} color="#e2e7ef" groundColor="#0a0c12" />
      <directionalLight
        position={[4.6, 2.8, 5.8]}
        intensity={2.4}
        color="#ecdcc1"
      />
      <directionalLight
        position={[-5.2, 1.2, -4.6]}
        intensity={1.18}
        color="#8ea6d4"
      />
      <directionalLight
        position={[0.4, -3.4, 2.8]}
        intensity={0.36}
        color="#acb6c7"
      />
      <MoonModel reducedMotion={reducedMotion} />
    </Canvas>
  );
}

export function MoonStage() {
  const { isMounted, reducedMotion } = useMoonStageSettings();

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[clamp(0rem,2vh,1.25rem)] z-0 aspect-square w-[min(66vw,21rem)] -translate-x-1/2 overflow-visible md:w-[min(48vw,25rem)] lg:w-[27rem]"
      role="img"
      aria-label="3D Moon"
    >
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_42%_36%,rgba(204,214,234,0.16),rgba(140,154,184,0.08)_38%,rgba(10,10,15,0)_72%)] blur-[84px]" />
      {isMounted ? (
        <MoonStageErrorBoundary fallback={<MoonSceneFallback />}>
          <Suspense fallback={<MoonSceneFallback />}>
            <MoonCanvas reducedMotion={reducedMotion} />
          </Suspense>
        </MoonStageErrorBoundary>
      ) : (
        <MoonSceneFallback />
      )}
    </div>
  );
}
