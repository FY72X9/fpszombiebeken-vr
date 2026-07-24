import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Sofa } from '../props/Furniture';

export function RuangDirektur() {
  return (
    <group position={[0, 0, 0]}>
      {/* Wooden floor & high ceiling */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 8]} />
        <CelMaterial color="#78350f" roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[10, 0.1, 8]} />
        <CelMaterial color="#451a03" />
      </mesh>

      {/* Luxury Walls */}
      <mesh position={[0, 1.6, -4]}>
        <boxGeometry args={[10, 3.2, 0.2]} />
        <CelMaterial color="#fef3c7" />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[0, 2.8, 0]} intensity={0.7} color="#fbbf24" />

      {/* Executive Desk */}
      <group position={[0, 0, -2]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, -0.7]} />
      </group>

      {/* Guest Lounge Sofas */}
      <Sofa position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
      <Sofa position={[3, 0, 1]} rotation={[0, -Math.PI / 2, 0]} />

      <Door position={[4.9, 0, 2]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </group>
  );
}
