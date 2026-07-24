import { useState, useEffect } from 'react';
import { useGameStore } from '../../../stores/GameStore';
import { RoomId } from '../../../types/game';
import { registerInteractiveDoor, unregisterInteractiveDoor } from '../../interaction/InteractionSystem';
import { DOOR_TRANSITION_SPAWNS } from '../../../constants/roomGraph';
import { emitNoise } from '../../../systems/NoiseSystem';
import { NOISE_CONFIG } from '../../../constants/gameConfig';

interface DoorProps {
  position: [number, number, number];
  rotationY?: number;
  targetRoom: RoomId;
  label?: string;
}

export function Door({ position, rotationY = 0, targetRoom, label = 'Pintu' }: DoorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setRoom = useGameStore((s) => s.setRoom);
  const currentRoom = useGameStore((s) => s.currentRoom);

  const doTransition = () => {
    const entry = DOOR_TRANSITION_SPAWNS[currentRoom]?.[targetRoom];
    const spawnPos = entry ? [entry[0], entry[1], entry[2]] as [number, number, number] : undefined;
    const facingY = entry ? entry[3] : undefined;
    setRoom(targetRoom, spawnPos, facingY);
    emitNoise({
      position,
      radius: NOISE_CONFIG.DOOR_SLOW.radius,
      intensity: NOISE_CONFIG.DOOR_SLOW.intensity,
      type: 'door'
    });
  };

  useEffect(() => {
    const doorId = `door_${position.join('_')}`;
    registerInteractiveDoor({
      id: doorId,
      position,
      targetRoom,
      label,
      action: doTransition
    });
    return () => { unregisterInteractiveDoor(doorId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.join(','), targetRoom, label, currentRoom]);

  const toggleDoor = (e: any) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    doTransition();
  };

  const doorAngle = isOpen ? Math.PI / 2 : 0;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Door Frame left */}
      <mesh position={[-0.6, 1.25, 0]}>
        <boxGeometry args={[0.1, 2.5, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Door Frame right */}
      <mesh position={[0.6, 1.25, 0]}>
        <boxGeometry args={[0.1, 2.5, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Door Frame top */}
      <mesh position={[0, 2.57, 0]}>
        <boxGeometry args={[1.3, 0.15, 0.15]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Door Panel (pivot on left edge) */}
      <group position={[-0.55, 0, 0]} rotation={[0, doorAngle, 0]}>
        <mesh position={[0.55, 1.25, 0]} onClick={toggleDoor} castShadow>
          <boxGeometry args={[1.1, 2.5, 0.07]} />
          <meshStandardMaterial color="#6d28d9" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Decorative glass strip */}
        <mesh position={[0.55, 1.65, 0.04]}>
          <boxGeometry args={[0.7, 0.5, 0.01]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.6} />
        </mesh>
        {/* Door knob */}
        <mesh position={[1.0, 1.2, 0.06]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Glowing indicator strip at top frame */}
      <mesh position={[0, 2.62, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.12]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
    </group>
  );
}
