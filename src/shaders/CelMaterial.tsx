import { useMemo } from 'react';
import * as THREE from 'three';

interface CelMaterialProps {
  color?: string | THREE.Color;
  roughness?: number;
  metalness?: number;
  rimColor?: string | THREE.Color;
  rimPower?: number;
  wireframe?: boolean;
}

export function CelMaterial({
  color = '#4a7c59',
  roughness = 0.4,
  metalness = 0.1,
  wireframe = false,
}: CelMaterialProps) {
  const customColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <meshStandardMaterial
      color={customColor}
      roughness={roughness}
      metalness={metalness}
      wireframe={wireframe}
    />
  );
}
