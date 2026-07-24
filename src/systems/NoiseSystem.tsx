import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/GameStore';
import { activeEnemiesMap } from './DetectionSystem';
import { NoiseEvent } from '../types/game';

const noiseQueue: NoiseEvent[] = [];

export function emitNoise(event: NoiseEvent) {
  noiseQueue.push(event);
}

export function NoiseSystem() {
  const noisePos = new THREE.Vector3();
  const enemyPos = new THREE.Vector3();

  useFrame(() => {
    if (noiseQueue.length === 0) return;
    const currentRoom = useGameStore.getState().currentRoom;

    while (noiseQueue.length > 0) {
      const noise = noiseQueue.shift()!;
      noisePos.set(...noise.position);

      activeEnemiesMap.forEach((enemy) => {
        if (enemy.room !== currentRoom || enemy.state === 'cured' || enemy.state === 'stunned') return;

        enemyPos.copy(enemy.position);
        const dist = noisePos.distanceTo(enemyPos);

        if (dist <= noise.radius) {
          if (enemy.state === 'idle' || enemy.state === 'wander') {
            enemy.state = 'alert';
          }
        }
      });
    }
  });

  return null;
}
