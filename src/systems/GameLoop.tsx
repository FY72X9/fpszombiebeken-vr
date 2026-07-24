import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/GameStore';
import { PLAYER_CONFIG } from '../constants/gameConfig';

export function GameLoop() {
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing') return;

    const { player, updatePlayerStamina } = state;

    // Handle Stamina Drain & Regen
    if (player.isSprinting) {
      const nextStamina = Math.max(0, player.stamina - PLAYER_CONFIG.staminaDrainSprint * delta);
      updatePlayerStamina(nextStamina);
      if (nextStamina <= 0) {
        useGameStore.setState((s) => ({ player: { ...s.player, isSprinting: false } }));
      }
    } else {
      if (player.stamina < player.maxStamina) {
        updatePlayerStamina(Math.min(player.maxStamina, player.stamina + PLAYER_CONFIG.staminaRegen * delta));
      }
    }

    // Check Win / Lose conditions
    if (player.health <= 0) {
      useGameStore.getState().setPhase('gameover');
    }
  });

  return null;
}
