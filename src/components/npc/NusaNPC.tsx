import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CelMaterial } from '../../shaders/CelMaterial';
import { useGameStore } from '../../stores/GameStore';
import { NUSA_CONFIG } from '../../constants/gameConfig';

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

      // Check win condition if in Lobby L1
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
    <group ref={groupRef} position={position} onClick={handleTalk}>
      {/* Anime Cel Avatar - Nusa (Friendly Student) */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.3, 0.9, 8, 16]} />
        <CelMaterial color="#38bdf8" rimColor="#e0f2fe" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <CelMaterial color="#fde047" />
      </mesh>

      {/* Rescue Indicator Badge */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[1.2, 0.25, 0.02]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
    </group>
  );
}
