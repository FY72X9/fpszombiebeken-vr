import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/GameStore';
import { DETECTION_CONFIG } from '../constants/gameConfig';

export interface EnemyEntity {
  id: string;
  type: 'STUDENT' | 'LECTURER' | 'BOSS_WILLY';
  nameLabel?: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  state: 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'search' | 'stunned' | 'cured';
  health: number;
  maxHealth: number;
  stunTimer: number;
  searchTimer: number;
  attackCooldown: number;
  room: string;
  isInjecting?: boolean;
  injectionProgress?: number; // 0 to 100
}

// Global active enemies registry
export const activeEnemiesMap = new Map<string, EnemyEntity>();

// ─── DAMAGE MANAGEMENT SYSTEM ────────────────────────────────────────────────
let globalIFrameTimer = 0; // 1.0s invulnerability period after receiving hit
let damageFlashRatio = 0;   // 0 to 1 blood vignette flash ratio
let outOfCombatTimer = 0;   // timer for out-of-combat health recovery

export function getDamageFlashRatio(): number {
  return damageFlashRatio;
}

export function triggerPlayerDamage(amount: number, attackerName: string = 'Zombie') {
  if (globalIFrameTimer > 0) return; // Invulnerability protection

  const state = useGameStore.getState();
  if (state.phase !== 'playing') return;

  // Crouch damage mitigation (25% damage reduction when crouching)
  const isCrouch = state.player.isCrouching;
  const finalDamage = isCrouch ? Math.round(amount * 0.75) : amount;
  const currentHP = state.player.health;
  const newHP = Math.max(0, currentHP - finalDamage);

  // Set 1.0s invulnerability frame & 1.0 blood flash
  globalIFrameTimer = 1.0;
  damageFlashRatio = 1.0;
  outOfCombatTimer = 0;

  state.setPlayerHealth(newHP);

  const crouchText = isCrouch ? ' [Tahan Damage -25%]' : '';
  state.setDetectionMessage(`[⚠️ DISERANG ${attackerName.toUpperCase()}] -${finalDamage} HP${crouchText} (Sisa HP: ${newHP})`);
  setTimeout(() => state.setDetectionMessage(null), 2500);

  // Trigger Game Over on 0 HP
  if (newHP <= 0) {
    setTimeout(() => {
      state.setPhase('gameover');
    }, 400);
  }
}

export function DetectionSystem() {
  const playerPos = new THREE.Vector3();
  const enemyPos = new THREE.Vector3();
  const enemyForward = new THREE.Vector3();
  const dirToPlayer = new THREE.Vector3();

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing') return;

    // Decay damage I-Frame & Red blood flash
    if (globalIFrameTimer > 0) {
      globalIFrameTimer -= delta;
    }
    if (damageFlashRatio > 0) {
      damageFlashRatio = Math.max(0, damageFlashRatio - delta * 2.2);
    }

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
      const isChasing = enemy.state === 'chase' || enemy.state === 'attack';

      if (inCone || inPeripheral || isChasing) {
        if (dist <= 1.8) {
          // ATTACK RANGE
          enemy.state = 'attack';
          highestThreat = Math.max(highestThreat, 3) as 0 | 1 | 2 | 3;

          enemy.attackCooldown -= delta;
          if (enemy.attackCooldown <= 0) {
            // Base cooldown & damage per archetype
            const attackInterval = enemy.type === 'BOSS_WILLY' ? 1.2 : enemy.type === 'LECTURER' ? 1.5 : 1.8;
            const baseDamage = enemy.type === 'BOSS_WILLY' ? 28 : enemy.type === 'LECTURER' ? 18 : 12;
            const name = enemy.type === 'BOSS_WILLY' ? 'Boss Willy' : enemy.type === 'LECTURER' ? 'Dosen Zombie' : 'Zombie Student';
            
            enemy.attackCooldown = attackInterval;
            triggerPlayerDamage(baseDamage, name);
          }
        } else if (dist <= DETECTION_CONFIG.CHASE_DISTANCE || isChasing) {
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

    // ── Out-Of-Combat Health Recovery ──
    if (highestThreat === 0) {
      outOfCombatTimer += delta;
      if (outOfCombatTimer > 8.0 && state.player.health < 50) {
        const recovered = Math.min(50, state.player.health + delta * 2.5);
        state.setPlayerHealth(recovered);
      }
    } else {
      outOfCombatTimer = 0;
    }

    if (state.threatLevel !== highestThreat) {
      useGameStore.getState().setThreatLevel(highestThreat);
    }
  });

  return null;
}
