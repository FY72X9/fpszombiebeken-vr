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
  const headRef = useRef<THREE.Group>(null);

  useFrame((stateCtx) => {
    if (!groupRef.current) return;
    const time = stateCtx.clock.getElapsedTime();

    // Idle breathing & wobble animation
    if (state === 'idle' || state === 'wander') {
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    } else if (state === 'chase' || state === 'attack') {
      groupRef.current.position.y = Math.abs(Math.sin(time * 8)) * 0.08;
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(time * 10) * 0.1;
      }
    } else if (state === 'stunned') {
      groupRef.current.rotation.z = Math.sin(time * 12) * 0.15;
    }
  });

  // Color scheme based on character reference from assets/samples/characters
  const isCured = state === 'cured';
  const zombieColor = '#dc2626';

  let shirtColor = '#ffffff';
  let pantsColor = '#1e3a8a';
  let hairColor = '#3b82f6';
  let skinColor = isZombie && !isCured ? '#86efac' : '#fde047';

  if (type === 'LECTURER') {
    shirtColor = '#1e293b'; // Lecturer suit jacket
    pantsColor = '#334155';
    hairColor = '#475569';
  } else if (type === 'BOSS_WILLY') {
    shirtColor = '#0f172a'; // Boss Willy executive suit
    pantsColor = '#020617';
    hairColor = '#991b1b';
  } else if (type === 'NUSA') {
    shirtColor = '#0284c7';
    pantsColor = '#1e293b';
    hairColor = '#fbbf24';
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} onClick={onClick}>
      {/* Torso / Shirt */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <CelMaterial color={isZombie && !isCured ? zombieColor : shirtColor} />
      </mesh>

      {/* Legs & Trousers */}
      <mesh position={[-0.15, 0.35, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.7]} />
        <CelMaterial color={pantsColor} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.7]} />
        <CelMaterial color={pantsColor} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.15, 0.04, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <CelMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.15, 0.04, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <CelMaterial color="#0f172a" />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.32, 0.85, 0]} rotation={[state === 'chase' ? 0.8 : 0, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.6]} />
        <CelMaterial color={shirtColor} />
      </mesh>
      <mesh position={[0.32, 0.85, 0]} rotation={[state === 'chase' ? 0.8 : 0, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.6]} />
        <CelMaterial color={shirtColor} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 1.45, 0]}>
        {/* Face */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <CelMaterial color={skinColor} />
        </mesh>

        {/* Anime Hair Top */}
        <mesh position={[0, 0.12, 0]}>
          <coneGeometry args={[0.26, 0.3, 16]} />
          <CelMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.12, 0.1, 0.1]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <CelMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.12, 0.1, 0.1]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <CelMaterial color={hairColor} />
        </mesh>

        {/* Glasses for Lecturer */}
        {type === 'LECTURER' && (
          <mesh position={[0, 0.02, 0.2]}>
            <boxGeometry args={[0.3, 0.08, 0.04]} />
            <CelMaterial color="#0f172a" />
          </mesh>
        )}

        {/* Red Tie for Boss Willy */}
        {type === 'BOSS_WILLY' && (
          <mesh position={[0, -0.3, 0.16]}>
            <boxGeometry args={[0.08, 0.35, 0.02]} />
            <CelMaterial color="#dc2626" />
          </mesh>
        )}

        {/* Glowing Eyes for Zombie */}
        {isZombie && !isCured && (
          <group position={[0, 0.02, 0.2]}>
            <mesh position={[-0.08, 0, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.08, 0, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        )}
      </group>

      {/* State Badge Label */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[1.0, 0.2, 0.02]} />
        <meshBasicMaterial color={isCured ? '#22c55e' : isZombie ? '#dc2626' : '#0284c7'} />
      </mesh>
    </group>
  );
}
