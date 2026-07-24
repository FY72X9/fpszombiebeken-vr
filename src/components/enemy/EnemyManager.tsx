import { useGameStore } from '../../stores/GameStore';
import { Zombie } from './Zombie';

// NOTE: Some rooms define zombies inline in their room components (Kelas1A, Kelas1B,
// RuangDirektur, RuangDosen). EnemyManager only spawns zombies for rooms that do NOT
// embed their own zombie definitions, to prevent duplicate IDs.
export function EnemyManager() {
  const currentRoom = useGameStore((s) => s.currentRoom);

  return (
    <group key={currentRoom}>
      {/* ── Lobby Lt 1 ── wandering students */}
      {currentRoom === 'lobby_l1' && (
        <>
          <Zombie id="em_zombie_lb_1" type="STUDENT" initialPosition={[-3, 0, -2]} room="lobby_l1" nameLabel="Zombie Student" />
          <Zombie id="em_zombie_lb_2" type="STUDENT" initialPosition={[3, 0, -2]} room="lobby_l1" nameLabel="Zombie Student" />
        </>
      )}

      {/* ── Koridor Lt 2 ── patrolling zombies */}
      {currentRoom === 'koridor_l2' && (
        <>
          <Zombie id="em_zombie_k2_1" type="STUDENT" initialPosition={[-3, 0, 0]} room="koridor_l2" nameLabel="Zombie Student" />
          <Zombie id="em_zombie_k2_2" type="STUDENT" initialPosition={[3, 0, -3]} room="koridor_l2" nameLabel="Zombie Student" />
        </>
      )}

      {/* ── Kelas 2B ── */}
      {currentRoom === 'kelas_2b' && (
        <Zombie id="em_zombie_2b_1" type="STUDENT" initialPosition={[0, 0, -1]} room="kelas_2b" nameLabel="Zombie Student" />
      )}

      {/* ── Kelas 2C ── */}
      {currentRoom === 'kelas_2c' && (
        <Zombie id="em_zombie_2c_1" type="STUDENT" initialPosition={[1, 0, 1]} room="kelas_2c" nameLabel="Zombie Student" />
      )}
    </group>
  );
}
