import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";

const PARTICLE_CONFIG = {
  speed: 1,
  noiseScale: 0.6,
  noiseIntensity: 0.52,
  timeScale: 1,
  focus: 3.8,
  aperture: 1.79,
  pointSize: 10,
  opacity: 0.8,
  planeScale: 10,
  size: 512,
  vignetteDarkness: 1.5,
  vignetteOffset: 0.4,
  useManualTime: false,
  manualTime: 0,
} as const;

export const GL = () => {
  return (
    <div id="webgl">
      <Canvas
        camera={{
          position: [
            1.2629783123314589, 2.664606471394044, -1.8178993743288914,
          ],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={["#000"]} />
        <Particles
          speed={PARTICLE_CONFIG.speed}
          aperture={PARTICLE_CONFIG.aperture}
          focus={PARTICLE_CONFIG.focus}
          size={PARTICLE_CONFIG.size}
          noiseScale={PARTICLE_CONFIG.noiseScale}
          noiseIntensity={PARTICLE_CONFIG.noiseIntensity}
          timeScale={PARTICLE_CONFIG.timeScale}
          pointSize={PARTICLE_CONFIG.pointSize}
          opacity={PARTICLE_CONFIG.opacity}
          planeScale={PARTICLE_CONFIG.planeScale}
          useManualTime={PARTICLE_CONFIG.useManualTime}
          manualTime={PARTICLE_CONFIG.manualTime}
          introspect={false}
        />
        <Effects multisamping={0} disableGamma>
          <shaderPass
            args={[VignetteShader]}
            uniforms-darkness-value={PARTICLE_CONFIG.vignetteDarkness}
            uniforms-offset-value={PARTICLE_CONFIG.vignetteOffset}
          />
        </Effects>
      </Canvas>
    </div>
  );
};
