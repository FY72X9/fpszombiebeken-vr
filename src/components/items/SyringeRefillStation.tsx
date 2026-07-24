import { useRef } from 'react';
import { useGameStore } from '../../stores/GameStore';
import { CelMaterial } from '../../shaders/CelMaterial';

export function SyringeRefillStation({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<any>(null);
  const playerPos = useGameStore((s) => s.player.position);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);

  const handleRefill = (e: any) => {
    e.stopPropagation();
    const dist = Math.hypot(playerPos[0] - position[0], playerPos[2] - position[2]);
    if (dist < 3.0) {
      const state = useGameStore.getState();
      state.addInventoryItem(
        `antidote_${Date.now()}`,
        'antidote',
        'Antidote Syringe',
        2
      );

      setDetectionMessage('Mendapatkan +2 Antidote Syringe!');
      setTimeout(() => setDetectionMessage(null), 3000);
    }
  };

  return (
    <group ref={groupRef} position={position} onClick={handleRefill}>
      {/* Station Cabinet */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.7, 1.8, 0.5]} />
        <CelMaterial color="#0284c7" />
      </mesh>
      {/* Medical Cross Symbol */}
      <mesh position={[0, 1.2, 0.26]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.2, 0.26]}>
        <boxGeometry args={[0.08, 0.3, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
