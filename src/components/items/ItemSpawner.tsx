import { useGameStore } from '../../stores/GameStore';
import { SyringeRefillStation } from './SyringeRefillStation';

export function ItemSpawner() {
  const currentRoom = useGameStore((s) => s.currentRoom);

  return (
    <group>
      {currentRoom === 'lobby_l1' && <SyringeRefillStation position={[-6, 0, -5]} />}
      {currentRoom === 'ruang_dosen' && <SyringeRefillStation position={[5, 0, -3]} />}
      {currentRoom === 'kelas_1a' && <SyringeRefillStation position={[-4, 0, -4]} />}
    </group>
  );
}
