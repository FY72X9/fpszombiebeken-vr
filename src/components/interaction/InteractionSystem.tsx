import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { RoomId } from '../../types/game';
import { activeEnemiesMap, EnemyEntity } from '../../systems/DetectionSystem';
import { startInjection } from '../../systems/InjectionSystem';

export interface InteractiveTarget {
  id: string;
  position: [number, number, number];
  targetRoom?: RoomId;
  label: string;
  action: () => void;
}

const registeredDoorsMap = new Map<string, InteractiveTarget>();

export function registerInteractiveDoor(target: InteractiveTarget) {
  registeredDoorsMap.set(target.id, target);
}

export function unregisterInteractiveDoor(id: string) {
  registeredDoorsMap.delete(id);
}

export let triggerGlobalInteraction = () => {};

export function InteractionSystem() {
  const [promptText, setPromptText] = useState<string | null>(null);
  const playerPos = useGameStore((s) => s.player.position);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);

  useFrame(() => {
    const pPos = new THREE.Vector3(...playerPos);
    let nearestDoor: InteractiveTarget | null = null;
    let minDoorDist = 3.0;

    registeredDoorsMap.forEach((door) => {
      const doorPos = new THREE.Vector3(...door.position);
      const dist = pPos.distanceTo(doorPos);
      if (dist < minDoorDist) {
        minDoorDist = dist;
        nearestDoor = door;
      }
    });

    let nearestZombie: EnemyEntity | null = null;
    let minZombieDist = 3.5;

    activeEnemiesMap.forEach((enemy) => {
      if (enemy.room === currentRoom && enemy.state !== 'cured') {
        const dist = pPos.distanceTo(enemy.position);
        if (dist < minZombieDist) {
          minZombieDist = dist;
          nearestZombie = enemy;
        }
      }
    });

    if (nearestZombie && minZombieDist <= 3.5 && minZombieDist < minDoorDist) {
      const zombieName = (nearestZombie as EnemyEntity).nameLabel || ((nearestZombie as EnemyEntity).type === 'BOSS_WILLY' ? 'Boss Willy' : (nearestZombie as EnemyEntity).type === 'LECTURER' ? 'Dosen' : 'Mahasiswa Zombie');
      setPromptText(`[E / VR Trigger] Suntik Antidot: ${zombieName}`);

      const targetZombieId = (nearestZombie as EnemyEntity).id;
      triggerGlobalInteraction = () => {
        const hasAntidote = useGameStore.getState().player.inventory.some((i) => i.type === 'antidote' && i.count > 0);
        if (hasAntidote) {
          startInjection(targetZombieId);
        } else {
          setDetectionMessage('Membutuhkan Antidot Syringe!');
          setTimeout(() => setDetectionMessage(null), 2000);
        }
      };
    } else if (nearestDoor) {
      const label = (nearestDoor as InteractiveTarget).label;
      const action = (nearestDoor as InteractiveTarget).action;

      setPromptText(`[E / VR Trigger] Masuk ${label}`);
      triggerGlobalInteraction = () => {
        action();
        setDetectionMessage(`Berpindah ke: ${label}`);
        setTimeout(() => setDetectionMessage(null), 2000);
      };
    } else {
      if (promptText !== null) setPromptText(null);
      triggerGlobalInteraction = () => {};
    }
  });

  return null;
}
