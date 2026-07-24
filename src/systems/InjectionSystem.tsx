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

    currentInjectionProgress.progressMs += delta * 1000;
    const ratio = Math.min(1.0, currentInjectionProgress.progressMs / PLAYER_CONFIG.injectionTime);
    setProgressRatio(ratio);

    if (currentInjectionProgress.progressMs >= PLAYER_CONFIG.injectionTime) {
      enemy.state = 'cured';
      currentInjectionProgress = null;

      const state = useGameStore.getState();
      const antidoteItem = state.player.inventory.find((i) => i.type === 'antidote');
      if (antidoteItem) {
        state.removeInventoryItem(antidoteItem.id);
      }

      if (enemy.type === 'BOSS_WILLY') state.setCured('willy');
      else if (enemy.id.includes('indi')) state.setCured('indi');
      else if (enemy.id.includes('gatot')) state.setCured('gatot');
      else state.incrementStudentsCured();

      state.setDetectionMessage(`[✓ SUKSES] ${enemy.id.toUpperCase()} telah disembuhkan dengan Antidot!`);
      setTimeout(() => state.setDetectionMessage(null), 3000);
    }
  });

  if (!currentInjectionProgress || progressRatio <= 0) return null;

  return (
    <group position={[0, 2.3, 0]}>
      {/* 3D High-Visibility Glowing Antidote Injection Progress Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.06, 16, 32, progressRatio * Math.PI * 2]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {/* Glowing Inner Core */}
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
    </group>
  );
}
