import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { activeEnemiesMap, EnemyEntity } from '../../systems/DetectionSystem';
import { startInjection } from '../../systems/InjectionSystem';
import { useGameStore } from '../../stores/GameStore';
import { Character3D } from './Character3D';

interface ZombieProps {
  id: string;
  type?: 'STUDENT' | 'LECTURER' | 'BOSS_WILLY';
  initialPosition: [number, number, number];
  room: string;
  color?: string;
  nameLabel?: string;
}

export function Zombie({
  id,
  type = 'STUDENT',
  initialPosition,
  room,
  nameLabel: _nameLabel = 'Zombie Student'
}: ZombieProps) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(...initialPosition));
  const rotRef = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0));

  const entityRef = useRef<EnemyEntity>({
    id,
    type,
    position: posRef.current,
    rotation: rotRef.current,
    state: 'idle',
    health: type === 'BOSS_WILLY' ? 300 : type === 'LECTURER' ? 150 : 80,
    maxHealth: type === 'BOSS_WILLY' ? 300 : type === 'LECTURER' ? 150 : 80,
    stunTimer: 0,
    searchTimer: 0,
    attackCooldown: 0,
    room
  });

  useEffect(() => {
    activeEnemiesMap.set(id, entityRef.current);
    return () => {
      activeEnemiesMap.delete(id);
    };
  }, [id]);

  useFrame((_, delta) => {
    const enemy = entityRef.current;
    if (enemy.state === 'cured' || enemy.room !== useGameStore.getState().currentRoom) return;

    const [px, py, pz] = useGameStore.getState().player.position;
    const playerPos = new THREE.Vector3(px, py, pz);

    if (enemy.state === 'chase' || enemy.state === 'attack') {
      const dir = playerPos.clone().sub(posRef.current);
      dir.y = 0;
      if (dir.lengthSq() > 0.01) {
        dir.normalize();
        const targetRotY = Math.atan2(dir.x, dir.z);
        rotRef.current.y += (targetRotY - rotRef.current.y) * 0.1;
        const speed = type === 'BOSS_WILLY' ? 1.5 : 2.2;
        posRef.current.add(dir.multiplyScalar(speed * delta));
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
      groupRef.current.rotation.copy(rotRef.current);
    }
  });

  const handleInteract = (e: any) => {
    e.stopPropagation();
    if (entityRef.current.state === 'cured') return;

    const playerPos = new THREE.Vector3(...useGameStore.getState().player.position);
    const dist = posRef.current.distanceTo(playerPos);

    if (dist < 3.5) {
      const hasAntidote = useGameStore.getState().player.inventory.some((i) => i.type === 'antidote' && i.count > 0);
      if (hasAntidote) {
        startInjection(id);
      } else {
        useGameStore.getState().setDetectionMessage('Membutuhkan Antidot Syringe!');
        setTimeout(() => useGameStore.getState().setDetectionMessage(null), 2000);
      }
    }
  };

  return (
    <group ref={groupRef} position={initialPosition}>
      <Character3D
        type={type}
        state={entityRef.current.state}
        isZombie={true}
        onClick={handleInteract}
      />
    </group>
  );
}
