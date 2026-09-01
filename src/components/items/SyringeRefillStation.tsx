import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { CelMaterial } from '../../shaders/CelMaterial';
import { registerInteractiveDoor, unregisterInteractiveDoor } from '../../systems/InteractionManager';

export function SyringeRefillStation({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore((s) => s.player.position);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);
  const inventory = useGameStore((s) => s.player.inventory);
  const antidoteCount = inventory.filter((i) => i.type === 'antidote').reduce((acc, cur) => acc + (cur.count || 1), 0);

  const refillAction = () => {
    const state = useGameStore.getState();
    state.addInventoryItem(
      `antidote_${Date.now()}`,
      'antidote',
      'Antidote Syringe',
      2
    );

    setDetectionMessage('[+2 ANTIDOT] Syringe Refill Berhasil!');
    setTimeout(() => setDetectionMessage(null), 3000);
  };

  useEffect(() => {
    const stationId = `refill_station_${position.join('_')}`;
    registerInteractiveDoor({
      id: stationId,
      position,
      action: refillAction,
      label: 'Stasiun Refill Antidot'
    });
    return () => {
      unregisterInteractiveDoor(stationId);
    };
  }, [position]);

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const t = clock.getElapsedTime();
      beaconRef.current.rotation.y = t * 1.5;
      beaconRef.current.position.y = 2.1 + Math.sin(t * 3) * 0.08;
    }
  });

  const handleRefill = (e: any) => {
    e.stopPropagation();
    const dist = Math.hypot(playerPos[0] - position[0], playerPos[2] - position[2]);
    if (dist < 3.5) {
      refillAction();
    }
  };

  const isEmpty = antidoteCount === 0;

  return (
    <group ref={groupRef} position={position} onClick={handleRefill}>
      {/* Station Cabinet */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.5]} />
        <CelMaterial color="#0284c7" />
      </mesh>
      {/* Medical Cross Symbol */}
      <mesh position={[0, 1.2, 0.26]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.2, 0.26]}>
        <boxGeometry args={[0.08, 0.3, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ── 3D HOLOGRAPHIC FLOATING BEACON ON TOP ── */}
      <group ref={beaconRef} position={[0, 2.1, 0]}>
        <mesh>
          <octahedronGeometry args={[0.18, 0]} />
          <meshBasicMaterial color={isEmpty ? '#facc15' : '#38bdf8'} wireframe />
        </mesh>
        <pointLight color={isEmpty ? '#eab308' : '#0284c7'} intensity={isEmpty ? 3.0 : 1.5} distance={5} />
      </group>

      {/* ── 3D FLOATING LABEL ── */}
      <group position={[0, 2.5, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.9, 0.38]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.06, 0.01]}
          fontSize={0.13}
          color={isEmpty ? '#facc15' : '#38bdf8'}
          anchorX="center"
          anchorY="middle"
        >
          🧪 REFILL ANTIDOT STATION
        </Text>
        <Text
          position={[0, -0.08, 0.01]}
          fontSize={0.10}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          [E / Trigger] Ambil +2 Antidot
        </Text>
      </group>
    </group>
  );
}
