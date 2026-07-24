import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CelMaterial } from '../../shaders/CelMaterial';

export interface Character3DProps {
  type?: 'STUDENT' | 'LECTURER' | 'BOSS_WILLY' | 'NUSA' | 'BINA';
  nameLabel?: string;
  state?: 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'search' | 'stunned' | 'cured';
  isZombie?: boolean;
  isInjecting?: boolean;
  injectionProgress?: number; // 0 to 100
  position?: [number, number, number];
  rotationY?: number;
  onClick?: (e: any) => void;
}

export function Character3D({
  type = 'STUDENT',
  nameLabel,
  state = 'idle',
  isZombie = true,
  isInjecting = false,
  injectionProgress = 0,
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

  // ── Full Humanoid 3D Voxel Walk Cycles & Animations ──
  useFrame((stateCtx) => {
    if (!groupRef.current) return;
    const time = stateCtx.clock.getElapsedTime();

    if (isInjecting) {
      // Tremor during injection
      const vibrate = Math.sin(time * 30) * 0.03;
      groupRef.current.position.x = vibrate;
      groupRef.current.position.z = vibrate;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.8 + Math.sin(time * 20) * 0.1;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.8 - Math.sin(time * 20) * 0.1;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * 15) * 0.1;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time * 15) * 0.1;
    } else if (state === 'chase' || state === 'attack') {
      // Aggressive Sprint Stride
      const stride = Math.sin(time * 12) * 0.7;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.9 + 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = stride * 0.9 + 0.4;
      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;
      if (headRef.current) headRef.current.rotation.y = Math.sin(time * 12) * 0.05;
      groupRef.current.position.y = Math.abs(Math.sin(time * 12)) * 0.08;
    } else if (state === 'wander' || state === 'search') {
      // Humanoid Walking Stride
      const stride = Math.sin(time * 6) * 0.45;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.7 + 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.x = stride * 0.7 + 0.3;
      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;
      if (headRef.current) headRef.current.rotation.y = Math.sin(time * 3) * 0.15;
      groupRef.current.position.y = Math.abs(Math.sin(time * 6)) * 0.04;
    } else if (isCured) {
      // Friendly Humanoid Standing Sway / Wave
      const wave = Math.sin(time * 3) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.PI / 3 + wave;
      if (leftArmRef.current) leftArmRef.current.rotation.z = -wave * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    } else {
      // Humanoid Idle Breath / Breathing Sway
      const sway = Math.sin(time * 2.5) * 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.3 + sway * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.3 - sway * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = sway * 0.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -sway * 0.2;
      if (headRef.current) headRef.current.rotation.y = Math.cos(time * 1.5) * 0.12;
      groupRef.current.position.y = Math.sin(time * 2.5) * 0.015;
    }
  });

  // Color scheme based on character state (Cured Healthy vs Injected Aura vs Infected Zombie)
  let shirtColor = '#ffffff';
  let pantsColor = '#1e3a8a';
  let hairColor = '#3b82f6';
  let skinColor = isCured ? '#fde047' : isInjecting ? '#67e8f9' : '#4fa773';

  if (type === 'LECTURER') {
    shirtColor = isCured ? '#1e293b' : isInjecting ? '#0e7490' : '#334155';
    pantsColor = '#0f172a';
    hairColor = '#475569';
  } else if (type === 'BOSS_WILLY') {
    shirtColor = isCured ? '#020617' : isInjecting ? '#a21caf' : '#991b1b';
    pantsColor = '#020617';
    hairColor = '#7f1d1d';
  } else if (type === 'NUSA') {
    shirtColor = '#0284c7';
    pantsColor = '#1e293b';
    hairColor = '#fbbf24';
  }

  const progressRatio = Math.min(1.0, Math.max(0, injectionProgress / 100));

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} onClick={onClick}>
      {/* ── Voxel Torso & Shirt Collar ── */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.52, 0.72, 0.32]} />
        <CelMaterial color={shirtColor} />
      </mesh>
      {/* Collar accent */}
      <mesh position={[0, 1.22, 0.16]}>
        <boxGeometry args={[0.26, 0.08, 0.02]} />
        <CelMaterial color="#ffffff" />
      </mesh>
      {/* Waist belt */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.54, 0.08, 0.34]} />
        <CelMaterial color="#1e293b" />
      </mesh>

      {/* ── Jointed Legs & Shoes ── */}
      <group ref={leftLegRef} position={[-0.15, 0.55, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.55, 0.2]} />
          <CelMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.52, 0.04]}>
          <boxGeometry args={[0.21, 0.1, 0.28]} />
          <CelMaterial color="#0f172a" />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.15, 0.55, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.55, 0.2]} />
          <CelMaterial color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.52, 0.04]}>
          <boxGeometry args={[0.21, 0.1, 0.28]} />
          <CelMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* ── Jointed Arms & Sleeves ── */}
      <group ref={leftArmRef} position={[-0.32, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.18, 0.55, 0.18]} />
          <CelMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.16]} />
          <CelMaterial color={skinColor} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.32, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.18, 0.55, 0.18]} />
          <CelMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.16]} />
          <CelMaterial color={skinColor} />
        </mesh>
      </group>

      {/* ── Head & Facial Features ── */}
      <group ref={headRef} position={[0, 1.48, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <CelMaterial color={skinColor} />
        </mesh>

        <mesh position={[0, 0.22, 0]}>
          <coneGeometry args={[0.28, 0.25, 8]} />
          <CelMaterial color={hairColor} />
        </mesh>

        {type === 'LECTURER' && (
          <mesh position={[0, 0.02, 0.22]}>
            <boxGeometry args={[0.34, 0.08, 0.04]} />
            <CelMaterial color="#0f172a" />
          </mesh>
        )}

        {type === 'BOSS_WILLY' && (
          <mesh position={[0, -0.3, 0.18]}>
            <boxGeometry args={[0.08, 0.35, 0.02]} />
            <CelMaterial color="#dc2626" />
          </mesh>
        )}

        <group position={[0, 0.02, 0.22]}>
          <mesh position={[-0.1, 0, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={isCured ? '#0284c7' : isInjecting ? '#facc15' : '#ef4444'} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={isCured ? '#0284c7' : isInjecting ? '#facc15' : '#ef4444'} />
          </mesh>
        </group>
      </group>

      {/* ── 3D INDIVIDUAL INJECTION PROGRESS RING & PARTICLES ── */}
      {isInjecting && (
        <group position={[0, 2.25, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45, 0.06, 16, 32, progressRatio * Math.PI * 2]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {[0, 1.5, 3.1, 4.7].map((angle, i) => (
            <mesh key={i} position={[Math.cos(angle) * 0.5, Math.sin(angle) * 0.1, Math.sin(angle) * 0.5]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#4ade80" />
            </mesh>
          ))}
        </group>
      )}

      {/* ── HIGH-VISIBILITY FLOATING STATUS BADGE & OVERHEAD NAME LABEL ── */}
      {isZombie && (
        <group position={[0, isInjecting ? 2.6 : 2.1, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.8, 0.45]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.82} />
          </mesh>
          <Text
            position={[0, 0.08, 0.01]}
            fontSize={0.16}
            color={isCured ? '#4ade80' : isInjecting ? '#facc15' : '#f87171'}
            anchorX="center"
            anchorY="middle"
          >
            {nameLabel || (type === 'BOSS_WILLY' ? 'Boss Willy' : type === 'LECTURER' ? 'Dosen Zombie' : 'Mahasiswa Zombie')}
          </Text>
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.12}
            color={isCured ? '#38bdf8' : isInjecting ? '#eab308' : '#ef4444'}
            anchorX="center"
            anchorY="middle"
          >
            {isCured ? '✓ STATUS: SEMBUH' : isInjecting ? `⚡ SUNTIK ${Math.round(injectionProgress)}%` : '⚠️ STATUS: ZOMBIE'}
          </Text>
        </group>
      )}
    </group>
  );
}
