import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard } from '../props/Furniture';

export function Kelas1A() {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor & Ceiling */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#d1d5db" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#9ca3af" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.6, -5]}>
        <boxGeometry args={[10, 3.2, 0.2]} />
        <CelMaterial color="#f3f4f6" />
      </mesh>
      <mesh position={[-5, 1.6, 0]}>
        <boxGeometry args={[0.2, 3.2, 10]} />
        <CelMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[5, 1.6, 0]}>
        <boxGeometry args={[0.2, 3.2, 10]} />
        <CelMaterial color="#e5e7eb" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.8, 0]} intensity={0.6} color="#fef08a" />

      {/* Whiteboard */}
      <Whiteboard position={[0, 0, -4.8]} />

      {/* Student Desks & Chairs Grid */}
      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Return Door */}
      <Door position={[4.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </group>
  );
}
