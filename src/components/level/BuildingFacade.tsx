import { CelMaterial } from '../../shaders/CelMaterial';

export function BuildingFacade() {
  return (
    <group position={[0, 0, -12]}>
      {/* Plaza Floor */}
      <mesh position={[0, -0.05, 6]}>
        <boxGeometry args={[30, 0.1, 16]} />
        <CelMaterial color="#64748b" roughness={0.3} />
      </mesh>

      {/* Main Multi-Floor Campus Building Structure */}
      {/* Main Block */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[24, 12, 10]} />
        <CelMaterial color="#f8fafc" />
      </mesh>

      {/* Red Accent Vertical Panels (BINUS Red Signature) */}
      <mesh position={[-11, 6, 0.2]}>
        <boxGeometry args={[1.5, 12.2, 10.2]} />
        <CelMaterial color="#dc2626" />
      </mesh>
      <mesh position={[11, 6, 0.2]}>
        <boxGeometry args={[1.5, 12.2, 10.2]} />
        <CelMaterial color="#dc2626" />
      </mesh>

      {/* Navy Blue Center Frame */}
      <mesh position={[0, 7, 5.1]}>
        <boxGeometry args={[12, 8, 0.2]} />
        <CelMaterial color="#1e3a8a" />
      </mesh>

      {/* Glass Curtain Windows Grid */}
      {[-4, -2, 0, 2, 4].map((x) =>
        [3, 6, 9].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 5.23]}>
            <boxGeometry args={[1.4, 2.0, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} />
          </mesh>
        ))
      )}

      {/* Entrance Canopy Structure */}
      <mesh position={[0, 3.2, 7.5]}>
        <boxGeometry args={[8, 0.3, 5]} />
        <CelMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-3.5, 1.6, 9.5]}>
        <cylinderGeometry args={[0.15, 0.15, 3.2]} />
        <CelMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <mesh position={[3.5, 1.6, 9.5]}>
        <cylinderGeometry args={[0.15, 0.15, 3.2]} />
        <CelMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* BINUS BEKASI Campus Signboard */}
      <mesh position={[0, 3.6, 9.8]}>
        <boxGeometry args={[6, 0.7, 0.1]} />
        <CelMaterial color="#1e3a8a" />
      </mesh>
    </group>
  );
}
