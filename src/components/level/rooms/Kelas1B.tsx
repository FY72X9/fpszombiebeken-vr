import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { RoomLayout } from './RoomLayout';

export function Kelas1B() {
  return (
    <RoomLayout width={12} depth={12} floorColor="#d1d5db" wallColor="#f3f4f6">
      <Whiteboard position={[0, 0, -5.8]} />
      <ACUnit position={[0, 2.7, -5.7]} />

      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Student Zombie Spawn in Kelas 1B */}
      <Zombie id="zombie_student_1b" type="STUDENT" initialPosition={[-2, 0, 0]} room="kelas_1b" nameLabel="Zombie Student 2" />

      <Door position={[-5.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
