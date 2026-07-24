import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { RoomLayout } from './RoomLayout';

export function RuangDosen() {
  return (
    <RoomLayout width={14} depth={10} floorColor="#9ca3af" wallColor="#e2e8f0">
      {/* 3 Lecturer Desk Stations with Desktop PCs */}
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, 0, -1]}>
          <Desk position={[0, 0, 0]} />
          <Chair position={[0, 0, -0.6]} />
        </group>
      ))}

      {/* Metal Filing Cabinets */}
      <mesh position={[-5.5, 1.2, 2]}>
        <boxGeometry args={[0.8, 2.4, 2.0]} />
        <CelMaterial color="#475569" metalness={0.6} />
      </mesh>
      <mesh position={[5.5, 1.2, 2]}>
        <boxGeometry args={[0.8, 2.4, 2.0]} />
        <CelMaterial color="#475569" metalness={0.6} />
      </mesh>

      <ACUnit position={[0, 2.7, -4.7]} />

      {/* Lecturer Indi Zombie Spawn */}
      <Zombie id="zombie_dosen_indi" type="LECTURER" initialPosition={[-3, 0, -0.5]} room="ruang_dosen" nameLabel="Dosen Indi" />
      {/* Lecturer Gatot Zombie Spawn */}
      <Zombie id="zombie_dosen_gatot" type="LECTURER" initialPosition={[3, 0, -0.5]} room="ruang_dosen" nameLabel="Dosen Gatot" />

      {/* Exit Door to Lobby */}
      <Door position={[-6.9, 0, 2]} rotationY={Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
