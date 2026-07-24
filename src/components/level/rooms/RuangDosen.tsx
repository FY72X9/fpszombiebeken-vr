import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair } from '../props/Furniture';

export function RuangDosen() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[12, 0.1, 8]} />
        <CelMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[12, 0.1, 8]} />
        <CelMaterial color="#4b5563" />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.8, 0]} intensity={0.5} color="#e0f2fe" />

      {/* Cubicle Desks */}
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, 0, -1]}>
          <Desk position={[0, 0, 0]} />
          <Chair position={[0, 0, -0.6]} />
        </group>
      ))}

      {/* Lockers */}
      <mesh position={[-5.5, 1.2, 2]}>
        <boxGeometry args={[0.8, 2.4, 2.0]} />
        <CelMaterial color="#475569" metalness={0.6} />
      </mesh>

      <Door position={[-5.9, 0, 2]} rotationY={Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </group>
  );
}
