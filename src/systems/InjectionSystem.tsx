import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/GameStore';
import { activeEnemiesMap } from './DetectionSystem';
import { PLAYER_CONFIG } from '../constants/gameConfig';

export interface InjectionProgress {
  targetId: string;
  progressMs: number;
}

export let currentInjectionProgress: InjectionProgress | null = null;

export function startInjection(targetId: string) {
  currentInjectionProgress = { targetId, progressMs: 0 };
}

export function cancelInjection() {
  if (currentInjectionProgress) {
    const enemy = activeEnemiesMap.get(currentInjectionProgress.targetId);
    if (enemy) {
      enemy.isInjecting = false;
      enemy.injectionProgress = 0;
    }
  }
  currentInjectionProgress = null;
}

export function getActiveInjectionInfo(): { targetId: string; progressPercent: number } | null {
  if (!currentInjectionProgress) return null;
  const ratio = Math.min(1.0, currentInjectionProgress.progressMs / PLAYER_CONFIG.injectionTime);
  return {
    targetId: currentInjectionProgress.targetId,
    progressPercent: Math.round(ratio * 100)
  };
}

export function InjectionSystem() {
  const [progressRatio, setProgressRatio] = useState<number>(0);

  useFrame((_, delta) => {
    if (!currentInjectionProgress) {
      if (progressRatio !== 0) setProgressRatio(0);
      return;
    }

    const enemy = activeEnemiesMap.get(currentInjectionProgress.targetId);
    if (!enemy || enemy.state === 'cured') {
      if (enemy) {
        enemy.isInjecting = false;
        enemy.injectionProgress = 0;
      }
      currentInjectionProgress = null;
      setProgressRatio(0);
      return;
    }

    currentInjectionProgress.progressMs += delta * 1000;
    const ratio = Math.min(1.0, currentInjectionProgress.progressMs / PLAYER_CONFIG.injectionTime);
    setProgressRatio(ratio);

    // Update target zombie's individual injection state
    enemy.isInjecting = true;
    enemy.injectionProgress = Math.round(ratio * 100);

    if (currentInjectionProgress.progressMs >= PLAYER_CONFIG.injectionTime) {
      enemy.state = 'cured';
      enemy.isInjecting = false;
      enemy.injectionProgress = 100;
      currentInjectionProgress = null;

      const state = useGameStore.getState();
      state.markZombieCured(enemy.id);

      const antidoteItem = state.player.inventory.find((i) => i.type === 'antidote');
      if (antidoteItem) {
        state.removeInventoryItem(antidoteItem.id);
      }

      if (enemy.type === 'BOSS_GATOT' || enemy.id.includes('gatot')) {
        state.setCured('gatot');
      } else if (enemy.type === 'KOH_WILLY' || enemy.id.includes('willy')) {
        state.setCured('willy');
      } else if (enemy.id.includes('indi')) {
        state.setCured('indi');
      } else {
        state.incrementStudentsCured();
      }

      const displayName = enemy.nameLabel || (enemy.type === 'BOSS_GATOT' ? 'Boss Gatot' : enemy.type === 'KOH_WILLY' ? 'Koh Willy' : enemy.type === 'LECTURER' ? 'Dosen' : 'Mahasiswa Zombie');
      state.setDetectionMessage(`[✓ SUKSES] ${displayName} (STATUS: SEMBUH / CURED)!`);
      setTimeout(() => state.setDetectionMessage(null), 3500);
    }
  });

  return null;
}
