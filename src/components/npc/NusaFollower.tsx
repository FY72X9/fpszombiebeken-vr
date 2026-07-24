import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { NUSA_CONFIG } from '../../constants/gameConfig';
import { Character3D } from '../enemy/Character3D';

export function NusaFollower() {
  const groupRef = useRef<THREE.Group>(null);
  const nusaState = useGameStore((s) => s.nusa);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const setNusaState = useGameStore((s) => s.setNusaState);
  const lastRoomRef = useRef<string>(currentRoom);

  // Position initialized near player position upon room transition
  useEffect(() => {
    if (groupRef.current && (nusaState.state === 'following' || nusaState.state === 'rescued')) {
      const [px, py, pz] = useGameStore.getState().player.position;
      // Spawn Nusa 1.2m behind player in new room
      groupRef.current.position.set(px - 0.8, py - 1.6, pz + 0.8);
      lastRoomRef.current = currentRoom;
    }
  }, [currentRoom, nusaState.state]);

  useFrame((_, delta) => {
    if ((nusaState.state === 'following' || nusaState.state === 'rescued') && groupRef.current) {
      const [px, py, pz] = useGameStore.getState().player.position;
      const playerPos = new THREE.Vector3(px, py - 1.6, pz);
      const nusaPos = groupRef.current.position;

      const dist = nusaPos.distanceTo(playerPos);
      if (dist > NUSA_CONFIG.followDistance) {
        const dir = playerPos.clone().sub(nusaPos);
        dir.y = 0;
        if (dir.lengthSq() > 0.001) {
          dir.normalize();
          nusaPos.add(dir.multiplyScalar(NUSA_CONFIG.followSpeed * delta));
          groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
        }
      }

      // Check evacuation win condition in Lobby
      if (currentRoom === 'lobby_l1' && dist < 3.5 && !nusaState.isRescued) {
        setNusaState({ isRescued: true, state: 'rescued' });
      }
    }
  });

  if (nusaState.state !== 'following' && nusaState.state !== 'rescued') {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Character3D
        type="NUSA"
        state="wander"
        isZombie={false}
      />
    </group>
  );
}
