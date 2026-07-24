import { useEffect } from 'react';
import { useGameStore } from '../../stores/GameStore';

export function SaveSystem() {
  const currentRoom = useGameStore((s) => s.currentRoom);
  const saveGame = useGameStore((s) => s.saveGame);

  useEffect(() => {
    saveGame();
  }, [currentRoom, saveGame]);

  return null;
}
