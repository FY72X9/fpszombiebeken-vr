import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { CelMaterial } from '../../shaders/CelMaterial';

export function PlayerArms() {
  const groupRef = useRef<THREE.Group>(null);
  const player = useGameStore((s) => s.player);
  const isPresenting = player.isInVR;

  useFrame(({ camera, clock }) => {
    if (!groupRef.current || isPresenting) return;

    // Attach arms group to camera transform
    groupRef.current.position.copy(camera.position);
    groupRef.current.quaternion.copy(camera.quaternion);

    // Subtle idle breathing sway for hands
    const t = clock.getElapsedTime();
    groupRef.current.position.y += Math.sin(t * 2) * 0.005;
    groupRef.current.position.x += Math.cos(t * 1.5) * 0.003;
  });

  if (isPresenting) return null;

  const equippedItem = player.inventory[player.equippedSlot] || { type: 'antidote' };

  return (
    <group ref={groupRef}>
      {/* Right Arm Holding Item (Roblox R6 Blocky Style) */}
      <group position={[0.35, -0.3, -0.5]} rotation={[0.2, -0.3, 0]}>
        {/* Roblox Blocky Sleeve / Forearm */}
        <mesh position={[0, -0.18, 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.11, 0.32, 0.11]} />
          <CelMaterial color="#1e3a8a" />
        </mesh>
        {/* Roblox Blocky Hand */}
        <mesh position={[0, 0.01, -0.07]}>
          <boxGeometry args={[0.095, 0.095, 0.095]} />
          <CelMaterial color="#fde047" />
        </mesh>

        {/* 3D Antidote Syringe Object */}
        {equippedItem.type === 'antidote' && (
          <group position={[0, 0.08, -0.15]} rotation={[Math.PI / 4, 0, 0]}>
            {/* Glass Syringe Barrel */}
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 0.22, 16]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
            {/* Green Antidote Fluid */}
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.14, 16]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            {/* Plunger */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
              <CelMaterial color="#475569" />
            </mesh>
            {/* Metal Needle Tip */}
            <mesh position={[0, -0.13, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.08, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* 3D Handgun Object */}
        {equippedItem.type === 'handgun' && (
          <group position={[0, 0.06, -0.15]} rotation={[0, 0, 0]}>
            {/* Gun Body */}
            <mesh>
              <boxGeometry args={[0.05, 0.08, 0.22]} />
              <CelMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Barrel */}
            <mesh position={[0, 0.03, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.12]} />
              <CelMaterial color="#1e293b" metalness={0.9} />
            </mesh>
          </group>
        )}
      </group>

      {/* Left Arm & Wrist Watch (Roblox R6 Blocky Style) */}
      <group position={[-0.35, -0.32, -0.5]} rotation={[0.3, 0.3, 0]}>
        {/* Roblox Blocky Sleeve / Forearm */}
        <mesh position={[0, -0.18, 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.11, 0.32, 0.11]} />
          <CelMaterial color="#1e3a8a" />
        </mesh>
        {/* Roblox Blocky Hand */}
        <mesh position={[0, 0.01, -0.07]}>
          <boxGeometry args={[0.095, 0.095, 0.095]} />
          <CelMaterial color="#fde047" />
        </mesh>
        {/* 3D Wrist Watch / Scanner */}
        <mesh position={[0, -0.05, 0.02]}>
          <boxGeometry args={[0.12, 0.04, 0.12]} />
          <CelMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  );
}
