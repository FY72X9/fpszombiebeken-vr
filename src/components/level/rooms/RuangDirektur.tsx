import { Door } from '../props/Door';
import { Desk, Chair, Sofa } from '../props/Furniture';
import { RoomLayout } from './RoomLayout';

export function RuangDirektur() {
  return (
    <RoomLayout width={12} depth={10} floorColor="#78350f" wallColor="#fef3c7">
      <group position={[0, 0, -2]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, -0.7]} />
      </group>

      <Sofa position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
      <Sofa position={[3, 0, 1]} rotation={[0, -Math.PI / 2, 0]} />

      <Door position={[5.9, 0, 2]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
