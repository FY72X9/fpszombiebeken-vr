import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';

// Custom Shader Material for Smooth Peripheral Vignette
const VignetteShader = {
  uniforms: {
    uIntensity: { value: 0.0 },
    uRadius: { value: 0.45 },
    uSmoothness: { value: 0.3 },
    uColor: { value: new THREE.Color(0x020617) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uIntensity;
    uniform float uRadius;
    uniform float uSmoothness;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      vec2 center = vUv - vec2(0.5);
      // Center distance 0 to ~1
      float dist = length(center) * 2.0;
      float vignette = smoothstep(uRadius, uRadius + uSmoothness, dist);
      float alpha = clamp(vignette * uIntensity, 0.0, 1.0);
      gl_FragColor = vec4(uColor, alpha);
    }
  `
};

interface ComfortVignetteProps {
  motionIntensity?: number; // External motion intensity override 0..1
  snapPulse?: boolean; // Signal when snap turn occurs
}

export function ComfortVignette({ motionIntensity = 0, snapPulse = false }: ComfortVignetteProps) {
  const session = useXR((s) => s.session);
  const isPresenting = !!session;
  const { camera } = useThree();

  const meshRef = useRef<THREE.Mesh>(null);
  const currentIntensity = useRef(0.0);
  const snapPulseTimer = useRef(0.0);

  const comfortLevel = useGameStore((s) => s.accessibility.comfortVignette);

  // Material instance
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(VignetteShader.uniforms),
      vertexShader: VignetteShader.vertexShader,
      fragmentShader: VignetteShader.fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }, []);

  // Update radius and max opacity based on comfort settings
  useEffect(() => {
    let radius = 0.48;
    let smoothness = 0.32;

    switch (comfortLevel) {
      case 'high':
        radius = 0.36;
        smoothness = 0.28;
        break;
      case 'medium':
        radius = 0.48;
        smoothness = 0.32;
        break;
      case 'low':
        radius = 0.60;
        smoothness = 0.35;
        break;
      case 'off':
      default:
        radius = 0.80;
        smoothness = 0.20;
        break;
    }

    material.uniforms.uRadius.value = radius;
    material.uniforms.uSmoothness.value = smoothness;
  }, [comfortLevel, material]);

  // Handle snap pulse trigger
  useEffect(() => {
    if (snapPulse && comfortLevel !== 'off') {
      snapPulseTimer.current = 0.18; // 180ms pulse duration
    }
  }, [snapPulse, comfortLevel]);

  useFrame((_, delta) => {
    if (!meshRef.current || !isPresenting || comfortLevel === 'off') {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;

    // Attach quad in front of VR Camera
    const forward = new THREE.Vector3(0, 0, -0.22);
    forward.applyQuaternion(camera.quaternion);
    meshRef.current.position.copy(camera.position).add(forward);
    meshRef.current.quaternion.copy(camera.quaternion);

    // Calculate target intensity
    let maxAlpha = 0.75;
    if (comfortLevel === 'high') maxAlpha = 0.92;
    if (comfortLevel === 'low') maxAlpha = 0.48;

    let target = motionIntensity * maxAlpha;

    // Add snap turn pulse
    if (snapPulseTimer.current > 0) {
      snapPulseTimer.current = Math.max(0, snapPulseTimer.current - delta);
      target = Math.max(target, maxAlpha * 0.95);
    }

    // Smooth attack and release
    const lerpSpeed = target > currentIntensity.current ? 16.0 : 8.0;
    currentIntensity.current = THREE.MathUtils.lerp(
      currentIntensity.current,
      target,
      Math.min(1, delta * lerpSpeed)
    );

    material.uniforms.uIntensity.value = currentIntensity.current;
  });

  if (!isPresenting || comfortLevel === 'off') return null;

  return (
    <mesh ref={meshRef} material={material} renderOrder={9999}>
      <planeGeometry args={[0.7, 0.7]} />
    </mesh>
  );
}
