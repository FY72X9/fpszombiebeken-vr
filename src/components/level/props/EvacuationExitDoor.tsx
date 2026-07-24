import { useState, useEffect } from 'react';
import { useGameStore } from '../../../stores/GameStore';
import { registerInteractiveDoor, unregisterInteractiveDoor } from '../../interaction/InteractionSystem';

interface EvacuationExitDoorProps {
  position: [number, number, number];
  rotationY?: number;
}

export function EvacuationExitDoor({ position, rotationY = Math.PI }: EvacuationExitDoorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEvacuate = () => {
    const state = useGameStore.getState();
    const isNusaFollowingOrRescued = state.nusa.state === 'following' || state.nusa.state === 'rescued' || state.nusa.isRescued;

    if (isNusaFollowingOrRescued) {
      state.setNusaRescued(true);
      state.setDetectionMessage('[🏆 SUKSES] Nusa berhasil dievakuasi ke Gerbang Utama!');
      setTimeout(() => {
        state.setPhase('win');
      }, 1200);
    } else {
      state.setDetectionMessage('[⚠️ EVAKUASI DITOLAK] Temukan dan selamatkan Nusa di Kelas 2A terlebih dahulu!');
      setTimeout(() => {
        state.setDetectionMessage(null);
      }, 3500);
    }
  };

  useEffect(() => {
    const doorId = `evac_door_${position.join('_')}`;
    registerInteractiveDoor({
      id: doorId,
      position,
      targetRoom: 'entrance',
      label: 'Evakuasi Nusa & Escape',
      action: handleEvacuate
    });
    return () => {
      unregisterInteractiveDoor(doorId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.join(',')]);

  const toggleDoor = (e: any) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    handleEvacuate();
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* ── Heavy Duty Exit Frame (Double Door) ── */}
      <mesh position={[-1.3, 1.4, 0]}>
        <boxGeometry args={[0.15, 2.8, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[1.3, 1.4, 0]}>
        <boxGeometry args={[0.15, 2.8, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[2.75, 0.18, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Floor hazard stripes (elevated at Y=0.005 to prevent Z-fighting) */}
      <group position={[0, 0.005, -1.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.8]} />
          <meshBasicMaterial color="#eab308" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
        {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
          <mesh key={i} position={[x, 0.001, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.15, 0.9]} />
            <meshBasicMaterial color="#0f172a" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
          </mesh>
        ))}
      </group>

      {/* ── Glass Exit Doors ── */}
      <group position={[-0.6, 1.35, 0]}>
        <mesh onClick={toggleDoor}>
          <boxGeometry args={[1.2, 2.6, 0.08]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.45} roughness={0.1} />
        </mesh>
      </group>
      <group position={[0.6, 1.35, 0]}>
        <mesh onClick={toggleDoor}>
          <boxGeometry args={[1.2, 2.6, 0.08]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.45} roughness={0.1} />
        </mesh>
      </group>

      {/* ── HIGH-VISIBILITY GLOWING EXIT SIGNBOARD ── */}
      <group position={[0, 3.15, 0.1]}>
        <mesh>
          <boxGeometry args={[2.4, 0.45, 0.08]} />
          <meshStandardMaterial color="#15803d" emissive="#22c55e" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* ── EMERGENCY GREEN BEACON LIGHT ── */}
      <group position={[0, 3.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.12, 0.25, 12]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
      </group>
    </group>
  );
}
