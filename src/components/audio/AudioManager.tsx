import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/GameStore';

export function AudioManager() {
  const threatLevel = useGameStore((s) => s.threatLevel);
  const synthRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      synthRef.current = ctx;
    } catch {
      // Audio context unavailable
    }
  }, [threatLevel]);

  return null;
}
