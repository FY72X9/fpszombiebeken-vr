import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { NUSA_CONFIG } from '../../constants/gameConfig';
import { Character3D } from '../enemy/Character3D';

export function NusaNPC({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const nusaState = useGameStore((s) => s.nusa);
  const setNusaState = useGameStore((s) => s.setNusaState);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);

  if (nusaState.state !== 'hiding') {
    return null;
  }

  const handleTalk = (e: any) => {
    e.stopPropagation();
    if (nusaState.state === 'hiding') {
      setNusaState({ state: 'following' });
      setDetectionMessage(NUSA_CONFIG.interactionDialogs.meet + ' ' + NUSA_CONFIG.interactionDialogs.follow);
      setTimeout(() => setDetectionMessage(null), 4000);
    }
  };

  return (
    <group ref={groupRef} position={position}>
      <Character3D
        type="NUSA"
        state="idle"
        isZombie={false}
        onClick={handleTalk}
      />
    </group>
  );
}
