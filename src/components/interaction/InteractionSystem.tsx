import { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { activeEnemiesMap, EnemyEntity } from '../../systems/DetectionSystem';
import { startInjection } from '../../systems/InjectionSystem';
import { registeredDoorsMap, setTriggerGlobalInteraction, InteractiveTarget } from '../../systems/InteractionManager';

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
    let minZombieDist = 2.5;

    activeEnemiesMap.forEach((enemy) => {
      if (enemy.room === currentRoom && enemy.state !== 'cured') {
        const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
        const dist = pPos.distanceTo(enemyPos);
        if (dist <= minZombieDist) {
          const dirToZombie = new THREE.Vector3().subVectors(enemyPos, pPos);
          if (dirToZombie.lengthSq() > 0.0001) {
            dirToZombie.normalize();
            if (cameraDir.dot(dirToZombie) > 0.3) {
              minZombieDist = dist;
              nearestZombie = enemy;
            }
          }
        }
      }
    });

    if (nearestZombie && minZombieDist <= 2.5 && minZombieDist < minDoorDist) {
      const zombieName = (nearestZombie as EnemyEntity).nameLabel || ((nearestZombie as EnemyEntity).type === 'BOSS_WILLY' ? 'Boss Willy' : (nearestZombie as EnemyEntity).type === 'LECTURER' ? 'Dosen' : 'Mahasiswa Zombie');
      setPromptText(`[E / Klik Kiri / VR Trigger] Suntik Antidot: ${zombieName}`);

      const targetZombieId = (nearestZombie as EnemyEntity).id;
      setTriggerGlobalInteraction(() => {
        const hasAntidote = useGameStore.getState().player.inventory.some((i) => i.type === 'antidote' && i.count > 0);
        if (hasAntidote) {
          startInjection(targetZombieId);
        } else {
          setDetectionMessage('Membutuhkan Antidot Syringe!');
          setTimeout(() => setDetectionMessage(null), 2000);
        }
      });
    } else if (nearestDoor) {
      const label = (nearestDoor as InteractiveTarget).label;
      const action = (nearestDoor as InteractiveTarget).action;

      setPromptText(`[E / Klik Kiri / VR Trigger] Masuk ${label}`);
      setTriggerGlobalInteraction(() => {
        action();
        setDetectionMessage(`Berpindah ke: ${label}`);
        setTimeout(() => setDetectionMessage(null), 2000);
      });
    } else {
      if (promptText !== null) setPromptText(null);
      setTriggerGlobalInteraction(() => {});
    }
  });

  return null;
}
