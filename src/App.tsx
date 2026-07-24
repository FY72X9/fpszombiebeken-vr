import { useGameStore } from './stores/GameStore';
import { PlayerController } from './components/player/PlayerController';
import { LevelLoader } from './components/level/LevelLoader';
import { EnemyManager } from './components/enemy/EnemyManager';
import { GameLoop } from './systems/GameLoop';
import { AudioManager } from './components/audio/AudioManager';
import { ItemSpawner } from './components/items/ItemSpawner';
import { InteractionSystem } from './components/interaction/InteractionSystem';
import { UIManager } from './components/ui/UIManager';
import { SaveSystem } from './components/save/SaveSystem';
import { DetectionSystem } from './systems/DetectionSystem';
import { InjectionSystem } from './systems/InjectionSystem';
import { NoiseSystem } from './systems/NoiseSystem';
import { PerformanceMonitor } from './components/debug/PerformanceMonitor';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <>
      <GameLoop />
      <DetectionSystem />
      <NoiseSystem />
      <InjectionSystem />
      
      <LevelLoader />
      <ItemSpawner />
      <EnemyManager />
      <InteractionSystem />
      <PlayerController />
      
      <UIManager />
      <AudioManager />
      <SaveSystem />
      
      {phase === 'debug' && <PerformanceMonitor />}
    </>
  );
}