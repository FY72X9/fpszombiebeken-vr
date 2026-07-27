import { CelMaterial } from '../../shaders/CelMaterial';

export function BuildingFacade() {
  return (
    <group position={[0, 0, 0]}>
      {/* Exterior Plaza Floor (South of Lobby, Z = +8.01 to +24) */}
      <mesh position={[0, -0.05, 16]}>
        <boxGeometry args={[30, 0.1, 16]} />
        <CelMaterial color="#64748b" roughness={0.3} />
      </mesh>

      {/* Exterior Back Wall Shell (North of Lobby, Z = -8.25) */}
      <mesh position={[0, 6, -8.25]}>
        <boxGeometry args={[24, 12, 0.3]} />
        <CelMaterial color="#f8fafc" />
      </mesh>

      {/* Red Accent Vertical Panels (BINUS Red Signature - Exterior Sides) */}
      <mesh position={[-11.5, 6, 0]}>
        <boxGeometry args={[1.5, 12.2, 16.5]} />
        <CelMaterial color="#dc2626" />
      </mesh>
      <mesh position={[11.5, 6, 0]}>
        <boxGeometry args={[1.5, 12.2, 16.5]} />
        <CelMaterial color="#dc2626" />
      </mesh>

      {/* Navy Blue Center Frame (South Front Entrance at Z = 8.15) */}
      <mesh position={[0, 7, 8.15]}>
        <boxGeometry args={[12, 8, 0.2]} />
        <CelMaterial color="#1e3a8a" />
      </mesh>

      {/* Glass Curtain Windows Grid (South Front Exterior at Z = 8.28) */}
      {[-4, -2, 0, 2, 4].map((x) =>
        [3, 6, 9].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 8.28]}>
            <boxGeometry args={[1.4, 2.0, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} />
          </mesh>
        ))
      )}

      {/* South Entrance Canopy Structure (Extending Z = +8.5 to +13.5) */}
      <mesh position={[0, 3.2, 11.0]}>
        <boxGeometry args={[8, 0.3, 5]} />
        <CelMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-3.5, 1.6, 13.0]}>
        <cylinderGeometry args={[0.15, 0.15, 3.2]} />
        <CelMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <mesh position={[3.5, 1.6, 13.0]}>
        <cylinderGeometry args={[0.15, 0.15, 3.2]} />
        <CelMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* BINUS BEKASI Campus Signboard (South Entrance Canopy Top) */}
      <mesh position={[0, 3.6, 13.3]}>
        <boxGeometry args={[6, 0.7, 0.1]} />
        <CelMaterial color="#1e3a8a" />
      </mesh>
    </group>
  );
}

