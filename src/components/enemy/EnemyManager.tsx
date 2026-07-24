import { useGameStore } from '../../stores/GameStore';
import { Zombie } from './Zombie';

export function EnemyManager() {
  const currentRoom = useGameStore((s) => s.currentRoom);

  return (
    <group key={currentRoom}>
      {currentRoom === 'lobby_l1' && (
        <>
          <Zombie id="zombie_student_1" type="STUDENT" initialPosition={[-4, 0, -2]} room="lobby_l1" color="#ef4444" nameLabel="Zombie Student 1" />
          <Zombie id="zombie_student_2" type="STUDENT" initialPosition={[4, 0, -2]} room="lobby_l1" color="#ef4444" nameLabel="Zombie Student 2" />
        </>
      )}

      {currentRoom === 'kelas_1a' && (
        <>
          <Zombie id="zombie_indi" type="LECTURER" initialPosition={[0, 0, -2]} room="kelas_1a" color="#dc2626" nameLabel="Dosen Indi (Target)" />
          <Zombie id="zombie_student_3" type="STUDENT" initialPosition={[-2, 0, 1]} room="kelas_1a" color="#ef4444" nameLabel="Zombie Student 3" />
        </>
      )}

      {currentRoom === 'kelas_1b' && (
        <>
          <Zombie id="zombie_student_4" type="STUDENT" initialPosition={[2, 0, -1]} room="kelas_1b" color="#ef4444" nameLabel="Zombie Student 4" />
          <Zombie id="zombie_student_5" type="STUDENT" initialPosition={[-2, 0, 1]} room="kelas_1b" color="#ef4444" nameLabel="Zombie Student 5" />
        </>
      )}

      {currentRoom === 'ruang_direktur' && (
        <>
          <Zombie id="zombie_gatot" type="LECTURER" initialPosition={[0, 0, -1]} room="ruang_direktur" color="#b91c1c" nameLabel="Dosen Gatot (Target)" />
          <Zombie id="zombie_student_6" type="STUDENT" initialPosition={[3, 0, 1]} room="ruang_direktur" color="#ef4444" nameLabel="Zombie Student 6" />
        </>
      )}

      {currentRoom === 'ruang_dosen' && (
        <>
          <Zombie id="boss_willy" type="BOSS_WILLY" initialPosition={[0, 0, -1]} room="ruang_dosen" color="#7f1d1d" nameLabel="Boss Willy (Target Direktur)" />
        </>
      )}

      {currentRoom === 'koridor_l2' && (
        <>
          <Zombie id="zombie_student_7" type="STUDENT" initialPosition={[-2, 0, 0]} room="koridor_l2" color="#ef4444" nameLabel="Zombie Student 7" />
          <Zombie id="zombie_student_8" type="STUDENT" initialPosition={[2, 0, 0]} room="koridor_l2" color="#ef4444" nameLabel="Zombie Student 8" />
        </>
      )}

      {currentRoom === 'kelas_2b' && (
        <>
          <Zombie id="zombie_student_9" type="STUDENT" initialPosition={[0, 0, -1]} room="kelas_2b" color="#ef4444" nameLabel="Zombie Student 9" />
        </>
      )}

      {currentRoom === 'kelas_2c' && (
        <>
          <Zombie id="zombie_student_10" type="STUDENT" initialPosition={[1, 0, 1]} room="kelas_2c" color="#ef4444" nameLabel="Zombie Student 10" />
        </>
      )}
    </group>
  );
}
