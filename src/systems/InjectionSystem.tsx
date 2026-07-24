import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/GameStore';
import { activeEnemiesMap } from './DetectionSystem';
import { PLAYER_CONFIG } from '../constants/gameConfig';

export interface InjectionProgress {
  targetId: string;
  progressMs: number; // 0 to 2500
}

export let currentInjectionProgress: InjectionProgress | null = null;

export function startInjection(targetId: string) {
  currentInjectionProgress = { targetId, progressMs: 0 };
}

export function cancelInjection() {
  currentInjectionProgress = null;
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
      currentInjectionProgress = null;
      setProgressRatio(0);
      return;
    }

    // Advance timer
    currentInjectionProgress.progressMs += delta * 1000;
    const ratio = Math.min(1.0, currentInjectionProgress.progressMs / PLAYER_CONFIG.injectionTime);
    setProgressRatio(ratio);

    if (currentInjectionProgress.progressMs >= PLAYER_CONFIG.injectionTime) {
      // Complete injection!
      enemy.state = 'cured';
      currentInjectionProgress = null;

      // Consume antidote syringe
      const state = useGameStore.getState();
      const antidoteItem = state.player.inventory.find((i) => i.type === 'antidote');
      if (antidoteItem) {
        state.removeInventoryItem(antidoteItem.id);
      }

      // Record cure flags
      if (enemy.type === 'BOSS_WILLY') state.setCured('willy');
      else if (enemy.id.includes('indi')) state.setCured('indi');
      else if (enemy.id.includes('gatot')) state.setCured('gatot');
      else state.incrementStudentsCured();

      state.setDetectionMessage(`${enemy.id.toUpperCase()} successfully cured with antidote!`);
      setTimeout(() => state.setDetectionMessage(null), 3000);
    }
  });

  if (!currentInjectionProgress || progressRatio <= 0) return null;

  return null;
}
