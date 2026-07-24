import { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { ROOM_LABELS } from '../../constants/roomGraph';
import { cancelInjection } from '../../systems/InjectionSystem';

export function VRHUD() {
  const session = useXR((s) => s.session);
  const isPresenting = !!session;
  const { camera } = useThree();

  const hudGroupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Quaternion());

  const [isMinimized, setIsMinimized] = useState(false);
  const [toggleHovered, setToggleHovered] = useState(false);
  const [exitHovered, setExitHovered] = useState(false);

  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const reset = useGameStore((s) => s.reset);
  const health = useGameStore((s) => s.player.health);
  const maxHealth = useGameStore((s) => s.player.maxHealth);
  const stamina = useGameStore((s) => s.player.stamina);
  const maxStamina = useGameStore((s) => s.player.maxStamina);
  const inventory = useGameStore((s) => s.player.inventory);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const detectionMsg = useGameStore((s) => s.lastDetectionMessage);
  const cureState = useGameStore((s) => s.cure);
  const nusaState = useGameStore((s) => s.nusa);
  const currentRoom = useGameStore((s) => s.currentRoom);

  const roomTitle = ROOM_LABELS[currentRoom as keyof typeof ROOM_LABELS] || currentRoom;
  const antidoteCount = inventory.find((i) => i.type === 'antidote')?.count || 0;
  const lecturersCuredCount = (cureState.indiCured ? 1 : 0) + (cureState.gatotCured ? 1 : 0);

  // Win / All Missions Completed condition check
  const isAllMissionsComplete =
    phase === 'win' ||
    (nusaState.isRescued &&
      cureState.willyCured &&
      lecturersCuredCount >= 2 &&
      cureState.studentsCured >= 4);

  useFrame(() => {
    if (!isPresenting || !hudGroupRef.current) return;

    // Position HUD at Front-Top (depan atas) in front of VR camera view
    camera.getWorldPosition(targetPos.current);
    camera.getWorldQuaternion(targetRot.current);

    // Front-top offset [x=0, y=0.35, z=-1.0] relative to VR camera orientation
    const offset = new THREE.Vector3(0, 0.35, -1.0).applyQuaternion(targetRot.current);
    targetPos.current.add(offset);

    // Slightly tilt HUD downwards towards camera line of sight
    const tiltRot = targetRot.current.clone().multiply(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.15)
    );

    // Smoothly lerp HUD position & rotation
    hudGroupRef.current.position.lerp(targetPos.current, 0.15);
    hudGroupRef.current.quaternion.slerp(tiltRot, 0.15);
  });

  if (!isPresenting) return null;

  const hpRatio = Math.max(0, Math.min(1, health / maxHealth));
  const stmRatio = Math.max(0, Math.min(1, stamina / maxStamina));
  const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
  const threatLabel = threatLevel === 0 ? '🟢 AMAN' : threatLevel === 1 ? '🟡 WASPADA' : threatLevel === 2 ? '🟠 BAHAYA' : '🔴 TEROR';

  const handleExitReset = () => {
    if (session) {
      try {
        session.end();
      } catch (e) {
        console.error('Error ending VR session:', e);
      }
    }
    cancelInjection();
    reset();
    setPhase('menu');
  };

  return (
    <group ref={hudGroupRef}>
      {/* ── 1. TOP CENTER HEADER CONTROL BAR ── */}
      <group position={[0, 0.08, 0]}>
        {/* Background pill */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.78, 0.09]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.45} />
        </mesh>
        {/* Border glow */}
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[0.79, 0.1]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
        </mesh>

        <Text position={[-0.36, 0, 0.01]} fontSize={0.038} color="#38bdf8" anchorX="left" anchorY="middle">
          🧟 FPZOMBIEBEKEN VR
        </Text>
        <Text position={[-0.04, 0, 0.01]} fontSize={0.035} color="#f87171" anchorX="left" anchorY="middle">
          {threatLabel}
        </Text>

        {/* Interactive Toggle Minimize / Expand Button */}
        <group
          position={[0.27, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          onPointerOver={() => setToggleHovered(true)}
          onPointerOut={() => setToggleHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.18, 0.06]} />
            <meshBasicMaterial color={toggleHovered ? '#0284c7' : '#0369a1'} transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.03} color="#ffffff" anchorX="center" anchorY="middle">
            {isMinimized ? '📖 Expand' : '📁 Mini'}
          </Text>
        </group>

        {/* Interactive Exit VR & Reset Button */}
        <group
          position={[-0.24, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            handleExitReset();
          }}
          onPointerOver={() => setExitHovered(true)}
          onPointerOut={() => setExitHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.26, 0.06]} />
            <meshBasicMaterial color={isAllMissionsComplete ? (exitHovered ? '#16a34a' : '#15803d') : (exitHovered ? '#dc2626' : '#991b1b')} transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.028} color="#ffffff" anchorX="center" anchorY="middle">
            {isAllMissionsComplete ? '🏆 Exit & Reset' : '🚪 Exit VR & Reset'}
          </Text>
        </group>
      </group>

      {/* ── 2. MINIMIZED SUMMARY VIEW ── */}
      {isMinimized && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.78, 0.06]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.4} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.032} color="#e2e8f0" anchorX="center" anchorY="middle">
            ❤️ {Math.round(health)} HP | ⚡ {Math.round(stamina)} STM | 🧪 {antidoteCount}x | 📍 {roomTitle}
          </Text>
        </group>
      )}

      {/* ── 3. EXPANDED TOP-CORNER PANELS (POJOK KANAN - KIRI) ── */}
      {!isMinimized && (
        <>
          {/* ── TOP-LEFT PANEL: Vitals & Status (Pojok Kiri) ── */}
          <group position={[-0.45, -0.12, 0]}>
            {/* Panel background */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.5, 0.28]} />
              <meshBasicMaterial color="#020617" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.51, 0.29]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
            </mesh>

            {/* HP Bar */}
            <Text position={[-0.22, 0.09, 0.01]} fontSize={0.035} color="#ffffff" anchorX="left" anchorY="middle">
              ❤️ HP
            </Text>
            <mesh position={[0.02, 0.09, 0.01]}>
              <planeGeometry args={[0.26, 0.035]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-0.11 + (0.26 * hpRatio) / 2, 0.09, 0.012]}>
              <planeGeometry args={[0.26 * hpRatio, 0.035]} />
              <meshBasicMaterial color={hpColor} />
            </mesh>
            <Text position={[0.16, 0.09, 0.015]} fontSize={0.028} color="#ffffff" anchorX="left" anchorY="middle">
              {Math.round(health)}
            </Text>

            {/* Stamina Bar */}
            <Text position={[-0.22, 0.03, 0.01]} fontSize={0.035} color="#ffffff" anchorX="left" anchorY="middle">
              ⚡ STM
            </Text>
            <mesh position={[0.02, 0.03, 0.01]}>
              <planeGeometry args={[0.26, 0.035]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-0.11 + (0.26 * stmRatio) / 2, 0.03, 0.012]}>
              <planeGeometry args={[0.26 * stmRatio, 0.035]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>

            {/* Antidote Syringe Count */}
            <mesh position={[-0.05, -0.05, 0.01]}>
              <planeGeometry args={[0.34, 0.05]} />
              <meshBasicMaterial color="#0369a1" transparent opacity={0.65} />
            </mesh>
            <Text position={[-0.05, -0.05, 0.015]} fontSize={0.032} color="#ffffff" anchorX="center" anchorY="middle">
              🧪 Antidot: {antidoteCount}x
            </Text>
          </group>

          {/* ── TOP-RIGHT PANEL: Mission Checklist & Location (Pojok Kanan) ── */}
          <group position={[0.45, -0.12, 0]}>
            {/* Panel background */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.5, 0.28]} />
              <meshBasicMaterial color="#020617" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.51, 0.29]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
            </mesh>

            <Text position={[-0.22, 0.09, 0.01]} fontSize={0.032} color="#38bdf8" anchorX="left" anchorY="middle">
              📍 {roomTitle}
            </Text>
            <Text position={[-0.22, 0.04, 0.01]} fontSize={0.028} color={nusaState.isRescued ? '#4ade80' : '#f87171'} anchorX="left" anchorY="middle">
              👤 Nusa: {nusaState.isRescued ? '✓ Selamat' : '❓ Kelas 2A'}
            </Text>
            <Text position={[-0.22, -0.01, 0.01]} fontSize={0.028} color={cureState.willyCured ? '#4ade80' : '#fbbf24'} anchorX="left" anchorY="middle">
              🎯 Boss Willy: {cureState.willyCured ? '✓ Sembuh' : '❓ Ruang Direktur'}
            </Text>
            <Text position={[-0.22, -0.06, 0.01]} fontSize={0.028} color="#e2e8f0" anchorX="left" anchorY="middle">
              🏫 Dosen: {lecturersCuredCount}/2 | 🎓 Mhs: {cureState.studentsCured}/4
            </Text>
          </group>
        </>
      )}

      {/* ── 4. DYNAMIC NOTIFICATION TOAST ── */}
      {detectionMsg && (
        <group position={[0, -0.32, 0.01]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.82, 0.08]} />
            <meshBasicMaterial color="#1e1b4b" transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.032} color="#facc15" anchorX="center" anchorY="middle">
            {detectionMsg}
          </Text>
        </group>
      )}
    </group>
  );
}
