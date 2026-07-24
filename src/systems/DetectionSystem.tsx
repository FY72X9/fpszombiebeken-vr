import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/GameStore';
import { DETECTION_CONFIG } from '../constants/gameConfig';

export interface EnemyEntity {
  id: string;
  type: 'STUDENT' | 'LECTURER' | 'BOSS_WILLY';
  position: THREE.Vector3;
  rotation: THREE.Euler;
  state: 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'search' | 'stunned' | 'cured';
  health: number;
  maxHealth: number;
  stunTimer: number;
  searchTimer: number;
  attackCooldown: number;
  room: string;
}

// Global active enemies registry
export const activeEnemiesMap = new Map<string, EnemyEntity>();

export function DetectionSystem() {
  const playerPos = new THREE.Vector3();
  const enemyPos = new THREE.Vector3();
  const enemyForward = new THREE.Vector3();
  const dirToPlayer = new THREE.Vector3();

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing') return;

    const [px, py, pz] = state.player.position;
    playerPos.set(px, py, pz);

    let highestThreat: 0 | 1 | 2 | 3 = 0;

    activeEnemiesMap.forEach((enemy, _id) => {
      // Only process enemies in current room
      if (enemy.room !== state.currentRoom || enemy.state === 'cured') return;

      if (enemy.state === 'stunned') {
        enemy.stunTimer -= delta;
        if (enemy.stunTimer <= 0) {
          enemy.state = 'search';
          enemy.searchTimer = 5;
        }
        return;
      }

      enemyPos.copy(enemy.position);
      dirToPlayer.subVectors(playerPos, enemyPos);
      const dist = dirToPlayer.length();

      // Forward direction from enemy rotation Y
      enemyForward.set(0, 0, 1).applyEuler(enemy.rotation).normalize();
      dirToPlayer.normalize();

      const angleRad = enemyForward.angleTo(dirToPlayer);
      const angleDeg = angleRad * (180 / Math.PI);

      const inCone = angleDeg <= DETECTION_CONFIG.CONE_FOV_HORIZONTAL / 2 && dist <= DETECTION_CONFIG.ALERT_DISTANCE;
      const inPeripheral = dist <= DETECTION_CONFIG.PERIPHERAL_DISTANCE;

      if (inCone || inPeripheral) {
        if (dist <= DETECTION_CONFIG.ATTACK_DISTANCE) {
          enemy.state = 'attack';
          highestThreat = Math.max(highestThreat, 3) as 0 | 1 | 2 | 3;

          enemy.attackCooldown -= delta;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = DETECTION_CONFIG.ATTACK_COOLDOWN;
            const currentHP = useGameStore.getState().player.health;
            useGameStore.getState().setPlayerHealth(currentHP - 20);
          }
        } else if (dist <= DETECTION_CONFIG.CHASE_DISTANCE || enemy.state === 'chase') {
          enemy.state = 'chase';
          highestThreat = Math.max(highestThreat, 3) as 0 | 1 | 2 | 3;
        } else {
          enemy.state = 'alert';
          highestThreat = Math.max(highestThreat, 1) as 0 | 1 | 2 | 3;
        }
      } else if (enemy.state === 'chase' || enemy.state === 'alert') {
        enemy.state = 'search';
        enemy.searchTimer = DETECTION_CONFIG.SEARCH_DURATION;
        highestThreat = Math.max(highestThreat, 1) as 0 | 1 | 2 | 3;
      } else if (enemy.state === 'search') {
        enemy.searchTimer -= delta;
        if (enemy.searchTimer <= 0) {
          enemy.state = 'idle';
        } else {
          highestThreat = Math.max(highestThreat, 1) as 0 | 1 | 2 | 3;
        }
      }
    });

    if (state.threatLevel !== highestThreat) {
      useGameStore.getState().setThreatLevel(highestThreat);
    }
  });

  return null;
}
