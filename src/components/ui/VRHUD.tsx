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
  const [hudTab, setHudTab] = useState<'status' | 'comfort'>('status');
  const [toggleHovered, setToggleHovered] = useState(false);
  const [comfortHovered, setComfortHovered] = useState(false);
  const [exitHovered, setExitHovered] = useState(false);

  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const reset = useGameStore((s) => s.reset);
  const accessibility = useGameStore((s) => s.accessibility);
  const updateAccessibility = useGameStore((s) => s.updateAccessibility);
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
  const antidoteCount = inventory.filter((i) => i.type === 'antidote').reduce((acc, cur) => acc + (cur.count || 1), 0);
  const lecturersCuredCount = (cureState.indiCured ? 1 : 0) + (cureState.willyCured ? 1 : 0);

  // Win / All Missions Completed condition check
  const isAllMissionsComplete =
    phase === 'win' ||
    (nusaState.isRescued &&
      cureState.gatotCured &&
      lecturersCuredCount >= 2 &&
      cureState.studentsCured >= 4);

  useFrame(() => {
    if (!isPresenting || !hudGroupRef.current) return;

    camera.getWorldPosition(targetPos.current);
    camera.getWorldQuaternion(targetRot.current);

    // Dynamic HUD placement according to player comfort preference
    const hudPosMode = accessibility.hudPosition || 'bottom';
    let yOffset = -0.22;
    let zOffset = -1.05;
    let tiltAngle = 0.16; // Tilted slightly upwards towards eyes

    if (hudPosMode === 'center') {
      yOffset = -0.04;
      zOffset = -1.10;
      tiltAngle = 0.0;
    } else if (hudPosMode === 'top') {
      yOffset = 0.18;
      zOffset = -1.00;
      tiltAngle = -0.12; // Tilted slightly downwards
    }

    const offset = new THREE.Vector3(0, yOffset, zOffset).applyQuaternion(targetRot.current);
    targetPos.current.add(offset);

    const tiltRot = targetRot.current.clone().multiply(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltAngle)
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

        {/* Exit & Reset Button (Far Left) */}
        <group
          position={[-0.34, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            handleExitReset();
          }}
          onPointerOver={() => setExitHovered(true)}
          onPointerOut={() => setExitHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.16, 0.05]} />
            <meshBasicMaterial
              color={isAllMissionsComplete ? (exitHovered ? '#00ff88' : '#059669') : (exitHovered ? '#ff0055' : '#9f1239')}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.022} color="#ffffff" anchorX="center" anchorY="middle">
            {isAllMissionsComplete ? '🏆 RESET' : '🚪 EXIT'}
          </Text>
        </group>

        {/* Tab Switch: Status Matrix */}
        <group
          position={[-0.17, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            setHudTab('status');
            setIsMinimized(false);
          }}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.15, 0.05]} />
            <meshBasicMaterial color={hudTab === 'status' ? '#0284c7' : '#1e293b'} transparent opacity={0.85} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.022} color={hudTab === 'status' ? '#38bdf8' : '#94a3b8'} anchorX="center" anchorY="middle">
            📊 STATUS
          </Text>
        </group>

        {/* Tab Switch: Comfort & Height */}
        <group
          position={[0.0, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            setHudTab('comfort');
            setIsMinimized(false);
          }}
          onPointerOver={() => setComfortHovered(true)}
          onPointerOut={() => setComfortHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.16, 0.05]} />
            <meshBasicMaterial color={hudTab === 'comfort' ? '#7c3aed' : (comfortHovered ? '#475569' : '#1e293b')} transparent opacity={0.85} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.022} color={hudTab === 'comfort' ? '#c4b5fd' : '#cbd5e1'} anchorX="center" anchorY="middle">
            ⚙️ COMFORT
          </Text>
        </group>

        {/* Threat Level Indicator */}
        <group position={[0.17, 0, 0.01]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.15, 0.05]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.020} color="#00f0ff" anchorX="center" anchorY="middle">
            {threatLabel}
          </Text>
        </group>

        {/* Toggle Minimize / Expand Button (Far Right) */}
        <group
          position={[0.34, 0, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          onPointerOver={() => setToggleHovered(true)}
          onPointerOut={() => setToggleHovered(false)}
        >
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.16, 0.05]} />
            <meshBasicMaterial color={toggleHovered ? '#0284c7' : '#0369a1'} transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.022} color="#ffffff" anchorX="center" anchorY="middle">
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

      {/* ── 3. EXPANDED PANELS (STATUS OR COMFORT SETTINGS) ── */}
      {!isMinimized && hudTab === 'status' && (
        <>
          {/* ── TOP-LEFT WING: Vitals & Equipment (Pojok Kiri) ── */}
          <group position={[-0.46, -0.04, -0.02]} rotation={[0, 0.14, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial color="#030712" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.488, 0.288]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
            </mesh>
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
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial color="#030712" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.488, 0.288]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
            </mesh>
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
            <Text position={[-0.21, 0.00, 0.01]} fontSize={0.022} color={nusaState.isRescued ? '#00ff88' : '#ff0055'} anchorX="left" anchorY="middle">
              👤 NUSA: {nusaState.isRescued ? '✓ SELAMAT' : '❓ KELAS 2A'}
            </Text>

            {/* Boss Gatot Objective (Direktur) */}
            <Text position={[-0.21, -0.04, 0.01]} fontSize={0.022} color={cureState.gatotCured ? '#00ff88' : '#ffd700'} anchorX="left" anchorY="middle">
              🎯 GATOT: {cureState.gatotCured ? '✓ SEMBUH' : '❓ RUANG DIREKTUR'}
            </Text>

            {/* Dosen & Mahasiswa Counters */}
            <Text position={[-0.21, -0.08, 0.01]} fontSize={0.022} color="#e2e8f0" anchorX="left" anchorY="middle">
              🏫 DOSEN: {lecturersCuredCount}/2  |  🎓 MHS: {cureState.studentsCured}/4
            </Text>
          </group>
        </>
      )}

      {/* ── 3C. FLOATING EMPTY ANTIDOTE ALERT & REFILL GUIDE BANNER ── */}
      {antidoteCount === 0 && !isAllMissionsComplete && (
        <group position={[0, -0.19, 0.01]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.88, 0.07]} />
            <meshBasicMaterial color="#7f1d1d" transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[0.886, 0.076]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.022} color="#ffffff" anchorX="center" anchorY="middle">
            ⚠️ ANTIDOT HABIS! Isi ulang di RUANG DOSEN (Lt 1)
          </Text>
        </group>
      )}

      {/* ── 3B. EXPANDED VR COMFORT & HEIGHT ACCESSIBILITY PANEL ── */}
      {!isMinimized && hudTab === 'comfort' && (
        <>
          {/* Left Wing: Rotation & FOV Vignette */}
          <group position={[-0.46, -0.04, -0.02]} rotation={[0, 0.14, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial color="#030712" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.488, 0.288]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
            </mesh>
            <mesh position={[0, 0.138, -0.008]}>
              <planeGeometry args={[0.48, 0.004]} />
              <meshBasicMaterial color="#a855f7" />
            </mesh>

            <Text position={[-0.21, 0.10, 0.01]} fontSize={0.024} color="#c084fc" anchorX="left" anchorY="middle">
              VR TURNING & MOTION
            </Text>

            {/* Turn Mode Toggle */}
            <Text position={[-0.21, 0.05, 0.01]} fontSize={0.020} color="#ffffff" anchorX="left" anchorY="middle">
              Turn Mode:
            </Text>
            {/* Snap 45 */}
            <group
              position={[-0.07, 0.05, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ turnMode: 'snap', snapTurnAngle: 45 });
              }}
            >
              <mesh>
                <planeGeometry args={[0.09, 0.034]} />
                <meshBasicMaterial color={accessibility.turnMode === 'snap' && accessibility.snapTurnAngle === 45 ? '#7c3aed' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.016} color="#ffffff" anchorX="center" anchorY="middle">
                Snap 45°
              </Text>
            </group>
            {/* Snap 30 */}
            <group
              position={[0.035, 0.05, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ turnMode: 'snap', snapTurnAngle: 30 });
              }}
            >
              <mesh>
                <planeGeometry args={[0.09, 0.034]} />
                <meshBasicMaterial color={accessibility.turnMode === 'snap' && accessibility.snapTurnAngle === 30 ? '#7c3aed' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.016} color="#ffffff" anchorX="center" anchorY="middle">
                Snap 30°
              </Text>
            </group>
            {/* Smooth Turn */}
            <group
              position={[0.14, 0.05, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ turnMode: 'smooth' });
              }}
            >
              <mesh>
                <planeGeometry args={[0.09, 0.034]} />
                <meshBasicMaterial color={accessibility.turnMode === 'smooth' ? '#7c3aed' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.016} color="#ffffff" anchorX="center" anchorY="middle">
                Smooth
              </Text>
            </group>

            {/* FOV Vignette Level */}
            <Text position={[-0.21, -0.01, 0.01]} fontSize={0.020} color="#ffffff" anchorX="left" anchorY="middle">
              Vignette:
            </Text>
            {(['high', 'medium', 'off'] as const).map((lvl, idx) => (
              <group
                key={lvl}
                position={[-0.06 + idx * 0.12, -0.01, 0.01]}
                onClick={(e) => {
                  e.stopPropagation();
                  updateAccessibility({ comfortVignette: lvl });
                }}
              >
                <mesh>
                  <planeGeometry args={[0.11, 0.034]} />
                  <meshBasicMaterial color={accessibility.comfortVignette === lvl ? '#0284c7' : '#334155'} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.018} color="#ffffff" anchorX="center" anchorY="middle">
                  {lvl.toUpperCase()}
                </Text>
              </group>
            ))}

            {/* Move Speed */}
            <Text position={[-0.21, -0.07, 0.01]} fontSize={0.020} color="#ffffff" anchorX="left" anchorY="middle">
              Speed:
            </Text>
            <group
              position={[-0.03, -0.07, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ vrSpeedMode: 'comfort' });
              }}
            >
              <mesh>
                <planeGeometry args={[0.15, 0.034]} />
                <meshBasicMaterial color={accessibility.vrSpeedMode === 'comfort' ? '#059669' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.018} color="#ffffff" anchorX="center" anchorY="middle">
                🚶 Comfort
              </Text>
            </group>
            <group
              position={[0.13, -0.07, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ vrSpeedMode: 'normal' });
              }}
            >
              <mesh>
                <planeGeometry args={[0.15, 0.034]} />
                <meshBasicMaterial color={accessibility.vrSpeedMode === 'normal' ? '#059669' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.018} color="#ffffff" anchorX="center" anchorY="middle">
                🏃 Normal
              </Text>
            </group>
          </group>

          {/* Right Wing: Eye-Height Calibration (Anti-Squatting / Anti-Jongkok) */}
          <group position={[0.46, -0.04, -0.02]} rotation={[0, -0.14, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.48, 0.28]} />
              <meshBasicMaterial color="#030712" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.488, 0.288]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
            </mesh>
            <mesh position={[0, 0.138, -0.008]}>
              <planeGeometry args={[0.48, 0.004]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>

            <Text position={[-0.21, 0.10, 0.01]} fontSize={0.024} color="#00f0ff" anchorX="left" anchorY="middle">
              VR EYE-HEIGHT CALIBRATION
            </Text>

            {/* Current Height Offset Display */}
            <Text position={[0, 0.05, 0.01]} fontSize={0.022} color="#fde047" anchorX="center" anchorY="middle">
              Height Boost: +{Math.round((accessibility.vrHeightOffset ?? 0.25) * 100)} cm
            </Text>

            {/* Stepper Buttons: +10cm, -10cm */}
            <group
              position={[-0.10, 0.00, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                const cur = accessibility.vrHeightOffset ?? 0.25;
                updateAccessibility({ vrHeightOffset: Math.max(-0.5, Math.min(1.0, cur - 0.1)) });
              }}
            >
              <mesh>
                <planeGeometry args={[0.18, 0.038]} />
                <meshBasicMaterial color="#475569" />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.019} color="#ffffff" anchorX="center" anchorY="middle">
                ⬇️ -10 cm
              </Text>
            </group>

            <group
              position={[0.10, 0.00, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                const cur = accessibility.vrHeightOffset ?? 0.25;
                updateAccessibility({ vrHeightOffset: Math.max(-0.5, Math.min(1.0, cur + 0.1)) });
              }}
            >
              <mesh>
                <planeGeometry args={[0.18, 0.038]} />
                <meshBasicMaterial color="#475569" />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.019} color="#ffffff" anchorX="center" anchorY="middle">
                ⬆️ +10 cm
              </Text>
            </group>

            {/* Presets: Seated vs Standing */}
            <group
              position={[-0.12, -0.06, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ vrHeightOffset: 0.45 });
              }}
            >
              <mesh>
                <planeGeometry args={[0.14, 0.034]} />
                <meshBasicMaterial color={accessibility.vrHeightOffset === 0.45 ? '#0284c7' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.017} color="#ffffff" anchorX="center" anchorY="middle">
                🪑 Duduk (+45cm)
              </Text>
            </group>

            <group
              position={[0.03, -0.06, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ vrHeightOffset: 0.25 });
              }}
            >
              <mesh>
                <planeGeometry args={[0.14, 0.034]} />
                <meshBasicMaterial color={accessibility.vrHeightOffset === 0.25 ? '#0284c7' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.017} color="#ffffff" anchorX="center" anchorY="middle">
                🧍 Berdiri (+25cm)
              </Text>
            </group>

            <group
              position={[0.16, -0.06, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateAccessibility({ vrHeightOffset: 0.0 });
              }}
            >
              <mesh>
                <planeGeometry args={[0.10, 0.034]} />
                <meshBasicMaterial color={accessibility.vrHeightOffset === 0.0 ? '#0284c7' : '#334155'} />
              </mesh>
              <Text position={[0, 0, 0.01]} fontSize={0.017} color="#ffffff" anchorX="center" anchorY="middle">
                Reset 0
              </Text>
            </group>

            {/* HUD Placement Position Controls */}
            <Text position={[-0.21, -0.11, 0.01]} fontSize={0.018} color="#38bdf8" anchorX="left" anchorY="middle">
              POSISI HUD:
            </Text>
            {[
              { label: '📍 Bawah', val: 'bottom', x: -0.06 },
              { label: '📍 Tengah', val: 'center', x: 0.05 },
              { label: '📍 Atas', val: 'top', x: 0.16 },
            ].map((p) => {
              const isSelected = (accessibility.hudPosition || 'bottom') === p.val;
              return (
                <group
                  key={p.val}
                  position={[p.x, -0.11, 0.01]}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAccessibility({ hudPosition: p.val as any });
                  }}
                >
                  <mesh>
                    <planeGeometry args={[0.095, 0.028]} />
                    <meshBasicMaterial color={isSelected ? '#0284c7' : '#334155'} />
                  </mesh>
                  <Text position={[0, 0, 0.01]} fontSize={0.015} color="#ffffff" anchorX="center" anchorY="middle">
                    {p.label}
                  </Text>
                </group>
              );
            })}
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
