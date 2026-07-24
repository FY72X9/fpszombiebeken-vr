import { useEffect } from 'react';
import { useXR } from '@react-three/xr';
import { useGameStore } from './stores/GameStore';
import { PlayerController } from './components/player/PlayerController';
import { PlayerArms } from './components/player/PlayerArms';
import { LevelLoader } from './components/level/LevelLoader';
import { EnemyManager } from './components/enemy/EnemyManager';
import { GameLoop } from './systems/GameLoop';
import { AudioManager } from './components/audio/AudioManager';
import { ItemSpawner } from './components/items/ItemSpawner';
import { InteractionSystem } from './components/interaction/InteractionSystem';
import { SaveSystem } from './components/save/SaveSystem';
import { DetectionSystem } from './systems/DetectionSystem';
import { InjectionSystem } from './systems/InjectionSystem';
import { NoiseSystem } from './systems/NoiseSystem';
import { VRHUD } from './components/ui/VRHUD';
import { PerformanceMonitor } from './components/debug/PerformanceMonitor';

function VRSessionTracker() {
  const session = useXR((s) => s.session);
  useEffect(() => {
    useGameStore.setState((s) => ({
      player: { ...s.player, isInVR: !!session }
    }));
  }, [session]);
  return null;
}

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <>
      <VRSessionTracker />
      <GameLoop />
      <DetectionSystem />
      <NoiseSystem />
      <InjectionSystem />
      <AudioManager />
      <SaveSystem />
      
      <LevelLoader />
      <ItemSpawner />
      <EnemyManager />
      <InteractionSystem />
      <PlayerController />
      <PlayerArms />
      <VRHUD />
      
      {phase === 'debug' && <PerformanceMonitor />}
    </>
  );
}