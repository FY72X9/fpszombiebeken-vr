import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { NUSA_CONFIG } from '../../constants/gameConfig';
import { Character3D } from '../enemy/Character3D';

export function NusaNPC({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const nusaState = useGameStore((s) => s.nusa);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const setNusaState = useGameStore((s) => s.setNusaState);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);

  useFrame((_, delta) => {
    if (nusaState.state === 'following' && groupRef.current) {
      const [px, py, pz] = useGameStore.getState().player.position;
      const playerPos = new THREE.Vector3(px, py, pz);
      const nusaPos = groupRef.current.position;

      const dist = nusaPos.distanceTo(playerPos);
      if (dist > NUSA_CONFIG.followDistance) {
        const dir = playerPos.clone().sub(nusaPos).normalize();
        dir.y = 0;
        nusaPos.add(dir.multiplyScalar(NUSA_CONFIG.followSpeed * delta));
        groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }

      if (currentRoom === 'lobby_l1' && dist < 3) {
        setNusaState({ isRescued: true, state: 'rescued' });
        useGameStore.getState().setPhase('win');
      }
    }
  });

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
        state={nusaState.state === 'hiding' ? 'idle' : 'wander'}
        isZombie={false}
        onClick={handleTalk}
      />
    </group>
  );
}
