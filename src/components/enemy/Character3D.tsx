import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CelMaterial } from '../../shaders/CelMaterial';

export interface Character3DProps {
  type?: 'STUDENT' | 'LECTURER' | 'BOSS_WILLY' | 'NUSA' | 'BINA';
  state?: 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'search' | 'stunned' | 'cured';
  isZombie?: boolean;
  position?: [number, number, number];
  rotationY?: number;
  onClick?: (e: any) => void;
}

export function Character3D({
  type = 'STUDENT',
  state = 'idle',
  isZombie = true,
  position = [0, 0, 0],
  rotationY = 0,
  onClick
}: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const isCured = state === 'cured' || !isZombie;

  // Jointed Minecraft/Multi-Animation Voxel Walk Cycles
  useFrame((stateCtx) => {
    if (!groupRef.current) return;
    const time = stateCtx.clock.getElapsedTime();

    if (state === 'chase' || state === 'attack') {
      const swing = Math.sin(time * 10) * 0.6;
      if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -swing * 0.7;
      if (rightLegRef.current) rightLegRef.current.rotation.x = swing * 0.7;

      groupRef.current.position.y = Math.abs(Math.sin(time * 10)) * 0.08;
    } else if (isCured) {
      // Peaceful Idle Sway / Wave
      const wave = Math.sin(time * 2) * 0.1;
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.PI / 4 + wave;
      if (leftArmRef.current) leftArmRef.current.rotation.z = -wave;
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    } else {
      // Zombie Idle Wander
      const wander = Math.sin(time * 3) * 0.2;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.5 + wander * 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.5 - wander * 0.3;
    }
  });

  // Color scheme: Cured Healthy vs Infected Zombie
  let shirtColor = '#ffffff';
  let pantsColor = '#1e3a8a';
  let hairColor = '#3b82f6';
  let skinColor = isCured ? '#fde047' : '#86efac';

  if (type === 'LECTURER') {
    shirtColor = isCured ? '#1e293b' : '#334155';
    pantsColor = '#0f172a';
    hairColor = '#475569';
  } else if (type === 'BOSS_WILLY') {
    shirtColor = isCured ? '#020617' : '#991b1b';
    pantsColor = '#020617';
    hairColor = '#7f1d1d';
  } else if (type === 'NUSA') {
    shirtColor = '#0284c7';
    pantsColor = '#1e293b';
    hairColor = '#fbbf24';
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} onClick={onClick}>
      {/* Voxel Torso / Suit Jacket */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.52, 0.72, 0.32]} />
        <CelMaterial color={shirtColor} />
      </mesh>

      {/* Jointed Left Leg */}
      <group ref={leftLegRef} position={[-0.15, 0.55, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.2, 0.55, 0.2]} />
          <CelMaterial color={pantsColor} />
        </mesh>
      </group>

      {/* Jointed Right Leg */}
      <group ref={rightLegRef} position={[0.15, 0.55, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.2, 0.55, 0.2]} />
          <CelMaterial color={pantsColor} />
        </mesh>
      </group>

      {/* Jointed Left Arm */}
      <group ref={leftArmRef} position={[-0.32, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.18, 0.55, 0.18]} />
          <CelMaterial color={shirtColor} />
        </mesh>
      </group>

      {/* Jointed Right Arm */}
      <group ref={rightArmRef} position={[0.32, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.18, 0.55, 0.18]} />
          <CelMaterial color={shirtColor} />
        </mesh>
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 1.48, 0]}>
        {/* Head Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <CelMaterial color={skinColor} />
        </mesh>

        {/* Anime Hair Spikes */}
        <mesh position={[0, 0.22, 0]}>
          <coneGeometry args={[0.28, 0.25, 8]} />
          <CelMaterial color={hairColor} />
        </mesh>

        {/* Glasses for Lecturer */}
        {type === 'LECTURER' && (
          <mesh position={[0, 0.02, 0.22]}>
            <boxGeometry args={[0.34, 0.08, 0.04]} />
            <CelMaterial color="#0f172a" />
          </mesh>
        )}

        {/* Red Tie for Boss Willy */}
        {type === 'BOSS_WILLY' && (
          <mesh position={[0, -0.3, 0.18]}>
            <boxGeometry args={[0.08, 0.35, 0.02]} />
            <CelMaterial color="#dc2626" />
          </mesh>
        )}

        {/* Eyes: Glowing Red for Zombie vs Blue for Cured Human */}
        <group position={[0, 0.02, 0.22]}>
          <mesh position={[-0.1, 0, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={isCured ? '#0284c7' : '#ef4444'} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={isCured ? '#0284c7' : '#ef4444'} />
          </mesh>
        </group>
      </group>

      {/* High-Visibility Floating Badge: CURED - SURVIVOR vs ZOMBIE INFECTED */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[1.2, 0.22, 0.02]} />
        <meshBasicMaterial color={isCured ? '#22c55e' : '#dc2626'} />
      </mesh>
    </group>
  );
}
