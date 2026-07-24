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

    // Front-top offset [x=0, y=0.34, z=-1.0] relative to VR camera orientation
    const offset = new THREE.Vector3(0, 0.34, -1.0).applyQuaternion(targetRot.current);
    targetPos.current.add(offset);

    // Slightly tilt HUD downwards towards camera line of sight (-0.14 rad / ~8 degrees)
    const tiltRot = targetRot.current.clone().multiply(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.14)
    );

    // Smoothly lerp HUD position & rotation for fluid movement
    hudGroupRef.current.position.lerp(targetPos.current, 0.15);
    hudGroupRef.current.quaternion.slerp(tiltRot, 0.15);
  });

  if (!isPresenting) return null;

  const hpRatio = Math.max(0, Math.min(1, health / maxHealth));
  const stmRatio = Math.max(0, Math.min(1, stamina / maxStamina));
  const hpColor = hpRatio > 0.5 ? '#00ff88' : hpRatio > 0.25 ? '#ffd700' : '#ff0055';
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
      {/* ── 1. FUTURISTIC TOP CENTER CONTROL BAR ── */}
      <group position={[0, 0.20, 0]}>
        {/* Background Visor Bar */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.84, 0.075]} />
          <meshBasicMaterial color="#030712" transparent opacity={0.5} />
        </mesh>
        {/* Cyber Neon Top Trim */}
        <mesh position={[0, 0.038, -0.008]}>
          <planeGeometry args={[0.84, 0.004]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        {/* Cyber Neon Bottom Trim */}
        <mesh position={[0, -0.038, -0.008]}>
          <planeGeometry args={[0.84, 0.002]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
        </mesh>

        {/* Exit & Reset Button (Left) */}
        <group
          position={[-0.29, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            handleExitReset();
          }}
          onPointerOver={() => setExitHovered(true)}
          onPointerOut={() => setExitHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.22, 0.05]} />
            <meshBasicMaterial
              color={isAllMissionsComplete ? (exitHovered ? '#00ff88' : '#059669') : (exitHovered ? '#ff0055' : '#9f1239')}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.024} color="#ffffff" anchorX="center" anchorY="middle">
            {isAllMissionsComplete ? '🏆 EXIT & RESET' : '🚪 EXIT VR'}
          </Text>
        </group>

        {/* Center Title & Threat Level Indicator */}
        <group position={[0, 0, 0.01]}>
          <Text position={[0, 0.01, 0]} fontSize={0.026} color="#00f0ff" anchorX="center" anchorY="middle">
            FPZOMBIEBEKEN VR
          </Text>

          <Text position={[0, -0.015, 0]} fontSize={0.022} color="#94a3b8" anchorX="center" anchorY="middle">
            THREAT: {threatLabel}
          </Text>
        </group>

        {/* Toggle Minimize / Expand Button (Right) */}
        <group
          position={[0.29, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          onPointerOver={() => setToggleHovered(true)}
          onPointerOut={() => setToggleHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.18, 0.05]} />
            <meshBasicMaterial color={toggleHovered ? '#0284c7' : '#0369a1'} transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.024} color="#ffffff" anchorX="center" anchorY="middle">
            {isMinimized ? '📖 EXPAND' : '📁 MINI'}
          </Text>
        </group>
      </group>

      {/* ── 2. MINIMIZED ULTRA-COMPACT STRIP VIEW ── */}
      {isMinimized && (
        <group position={[0, 0.11, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.84, 0.05]} />
            <meshBasicMaterial color="#030712" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, -0.025, -0.008]}>
            <planeGeometry args={[0.84, 0.002]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.024} color="#e2e8f0" anchorX="center" anchorY="middle">
            ❤️ {Math.round(health)} HP  |  ⚡ {Math.round(stamina)} STM  |  🧪 {antidoteCount}x  |  📍 {roomTitle}
          </Text>
        </group>
      )}

      {/* ── 3. EXPANDED FUTURISTIC VISOR WINGS (POJOK KANAN & KIRI) ── */}
      {!isMinimized && (
        <>
          {/* ── TOP-LEFT WING: Vitals & Equipment (Pojok Kiri) ── */}
          <group position={[-0.46, -0.04, -0.02]} rotation={[0, 0.14, 0]}>
            {/* Hologram Panel Background */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial color="#030712" transparent opacity={0.4} />
            </mesh>
            {/* Border Outline */}
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.488, 0.288]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
            </mesh>

            {/* Sci-Fi Top Accent Line */}
            <mesh position={[0, 0.138, -0.008]}>
              <planeGeometry args={[0.48, 0.004]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>

            {/* Header Title */}
            <Text position={[-0.21, 0.10, 0.01]} fontSize={0.026} color="#00f0ff" anchorX="left" anchorY="middle">
              VITAL STATUS
            </Text>
            <mesh position={[0, 0.078, 0.008]}>
              <planeGeometry args={[0.42, 0.002]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
            </mesh>

            {/* Health Meter */}
            <Text position={[-0.21, 0.04, 0.01]} fontSize={0.023} color="#ffffff" anchorX="left" anchorY="middle">
              ❤️ HEALTH
            </Text>
            <mesh position={[0.01, 0.04, 0.01]}>
              <planeGeometry args={[0.22, 0.028]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.10 + (0.22 * hpRatio) / 2, 0.04, 0.012]}>
              <planeGeometry args={[0.22 * hpRatio, 0.028]} />
              <meshBasicMaterial color={hpColor} />
            </mesh>
            <Text position={[0.14, 0.04, 0.015]} fontSize={0.022} color="#ffffff" anchorX="left" anchorY="middle">
              {Math.round(health)}
            </Text>

            {/* Stamina Meter */}
            <Text position={[-0.21, -0.01, 0.01]} fontSize={0.023} color="#ffffff" anchorX="left" anchorY="middle">
              ⚡ STAMINA
            </Text>
            <mesh position={[0.01, -0.01, 0.01]}>
              <planeGeometry args={[0.22, 0.028]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.10 + (0.22 * stmRatio) / 2, -0.01, 0.012]}>
              <planeGeometry args={[0.22 * stmRatio, 0.028]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>

            {/* Antidote Syringe Meter */}
            <mesh position={[0, -0.07, 0.01]}>
              <planeGeometry args={[0.42, 0.045]} />
              <meshBasicMaterial color="#0369a1" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, -0.07, 0.008]}>
              <planeGeometry args={[0.424, 0.049]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
            </mesh>
            <Text position={[0, -0.07, 0.015]} fontSize={0.024} color="#ffffff" anchorX="center" anchorY="middle">
              🧪 ANTIDOT SYRINGE: {antidoteCount}x
            </Text>
          </group>

          {/* ── TOP-RIGHT WING: Tactical Matrix & Objectives (Pojok Kanan) ── */}
          <group position={[0.46, -0.04, -0.02]} rotation={[0, -0.14, 0]}>
            {/* Hologram Panel Background */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial color="#030712" transparent opacity={0.4} />
            </mesh>
            {/* Border Outline */}
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.488, 0.288]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
            </mesh>

            {/* Sci-Fi Top Accent Line */}
            <mesh position={[0, 0.138, -0.008]}>
              <planeGeometry args={[0.48, 0.004]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>

            {/* Header Title */}
            <Text position={[-0.21, 0.10, 0.01]} fontSize={0.026} color="#00f0ff" anchorX="left" anchorY="middle">
              TACTICAL MATRIX
            </Text>
            <mesh position={[0, 0.078, 0.008]}>
              <planeGeometry args={[0.42, 0.002]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
            </mesh>

            {/* Location Row */}
            <Text position={[-0.21, 0.04, 0.01]} fontSize={0.023} color="#00f0ff" anchorX="left" anchorY="middle">
              📍 AREA: {roomTitle}
            </Text>

            {/* Nusa Objective */}
            <Text
              position={[-0.21, 0.00, 0.01]}
              fontSize={0.022}
              color={nusaState.isRescued ? '#00ff88' : '#ff0055'}
              anchorX="left"
              anchorY="middle"
            >
              👤 NUSA: {nusaState.isRescued ? '✓ SELAMAT' : '❓ KELAS 2A'}
            </Text>

            {/* Boss Willy Objective */}
            <Text
              position={[-0.21, -0.04, 0.01]}
              fontSize={0.022}
              color={cureState.willyCured ? '#00ff88' : '#ffd700'}
              anchorX="left"
              anchorY="middle"
            >
              🎯 WILLY: {cureState.willyCured ? '✓ SEMBUH' : '❓ RUANG DIREKTUR'}
            </Text>

            {/* Dosen & Mahasiswa Counters */}
            <Text position={[-0.21, -0.08, 0.01]} fontSize={0.022} color="#e2e8f0" anchorX="left" anchorY="middle">
              🏫 DOSEN: {lecturersCuredCount}/2  |  🎓 MHS: {cureState.studentsCured}/4
            </Text>
          </group>
        </>
      )}

      {/* ── 4. DYNAMIC NOTIFICATION TOAST BANNER ── */}
      {detectionMsg && (
        <group position={[0, -0.22, 0.01]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.82, 0.07]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.88} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[0.826, 0.076]} />
            <meshBasicMaterial color="#ffd700" transparent opacity={0.6} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.028} color="#ffd700" anchorX="center" anchorY="middle">
            {detectionMsg}
          </Text>
        </group>
      )}
    </group>
  );
}
