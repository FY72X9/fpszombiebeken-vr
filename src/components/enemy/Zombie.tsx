import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CelMaterial } from '../../shaders/CelMaterial';
import { activeEnemiesMap, EnemyEntity } from '../../systems/DetectionSystem';
import { startInjection } from '../../systems/InjectionSystem';
import { useGameStore } from '../../stores/GameStore';

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
  color = '#ef4444',
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
      // Look towards player
      const dir = playerPos.clone().sub(posRef.current);
      dir.y = 0;
      if (dir.lengthSq() > 0.01) {
        dir.normalize();
        const targetRotY = Math.atan2(dir.x, dir.z);
        rotRef.current.y += (targetRotY - rotRef.current.y) * 0.1;

        // Move towards player
        const speed = type === 'BOSS_WILLY' ? 1.5 : 2.2;
        posRef.current.add(dir.multiplyScalar(speed * delta));
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
      groupRef.current.rotation.copy(rotRef.current);
    }
  });

  const isCured = entityRef.current.state === 'cured';
  const isStunned = entityRef.current.state === 'stunned';

  const handleInteract = (e: any) => {
    e.stopPropagation();
    if (isCured) return;

    const playerPos = new THREE.Vector3(...useGameStore.getState().player.position);
    const dist = posRef.current.distanceTo(playerPos);

    if (dist < 3.0) {
      // Check if player has antidote syringe
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
    <group ref={groupRef} position={initialPosition} onClick={handleInteract}>
      {/* Anime Cel-shaded Body Mesh */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.35, 1.0, 8, 16]} />
        <CelMaterial color={isCured ? '#3b82f6' : color} rimColor={isCured ? '#93c5fd' : '#fca5a5'} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <CelMaterial color={isCured ? '#fde047' : '#991b1b'} />
      </mesh>

      {/* Eye Glow */}
      {!isCured && (
        <mesh position={[0, 1.65, 0.2]}>
          <boxGeometry args={[0.3, 0.08, 0.1]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}

      {/* State Badge / Label Indicator */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.2, 0.25, 0.02]} />
        <meshBasicMaterial color={isCured ? '#22c55e' : isStunned ? '#eab308' : '#dc2626'} />
      </mesh>
    </group>
  );
}
