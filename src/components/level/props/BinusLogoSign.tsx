import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface BinusLogoSignProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, 1];
  logoPath?: string; // '/assets/logo/BU-SIS-YellowDot.png' or '/assets/logo/BU-School-of-Information-System--Satuan.png'
}

export function BinusLogoSign({
  position,
  rotation = [0, 0, 0],
  scale = [2.4, 0.8, 1],
  logoPath = '/assets/logo/BU-SIS-YellowDot.png'
}: BinusLogoSignProps) {
  const texture = useTexture(logoPath);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.08}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}
