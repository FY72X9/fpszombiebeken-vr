import { useGameStore } from '../../stores/GameStore';
import { EnvironmentBackdrop } from './EnvironmentBackdrop';
import { LobbyLantai1 } from './rooms/LobbyLantai1';
import { Kelas1A } from './rooms/Kelas1A';
import { Kelas1B } from './rooms/Kelas1B';
import { RuangDirektur } from './rooms/RuangDirektur';
import { RuangDosen } from './rooms/RuangDosen';
import { Stairs, KoridorLantai2 } from './rooms/KoridorLantai2';
import { Kelas2A } from './rooms/Kelas2A';
import { Kelas2B, Kelas2C } from './rooms/Kelas2B';
import { NusaFollower } from '../npc/NusaFollower';

export function LevelLoader() {
  const currentRoom = useGameStore((s) => s.currentRoom);

  const renderRoom = () => {
    switch (currentRoom) {
      case 'lobby_l1':
      case 'entrance':
        return <LobbyLantai1 />;
      case 'kelas_1a':
        return <Kelas1A />;
      case 'kelas_1b':
        return <Kelas1B />;
      case 'ruang_direktur':
        return <RuangDirektur />;
      case 'ruang_dosen':
        return <RuangDosen />;
      case 'stairs_l1_to_l2':
        return <Stairs />;
      case 'koridor_l2':
        return <KoridorLantai2 />;
      case 'kelas_2a':
        return <Kelas2A />;
      case 'kelas_2b':
        return <Kelas2B />;
      case 'kelas_2c':
        return <Kelas2C />;
      default:
        return <LobbyLantai1 />;
    }
  };

  return (
    <group>
      <EnvironmentBackdrop />
      {renderRoom()}
      <NusaFollower />
    </group>
  );
}
