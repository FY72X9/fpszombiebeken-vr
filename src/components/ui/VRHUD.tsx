import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';

export function VRHUD() {
  const session = useXR((s) => s.session);
  const isPresenting = !!session;
  const { camera } = useThree();

  const hudGroupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Quaternion());

  const health = useGameStore((s) => s.player.health);
  const maxHealth = useGameStore((s) => s.player.maxHealth);
  const inventory = useGameStore((s) => s.player.inventory);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const detectionMsg = useGameStore((s) => s.lastDetectionMessage);
  const cureState = useGameStore((s) => s.cure);
  const nusaState = useGameStore((s) => s.nusa);

  const antidoteCount = inventory.find((i) => i.type === 'antidote')?.count || 0;
  const lecturersCuredCount = (cureState.indiCured ? 1 : 0) + (cureState.gatotCured ? 1 : 0);

  useFrame(() => {
    if (!isPresenting || !hudGroupRef.current) return;

    // Position HUD slightly below & in front of VR camera view
    camera.getWorldPosition(targetPos.current);
    camera.getWorldQuaternion(targetRot.current);

    // Apply offset relative to VR camera view [x=0, y=-0.28, z=-1.0]
    const offset = new THREE.Vector3(0, -0.28, -1.0).applyQuaternion(targetRot.current);
    targetPos.current.add(offset);

    // Smoothly lerp HUD position & orientation to follow head movement comfortably
    hudGroupRef.current.position.lerp(targetPos.current, 0.15);
    hudGroupRef.current.quaternion.slerp(targetRot.current, 0.15);
  });

  if (!isPresenting) return null;

  const hpRatio = Math.max(0, Math.min(1, health / maxHealth));
  const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
  const threatLabel = threatLevel === 0 ? '🟢 AMAN' : threatLevel === 1 ? '🟡 WASPADA' : threatLevel === 2 ? '🟠 BAHAYA' : '🔴 TEROR';

  return (
    <group ref={hudGroupRef}>
      {/* ── 3D Glassmorphism VR Dashboard Panel Base ── */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.5, 0.55]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.88} />
      </mesh>
      {/* Border Frame */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[1.54, 0.59]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.6} />
      </mesh>

      {/* ── Header: Threat Level & Health Bar ── */}
      <Text position={[-0.65, 0.2, 0.01]} fontSize={0.065} color="#38bdf8" anchorX="left" anchorY="middle">
        FPZOMBIEBEKEN VR HUD
      </Text>
      <Text position={[0.65, 0.2, 0.01]} fontSize={0.065} color="#f87171" anchorX="right" anchorY="middle">
        {threatLabel}
      </Text>

      {/* Health Bar Background */}
      <mesh position={[-0.15, 0.1, 0.01]}>
        <planeGeometry args={[0.9, 0.06]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      {/* Health Bar Fill */}
      <mesh position={[-0.6 + (0.9 * hpRatio) / 2, 0.1, 0.012]}>
        <planeGeometry args={[0.9 * hpRatio, 0.06]} />
        <meshBasicMaterial color={hpColor} />
      </mesh>
      <Text position={[-0.67, 0.1, 0.015]} fontSize={0.055} color="#ffffff" anchorX="right" anchorY="middle">
        ❤️ HP
      </Text>
      <Text position={[0.35, 0.1, 0.015]} fontSize={0.05} color="#ffffff" anchorX="left" anchorY="middle">
        {Math.round(health)} / {maxHealth}
      </Text>

      {/* ── Inventory & Antidote Counter ── */}
      <group position={[-0.65, -0.02, 0.01]}>
        <mesh position={[0.15, 0, 0]}>
          <planeGeometry args={[0.35, 0.08]} />
          <meshBasicMaterial color="#0369a1" />
        </mesh>
        <Text position={[0.15, 0, 0.01]} fontSize={0.05} color="#ffffff" anchorX="center" anchorY="middle">
          🧪 Antidot: {antidoteCount}x
        </Text>
      </group>

      {/* ── Mission Status ── */}
      <Text position={[-0.1, -0.02, 0.01]} fontSize={0.048} color="#e2e8f0" anchorX="left" anchorY="middle">
        Nusa: {nusaState.state === 'following' || nusaState.isRescued ? '✓ SELAMAT' : '❓ KELAS 2A'}
      </Text>
      <Text position={[0.65, -0.02, 0.01]} fontSize={0.048} color="#e2e8f0" anchorX="right" anchorY="middle">
        Dosen: {lecturersCuredCount}/2 | Mahasiswa: {cureState.studentsCured}/4
      </Text>

      {/* ── Dynamic Notification / Prompt Toast Banner ── */}
      {detectionMsg && (
        <group position={[0, -0.16, 0.01]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.42, 0.12]} />
            <meshBasicMaterial color="#1e1b4b" transparent opacity={0.95} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.05} color="#facc15" anchorX="center" anchorY="middle">
            {detectionMsg}
          </Text>
        </group>
      )}
    </group>
  );
}
