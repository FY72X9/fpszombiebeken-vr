import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard } from '../props/Furniture';
import { NusaNPC } from '../../npc/NusaNPC';
import { RoomLayout } from './RoomLayout';

export function Kelas2A() {
  return (
    <RoomLayout width={12} depth={12} floorColor="#d1d5db" wallColor="#f3f4f6">
      <Whiteboard position={[0, 0, -5.8]} />

      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      <NusaNPC position={[-2, 0, -2]} />

      <Door position={[0, 0, 5.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}
