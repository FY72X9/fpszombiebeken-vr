import { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { activeEnemiesMap, EnemyEntity } from '../../systems/DetectionSystem';
import { startInjection } from '../../systems/InjectionSystem';
import { registeredDoorsMap, setTriggerGlobalInteraction, InteractiveTarget } from '../../systems/InteractionManager';

export let currentTargetedZombieId: string | null = null;

export function InteractionSystem() {
  const [promptText, setPromptText] = useState<string | null>(null);
  const playerPos = useGameStore((s) => s.player.position);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);
  const { camera } = useThree();

  useFrame(() => {
    const pPos = new THREE.Vector3(playerPos[0], 0, playerPos[2]);
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    if (cameraDir.lengthSq() > 0.0001) cameraDir.normalize();

    let nearestDoor: InteractiveTarget | null = null;
    let minDoorDist = 1.8; // Proximity limit: Must be within 1.8 meters of door

    registeredDoorsMap.forEach((door) => {
      const doorPos = new THREE.Vector3(door.position[0], 0, door.position[2]);
      const dist = pPos.distanceTo(doorPos);
      if (dist <= minDoorDist) {
        // Facing check: Ensure camera vector is pointing towards the door
        const dirToDoor = new THREE.Vector3().subVectors(doorPos, pPos);
        if (dirToDoor.lengthSq() > 0.0001) {
          dirToDoor.normalize();
          const dot = cameraDir.dot(dirToDoor);
          if (dot > 0.4) { // Facing within ~66 degree cone
            minDoorDist = dist;
            nearestDoor = door;
          }
        }
      }
    });

    let nearestZombie: EnemyEntity | null = null;
    let minZombieDist = 3.5;

    activeEnemiesMap.forEach((enemy) => {
      if (enemy.room === currentRoom && enemy.state !== 'cured') {
        const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
        const dist = pPos.distanceTo(enemyPos);
        if (dist <= minZombieDist) {
          const dirToZombie = new THREE.Vector3().subVectors(enemyPos, pPos);
          if (dirToZombie.lengthSq() > 0.0001) {
            dirToZombie.normalize();
            if (cameraDir.dot(dirToZombie) > 0.25) {
              minZombieDist = dist;
              nearestZombie = enemy;
            }
          }
        }
      }
    });

    if (nearestZombie && minZombieDist <= 3.5 && minZombieDist < minDoorDist) {
      const targetZombie = nearestZombie as EnemyEntity;
      currentTargetedZombieId = targetZombie.id;
      const isBoss = targetZombie.type === 'BOSS_GATOT' || targetZombie.type === 'BOSS_WILLY';
      const zombieName = targetZombie.nameLabel || (isBoss ? 'Boss Gatot' : targetZombie.type === 'KOH_WILLY' ? 'Koh Willy' : targetZombie.type === 'LECTURER' ? 'Dosen' : 'Mahasiswa Zombie');
      
      const hasAntidote = useGameStore.getState().player.inventory.some((i) => i.type === 'antidote' && i.count > 0);
      if (hasAntidote) {
        setPromptText(`[E / Klik Kiri / VR Trigger] Suntik Antidot: ${zombieName}`);
      } else {
        setPromptText(`⚠️ ANTIDOT HABIS! Isi ulang di Ruang Dosen!`);
      }

      const targetZombieId = targetZombie.id;
      setTriggerGlobalInteraction(() => {
        const hasAntidoteNow = useGameStore.getState().player.inventory.some((i) => i.type === 'antidote' && i.count > 0);
        if (hasAntidoteNow) {
          startInjection(targetZombieId);
        } else {
          setDetectionMessage('⚠️ Antidot habis! Isi ulang di Ruang Dosen (Lantai 1)!');
          setTimeout(() => setDetectionMessage(null), 3000);
        }
      });
    } else if (nearestDoor) {
      currentTargetedZombieId = null;
      const label = (nearestDoor as InteractiveTarget).label;
      const action = (nearestDoor as InteractiveTarget).action;

      setPromptText(`[E / Klik Kiri / VR Trigger] Masuk ${label}`);
      setTriggerGlobalInteraction(() => {
        action();
        setDetectionMessage(`Berpindah ke: ${label}`);
        setTimeout(() => setDetectionMessage(null), 2000);
      });
    } else {
      currentTargetedZombieId = null;
      if (promptText !== null) setPromptText(null);
      setTriggerGlobalInteraction(() => {});
    }
  });

  return null;
}
