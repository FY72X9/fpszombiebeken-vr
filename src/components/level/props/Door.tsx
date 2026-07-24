import { useState } from 'react';
import { useGameStore } from '../../../stores/GameStore';
import { emitNoise } from '../../../systems/NoiseSystem';
import { NOISE_CONFIG } from '../../../constants/gameConfig';
import { RoomId } from '../../../types/game';

interface DoorProps {
  position: [number, number, number];
  rotationY?: number;
  targetRoom: RoomId;
  label?: string;
}

export function Door({ position, rotationY = 0, targetRoom, label: _label = 'Pintu' }: DoorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setRoom = useGameStore((s) => s.setRoom);
  const playerPos = useGameStore((s) => s.player.position);

  const toggleDoor = (e: any) => {
    e.stopPropagation();
    const nextState = !isOpen;
    setIsOpen(nextState);

    emitNoise({
      position,
      radius: NOISE_CONFIG.DOOR_SLOW.radius,
      intensity: NOISE_CONFIG.DOOR_SLOW.intensity,
      type: 'door'
    });

    // Transition room if player is close
    const dist = Math.hypot(playerPos[0] - position[0], playerPos[2] - position[2]);
    if (dist < 3) {
      setRoom(targetRoom);
    }
  };

  const doorAngle = isOpen ? Math.PI / 2 : 0;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Doorframe */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#2d3748" wireframe />
      </mesh>

      {/* Animated Pivot Panel */}
      <group position={[-0.55, 0, 0]} rotation={[0, doorAngle, 0]}>
        <mesh position={[0.55, 1.25, 0]} onClick={toggleDoor}>
          <boxGeometry args={[1.1, 2.4, 0.08]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.3} />
        </mesh>
        {/* Door Knob */}
        <mesh position={[1.0, 1.2, 0.06]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
