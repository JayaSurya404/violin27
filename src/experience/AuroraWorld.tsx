"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";

import styles from "./AuroraWorld.module.css";
import { SceneFallback } from "./SceneFallback";

export interface AuroraWorldProps {
  celebration: boolean;
  moonLabel?: string;
  onMoonInteract?: () => void;
  palette: {
    readonly auroraBlue: string;
    readonly auroraPink: string;
    readonly deepPurple: string;
    readonly lavender: string;
    readonly midnightBlack: string;
    readonly moonGlow: string;
    readonly royalViolet: string;
    readonly softWhite: string;
  };
  progress: number;
  unlocked: boolean;
}

type QualityTier = "high" | "low" | "medium";

interface WebGLBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface WebGLBoundaryState {
  failed: boolean;
}

interface WorldSceneProps extends AuroraWorldProps {
  active: boolean;
  moonPulse: number;
  onPerformanceDrop: () => void;
  quality: QualityTier;
  reducedMotion: boolean;
  reportContextLoss: () => void;
}

interface AuroraRibbonProps {
  celebration: boolean;
  colorA: string;
  colorB: string;
  opacity: number;
  phase: number;
  position: [number, number, number];
  progress: number;
  reducedMotion: boolean;
  rotation: number;
  scale: [number, number, number];
  unlocked: boolean;
}

interface ParticleFieldProps {
  color: string;
  count: number;
  depth: number;
  height: number;
  opacity: number;
  reducedMotion: boolean;
  seed: number;
  size: number;
  speed: number;
  width: number;
}

interface MoonProps {
  celebration: boolean;
  palette: AuroraWorldProps["palette"];
  progress: number;
  pulseToken: number;
  quality: QualityTier;
  reducedMotion: boolean;
  unlocked: boolean;
}

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float outerWave = sin(position.x * 0.42 + uTime * 0.11 + uPhase);
    float innerWave = sin(position.x * 0.91 - uTime * 0.075 + uPhase * 1.73);
    float veil = sin(uv.x * 3.14159265);
    transformed.y += (outerWave * 0.42 + innerWave * 0.17) * veil;
    transformed.z += sin(position.x * 0.31 + uTime * 0.09 + uPhase) * 0.28;
    vWave = 0.5 + 0.5 * outerWave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uWarmth;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying float vWave;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(random(cell), random(cell + vec2(1.0, 0.0)), local.x),
      mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  void main() {
    float lowerEdge = smoothstep(0.02, 0.27, vUv.y);
    float upperEdge = 1.0 - smoothstep(0.58, 0.98, vUv.y);
    float sideEdges = smoothstep(0.0, 0.14, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x));
    float organicNoise = noise(vec2(vUv.x * 5.0 + uTime * 0.018, vUv.y * 2.2));
    float fineVeil = 0.62 + 0.38 * sin(vUv.x * 15.0 + organicNoise * 2.4 + uTime * 0.035);
    float alpha = lowerEdge * upperEdge * sideEdges * (0.42 + organicNoise * 0.48) * fineVeil;
    vec3 warmColor = vec3(0.96, 0.46, 0.72);
    vec3 baseColor = mix(uColorA, uColorB, clamp(vUv.x + vWave * 0.16, 0.0, 1.0));
    vec3 finalColor = mix(baseColor, warmColor, clamp(uWarmth, 0.0, 0.62));
    gl_FragColor = vec4(finalColor * (0.78 + organicNoise * 0.34), alpha * uOpacity);
  }
`;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const createRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

class WebGLBoundary extends Component<WebGLBoundaryProps, WebGLBoundaryState> {
  state: WebGLBoundaryState = { failed: false };

  static getDerivedStateFromError(): WebGLBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const attributes: WebGLContextAttributes = {
      alpha: true,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "low-power",
    };
    const context =
      canvas.getContext("webgl2", attributes) ?? canvas.getContext("webgl", attributes);

    if (!context) {
      return false;
    }

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function getInitialQuality(): QualityTier {
  const device = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const cores = device.hardwareConcurrency || 4;
  const memory = device.deviceMemory || 4;
  const compactViewport = window.innerWidth < 680;
  const highDensity = window.devicePixelRatio > 2.25;

  if (device.connection?.saveData || cores <= 4 || memory <= 4 || (compactViewport && highDensity)) {
    return "low";
  }

  if (cores >= 8 && memory >= 8 && window.innerWidth >= 900) {
    return "high";
  }

  return "medium";
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function usePageVisibility() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setActive(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return active;
}

function WebGLContextGuard({ onContextLoss }: { onContextLoss: () => void }) {
  const renderer = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = renderer.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onContextLoss();
    };

    canvas.addEventListener("webglcontextlost", handleContextLoss, { passive: false });
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [onContextLoss, renderer]);

  return null;
}

function PerformanceGovernor({
  enabled,
  onPerformanceDrop,
}: {
  enabled: boolean;
  onPerformanceDrop: () => void;
}) {
  const sample = useRef({ elapsed: 0, frames: 0, reported: false });

  useFrame((_, delta) => {
    if (!enabled || sample.current.reported) {
      return;
    }

    sample.current.elapsed += Math.min(delta, 0.1);
    sample.current.frames += 1;

    if (sample.current.elapsed >= 4) {
      const framesPerSecond = sample.current.frames / sample.current.elapsed;
      sample.current.reported = true;

      if (framesPerSecond < 43) {
        onPerformanceDrop();
      }
    }
  });

  return null;
}

function CameraRig({
  active,
  progress,
  reducedMotion,
  unlocked,
}: {
  active: boolean;
  progress: number;
  reducedMotion: boolean;
  unlocked: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef(camera);
  const pointer = useRef(new THREE.Vector2());
  const orientation = useRef(new THREE.Vector2());

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useEffect(() => {
    if (!active || reducedMotion) {
      pointer.current.set(0, 0);
      orientation.current.set(0, 0);
      return;
    }

    let orientationOrigin: { beta: number; gamma: number } | null = null;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }

      pointer.current.set(
        THREE.MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(-((event.clientY / window.innerHeight) * 2 - 1), -1, 1),
      );
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) {
        return;
      }

      orientationOrigin ??= { beta: event.beta, gamma: event.gamma };
      const gammaDelta = event.gamma - orientationOrigin.gamma;
      const betaDelta = event.beta - orientationOrigin.beta;
      orientation.current.set(
        THREE.MathUtils.clamp(gammaDelta / 35, -0.7, 0.7),
        THREE.MathUtils.clamp(-betaDelta / 45, -0.55, 0.55),
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [active, reducedMotion]);

  useFrame(({ clock }, delta) => {
    const activeCamera = cameraRef.current;
    const safeDelta = Math.min(delta, 0.05);
    const time = clock.elapsedTime;
    const motionScale = reducedMotion ? 0 : 1;
    const parallaxX = (pointer.current.x * 0.13 + orientation.current.x * 0.085) * motionScale;
    const parallaxY = (pointer.current.y * 0.1 + orientation.current.y * 0.065) * motionScale;
    const driftX = Math.sin(time * 0.075) * 0.045 * motionScale;
    const driftY = Math.cos(time * 0.061) * 0.04 * motionScale;
    const targetZ = 8 - (unlocked ? 0.24 : 0) - progress * 0.16;

    if (reducedMotion) {
      activeCamera.position.set(0, 0, targetZ);
      activeCamera.lookAt(0, progress * 0.05, -1.8);
      return;
    }

    activeCamera.position.x = THREE.MathUtils.damp(
      activeCamera.position.x,
      parallaxX + driftX,
      2.2,
      safeDelta,
    );
    activeCamera.position.y = THREE.MathUtils.damp(
      activeCamera.position.y,
      parallaxY + driftY,
      2.2,
      safeDelta,
    );
    activeCamera.position.z = THREE.MathUtils.damp(
      activeCamera.position.z,
      targetZ,
      1.35,
      safeDelta,
    );
    activeCamera.lookAt(0, progress * 0.05, -1.8);
  });

  return null;
}

function AuroraRibbon({
  celebration,
  colorA,
  colorB,
  opacity,
  phase,
  position,
  progress,
  reducedMotion,
  rotation,
  scale,
  unlocked,
}: AuroraRibbonProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uOpacity: { value: 0 },
      uPhase: { value: phase },
      uTime: { value: phase * 11 },
      uWarmth: { value: 0 },
    }),
    [colorA, colorB, phase],
  );

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }

    const safeDelta = Math.min(delta, 0.05);
    if (!reducedMotion) {
      shader.uniforms.uTime.value += safeDelta;
    }

    const targetOpacity =
      opacity *
      (0.22 + (unlocked ? 0.48 : 0) + progress * 0.19 + (celebration ? 0.16 : 0));
    const targetWarmth = progress * 0.42 + (celebration ? 0.22 : 0);

    if (reducedMotion) {
      shader.uniforms.uOpacity.value = targetOpacity;
      shader.uniforms.uWarmth.value = targetWarmth;
      return;
    }

    shader.uniforms.uOpacity.value = THREE.MathUtils.damp(
      shader.uniforms.uOpacity.value,
      targetOpacity,
      1.8,
      safeDelta,
    );
    shader.uniforms.uWarmth.value = THREE.MathUtils.damp(
      shader.uniforms.uWarmth.value,
      targetWarmth,
      1.4,
      safeDelta,
    );
  });

  return (
    <mesh position={position} rotation={[0, 0, rotation]} scale={scale}>
      <planeGeometry args={[15, 6.4, 34, 14]} />
      <shaderMaterial
        ref={material}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={FRAGMENT_SHADER}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
      />
    </mesh>
  );
}

function ParticleField({
  color,
  count,
  depth,
  height,
  opacity,
  reducedMotion,
  seed,
  size,
  speed,
  width,
}: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const random = createRandom(seed);
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset] = (random() - 0.5) * width;
      positions[offset + 1] = (random() - 0.5) * height;
      positions[offset + 2] = -1.5 - random() * depth;
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return nextGeometry;
  }, [count, depth, height, seed, width]);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        blending: THREE.AdditiveBlending,
        color,
        depthWrite: false,
        opacity,
        size,
        sizeAttenuation: true,
        transparent: true,
      }),
    [color, opacity, size],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }, delta) => {
    if (!points.current || reducedMotion) {
      return;
    }

    const safeDelta = Math.min(delta, 0.05);
    points.current.rotation.y += safeDelta * speed * 0.025;
    points.current.rotation.z = Math.sin(clock.elapsedTime * speed * 0.08 + seed) * 0.007;
    points.current.position.y = Math.sin(clock.elapsedTime * speed * 0.12 + seed) * 0.055;
  });

  return (
    <points
      ref={points}
      frustumCulled={false}
      geometry={geometry}
      material={material}
    />
  );
}

function Moon({
  celebration,
  palette,
  progress,
  pulseToken,
  quality,
  reducedMotion,
  unlocked,
}: MoonProps) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const moonDust = useRef<THREE.PointsMaterial>(null);
  const viewport = useThree((state) => state.viewport);
  const pulseAge = useRef(10);
  const previousPulse = useRef(pulseToken);
  const dustCount = quality === "high" ? 54 : quality === "medium" ? 38 : 24;
  const dustGeometry = useMemo(() => {
    const random = createRandom(20727);
    const positions = new Float32Array(dustCount * 3);

    for (let index = 0; index < dustCount; index += 1) {
      const offset = index * 3;
      const angle = random() * Math.PI * 2;
      const radius = 0.85 + random() * 1.05;
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = Math.sin(angle) * radius;
      positions[offset + 2] = (random() - 0.5) * 0.65;
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return nextGeometry;
  }, [dustCount]);

  useEffect(() => () => dustGeometry.dispose(), [dustGeometry]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !glow.current || !moonDust.current) {
      return;
    }

    const safeDelta = Math.min(delta, 0.05);
    if (previousPulse.current !== pulseToken) {
      previousPulse.current = pulseToken;
      pulseAge.current = 0;
    }
    pulseAge.current += safeDelta;

    const pulse =
      pulseAge.current < 1.8
        ? Math.sin((pulseAge.current / 1.8) * Math.PI) * (reducedMotion ? 0.04 : 0.11)
        : 0;
    const drift = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.22) * 0.04;
    const moonScale = 0.72 + progress * 0.035 + (celebration ? 0.045 : 0) + pulse;
    const targetX = viewport.width * 0.33;
    const targetY = viewport.height * 0.31 + drift;

    if (reducedMotion) {
      group.current.position.set(targetX, targetY, -2.8);
      group.current.scale.setScalar(moonScale);
      glow.current.opacity = 0.075 + (unlocked ? 0.045 : 0) + progress * 0.035 + pulse * 0.5;
      moonDust.current.opacity = pulseAge.current < 2.2 ? 0.42 : 0;
      return;
    }

    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 3, safeDelta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 3, safeDelta);
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, moonScale, 4, safeDelta),
    );
    glow.current.opacity = 0.075 + (unlocked ? 0.045 : 0) + progress * 0.035 + pulse * 0.5;
    moonDust.current.opacity =
      pulseAge.current < 2.2
        ? Math.max(0, Math.sin((pulseAge.current / 2.2) * Math.PI)) * 0.68
        : 0;
  });

  return (
    <group ref={group} position={[2, 2, -2.8]} scale={0.72}>
      <pointLight
        color={celebration ? palette.auroraPink : palette.lavender}
        distance={8}
        intensity={(unlocked ? 1.15 : 0.52) + progress * 0.45}
      />
      <mesh>
        <sphereGeometry args={[0.72, quality === "low" ? 20 : 28, quality === "low" ? 12 : 18]} />
        <meshStandardMaterial
          color={palette.softWhite}
          emissive={celebration ? palette.auroraPink : palette.royalViolet}
          emissiveIntensity={(unlocked ? 0.52 : 0.3) + progress * 0.18}
          roughness={0.78}
        />
      </mesh>
      <mesh scale={1.36}>
        <sphereGeometry args={[0.72, 18, 12]} />
        <meshBasicMaterial
          ref={glow}
          blending={THREE.AdditiveBlending}
          color={celebration ? palette.auroraPink : palette.lavender}
          depthWrite={false}
          opacity={0.08}
          side={THREE.BackSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <points geometry={dustGeometry}>
        <pointsMaterial
          ref={moonDust}
          blending={THREE.AdditiveBlending}
          color={palette.softWhite}
          depthWrite={false}
          opacity={0}
          size={quality === "low" ? 0.032 : 0.026}
          sizeAttenuation
          toneMapped={false}
          transparent
        />
      </points>
    </group>
  );
}

function WorldScene({
  active,
  celebration,
  moonPulse,
  onPerformanceDrop,
  progress,
  palette,
  quality,
  reducedMotion,
  reportContextLoss,
  unlocked,
}: WorldSceneProps) {
  const starCount = quality === "high" ? 310 : quality === "medium" ? 205 : 118;
  const dustCount = quality === "high" ? 112 : quality === "medium" ? 72 : 42;
  const normalizedProgress = clamp01(progress);
  const starOpacity = 0.2 + (unlocked ? 0.36 : 0) + normalizedProgress * 0.16;
  const dustOpacity = 0.12 + (unlocked ? 0.13 : 0) + (celebration ? 0.13 : 0);

  return (
    <>
      <color attach="background" args={[palette.midnightBlack]} />
      <fog attach="fog" args={[palette.midnightBlack, 8, 24]} />
      <ambientLight color={palette.deepPurple} intensity={0.22 + normalizedProgress * 0.08} />
      <directionalLight color={palette.lavender} intensity={0.26} position={[-4, 5, 4]} />

      <ParticleField
        color={palette.softWhite}
        count={starCount}
        depth={18}
        height={14}
        opacity={starOpacity}
        reducedMotion={reducedMotion}
        seed={2707}
        size={quality === "low" ? 0.024 : 0.021}
        speed={0.38}
        width={18}
      />
      <ParticleField
        color={celebration ? palette.auroraPink : palette.lavender}
        count={Math.round(dustCount * (celebration ? 1.2 : 1))}
        depth={9}
        height={10}
        opacity={dustOpacity}
        reducedMotion={reducedMotion}
        seed={727}
        size={quality === "low" ? 0.036 : 0.03}
        speed={0.72}
        width={13}
      />

      <group position={[0, -0.55, -3.8]}>
        <AuroraRibbon
          celebration={celebration}
          colorA={palette.auroraBlue}
          colorB={palette.royalViolet}
          opacity={0.74}
          phase={0.7}
          position={[-0.25, 0.2, -0.5]}
          progress={normalizedProgress}
          reducedMotion={reducedMotion}
          rotation={-0.08}
          scale={[1.18, 0.88, 1]}
          unlocked={unlocked}
        />
        <AuroraRibbon
          celebration={celebration}
          colorA={palette.deepPurple}
          colorB={palette.auroraPink}
          opacity={0.64}
          phase={2.6}
          position={[0.45, -0.55, -0.9]}
          progress={normalizedProgress}
          reducedMotion={reducedMotion}
          rotation={0.13}
          scale={[1.05, 0.72, 1]}
          unlocked={unlocked}
        />
        {quality !== "low" ? (
          <AuroraRibbon
            celebration={celebration}
            colorA={palette.auroraBlue}
            colorB={palette.lavender}
            opacity={0.46}
            phase={4.4}
            position={[-0.55, 0.82, -1.3]}
            progress={normalizedProgress}
            reducedMotion={reducedMotion}
            rotation={-0.2}
            scale={[0.92, 0.58, 1]}
            unlocked={unlocked}
          />
        ) : null}
      </group>

      <Moon
        celebration={celebration}
        palette={palette}
        progress={normalizedProgress}
        pulseToken={moonPulse}
        quality={quality}
        reducedMotion={reducedMotion}
        unlocked={unlocked}
      />
      <CameraRig
        active={active}
        progress={normalizedProgress}
        reducedMotion={reducedMotion}
        unlocked={unlocked}
      />
      <PerformanceGovernor
        enabled={active && !reducedMotion && quality !== "low"}
        onPerformanceDrop={onPerformanceDrop}
      />
      <WebGLContextGuard onContextLoss={reportContextLoss} />
    </>
  );
}

export function AuroraWorld({
  celebration,
  moonLabel = "Touch the moon",
  onMoonInteract,
  palette,
  progress,
  unlocked,
}: AuroraWorldProps) {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<QualityTier>("low");
  const [runtimeDegraded, setRuntimeDegraded] = useState(false);
  const [moonPulse, setMoonPulse] = useState(0);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const normalizedProgress = clamp01(progress);

  useEffect(() => {
    const initializationFrame = window.requestAnimationFrame(() => {
      setQuality(getInitialQuality());
      setWebGLAvailable(supportsWebGL());
    });

    return () => window.cancelAnimationFrame(initializationFrame);
  }, []);

  const effectiveQuality: QualityTier =
    reducedMotion || runtimeDegraded ? "low" : quality;
  const handlePerformanceDrop = useCallback(() => setRuntimeDegraded(true), []);
  const handleContextLoss = useCallback(() => setWebGLAvailable(false), []);
  const handleMoonInteract = useCallback(() => {
    setMoonPulse((currentPulse) => currentPulse + 1);
    onMoonInteract?.();
  }, [onMoonInteract]);
  const fallback = (
    <SceneFallback
      celebration={celebration}
      progress={normalizedProgress}
      reducedMotion={reducedMotion}
      unlocked={unlocked}
    />
  );

  return (
    <>
      <div className={styles.world} data-quality={effectiveQuality}>
        {webGLAvailable ? (
          <WebGLBoundary fallback={fallback}>
            <Canvas
              aria-hidden="true"
              camera={{ far: 40, fov: 48, near: 0.1, position: [0, 0, 8] }}
              className={styles.canvas}
              dpr={[
                1,
                effectiveQuality === "high" ? 1.55 : effectiveQuality === "medium" ? 1.3 : 1,
              ]}
              frameloop={pageVisible && !reducedMotion ? "always" : "demand"}
              gl={{
                alpha: false,
                antialias: effectiveQuality !== "low",
                powerPreference: "high-performance",
                stencil: false,
              }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
              }}
            >
              <WorldScene
                active={pageVisible}
                celebration={celebration}
                moonPulse={moonPulse}
                onPerformanceDrop={handlePerformanceDrop}
                palette={palette}
                progress={normalizedProgress}
                quality={effectiveQuality}
                reducedMotion={reducedMotion}
                reportContextLoss={handleContextLoss}
                unlocked={unlocked}
              />
            </Canvas>
          </WebGLBoundary>
        ) : (
          fallback
        )}
      </div>
      <button
        aria-hidden={!unlocked}
        aria-label={moonLabel}
        className={styles.moonButton}
        disabled={!unlocked}
        onClick={handleMoonInteract}
        tabIndex={unlocked ? 0 : -1}
        type="button"
      >
        <span className={styles.srOnly}>{moonLabel}</span>
      </button>
    </>
  );
}

export default AuroraWorld;
