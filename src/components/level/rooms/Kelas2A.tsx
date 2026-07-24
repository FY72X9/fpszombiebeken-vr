import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard } from '../props/Furniture';
import { NusaNPC } from '../../npc/NusaNPC';

export function Kelas2A() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#d1d5db" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#9ca3af" />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.8, 0]} intensity={0.6} color="#fef08a" />

      <Whiteboard position={[0, 0, -4.8]} />

      {/* Classroom Desks */}
      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Nusa NPC hiding under back desk */}
      <NusaNPC position={[-2, 0, -2]} />

      <Door position={[0, 0, 4.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </group>
  );
}
