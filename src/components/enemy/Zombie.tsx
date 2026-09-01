import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { activeEnemiesMap, EnemyEntity } from '../../systems/DetectionSystem';
import { startInjection } from '../../systems/InjectionSystem';
import { useGameStore } from '../../stores/GameStore';
import { currentTargetedZombieId } from '../interaction/InteractionSystem';
import { Character3D } from './Character3D';

interface ZombieProps {
  id: string;
  type?: 'STUDENT' | 'LECTURER' | 'BOSS_GATOT' | 'BOSS_WILLY' | 'KOH_WILLY';
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

  // Autonomous patrol waypoint refs
  const patrolTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(...initialPosition));
  const patrolTimerRef = useRef<number>(Math.random() * 3);

  const curedZombieIds = useGameStore((s) => s.cure.curedZombieIds);
  const isCuredInStore = curedZombieIds.includes(id);

  const isBoss = type === 'BOSS_GATOT' || type === 'BOSS_WILLY';
  const entityRef = useRef<EnemyEntity>({
    id,
    type,
    nameLabel: _nameLabel,
    position: posRef.current,
    rotation: rotRef.current,
    state: isCuredInStore ? 'cured' : 'idle',
    health: isBoss ? 300 : type === 'LECTURER' || type === 'KOH_WILLY' ? 150 : 80,
    maxHealth: isBoss ? 300 : type === 'LECTURER' || type === 'KOH_WILLY' ? 150 : 80,
    stunTimer: 0,
    searchTimer: 0,
    attackCooldown: 0,
    room,
    isInjecting: false,
    injectionProgress: 0
  });

  const [activeState, setActiveState] = useState<EnemyEntity['state']>(entityRef.current.state);
  const [isInjectingState, setIsInjectingState] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<number>(0);
  const [isTargetedState, setIsTargetedState] = useState<boolean>(false);

  useEffect(() => {
    if (curedZombieIds.includes(id)) {
      entityRef.current.state = 'cured';
      setActiveState('cured');
    } else {
      entityRef.current.state = 'idle';
      entityRef.current.attackCooldown = 0;
      entityRef.current.searchTimer = 0;
      entityRef.current.stunTimer = 0;
      entityRef.current.isInjecting = false;
      entityRef.current.injectionProgress = 0;
      posRef.current.set(...initialPosition);
      rotRef.current.set(0, 0, 0);
      patrolTargetRef.current.set(...initialPosition);
      if (groupRef.current) {
        groupRef.current.position.set(...initialPosition);
        groupRef.current.rotation.set(0, 0, 0);
      }
      setActiveState('idle');
    }
    activeEnemiesMap.set(id, entityRef.current);
    return () => {
      activeEnemiesMap.delete(id);
    };
  }, [id, curedZombieIds, initialPosition]);

  useFrame((_, delta) => {
    const enemy = entityRef.current;
    if (enemy.room !== useGameStore.getState().currentRoom) return;

    // React state sync for real-time 3D animation switching & targeting reticle
    if (enemy.state !== activeState) setActiveState(enemy.state);
    if (!!enemy.isInjecting !== isInjectingState) setIsInjectingState(!!enemy.isInjecting);
    if ((enemy.injectionProgress || 0) !== progressState) setProgressState(enemy.injectionProgress || 0);

    const isCurrentlyTargeted = currentTargetedZombieId === id;
    if (isCurrentlyTargeted !== isTargetedState) setIsTargetedState(isCurrentlyTargeted);

    if (enemy.state === 'cured') return;

    const [px, py, pz] = useGameStore.getState().player.position;
    const playerPos = new THREE.Vector3(px, py - 1.6, pz);

    if (enemy.state === 'chase' || enemy.state === 'attack') {
      // Chase Player
      const dir = playerPos.clone().sub(posRef.current);
      dir.y = 0;
      if (dir.lengthSq() > 0.01) {
        dir.normalize();
        const targetRotY = Math.atan2(dir.x, dir.z);
        rotRef.current.y += (targetRotY - rotRef.current.y) * 0.1;
        const isBossEnemy = type === 'BOSS_GATOT' || type === 'BOSS_WILLY';
        const speed = isBossEnemy ? 1.4 : type === 'LECTURER' || type === 'KOH_WILLY' ? 1.8 : 2.0;
        posRef.current.add(dir.multiplyScalar(speed * delta));
      }
    } else if (enemy.state === 'idle' || enemy.state === 'wander' || enemy.state === 'search') {
      // Autonomous Humanoid Patrol AI
      patrolTimerRef.current -= delta;
      if (patrolTimerRef.current <= 0) {
        patrolTimerRef.current = 3.5 + Math.random() * 3.5;
        // Pick new random waypoint near initialPosition
        const offsetR = 1.0 + Math.random() * 2.2;
        const offsetAngle = Math.random() * Math.PI * 2;
        patrolTargetRef.current.set(
          initialPosition[0] + Math.cos(offsetAngle) * offsetR,
          initialPosition[1],
          initialPosition[2] + Math.sin(offsetAngle) * offsetR
        );
      }

      const dir = patrolTargetRef.current.clone().sub(posRef.current);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.2) {
        dir.normalize();
        const targetRotY = Math.atan2(dir.x, dir.z);
        rotRef.current.y += (targetRotY - rotRef.current.y) * 0.08;
        const walkSpeed = 0.8;
        posRef.current.add(dir.multiplyScalar(walkSpeed * delta));
        if (enemy.state !== 'search') enemy.state = 'wander';
      } else if (enemy.state === 'wander') {
        enemy.state = 'idle';
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
        useGameStore.getState().setDetectionMessage('⚠️ Antidot habis! Isi ulang di Ruang Dosen (Lantai 1)!');
        setTimeout(() => useGameStore.getState().setDetectionMessage(null), 3000);
      }
    }
  };

  return (
    <group ref={groupRef} position={initialPosition}>
      <Character3D
        type={type}
        nameLabel={_nameLabel}
        state={activeState}
        isZombie={true}
        isInjecting={isInjectingState}
        injectionProgress={progressState}
        isTargeted={isTargetedState}
        onClick={handleInteract}
      />
    </group>
  );
}
