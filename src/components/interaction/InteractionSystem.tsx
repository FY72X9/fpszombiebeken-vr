import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { RoomId } from '../../types/game';

export interface InteractiveTarget {
  id: string;
  position: [number, number, number];
  targetRoom?: RoomId;
  label: string;
  action: () => void;
}

const registeredDoorsMap = new Map<string, InteractiveTarget>();

export function registerInteractiveDoor(target: InteractiveTarget) {
  registeredDoorsMap.set(target.id, target);
}

export function unregisterInteractiveDoor(id: string) {
  registeredDoorsMap.delete(id);
}

export let triggerGlobalInteraction = () => {};

export function InteractionSystem() {
  const [promptText, setPromptText] = useState<string | null>(null);
  const playerPos = useGameStore((s) => s.player.position);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);

  useFrame(() => {
    const pPos = new THREE.Vector3(...playerPos);
    let nearestTarget: InteractiveTarget | null = null;
    let minDistance = 3.0;

    registeredDoorsMap.forEach((door) => {
      const doorPos = new THREE.Vector3(...door.position);
      const dist = pPos.distanceTo(doorPos);
      if (dist < minDistance) {
        minDistance = dist;
        nearestTarget = door;
      }
    });

    if (nearestTarget) {
      const label = (nearestTarget as InteractiveTarget).label;
      const action = (nearestTarget as InteractiveTarget).action;

      setPromptText(`[E] Masuk ${label}`);
      triggerGlobalInteraction = () => {
        action();
        setDetectionMessage(`Berpindah ke: ${label}`);
        setTimeout(() => setDetectionMessage(null), 2000);
      };
    } else {
      if (promptText !== null) setPromptText(null);
      triggerGlobalInteraction = () => {};
    }
  });

  if (!promptText) return null;

  return (
    <group position={[playerPos[0], playerPos[1] + 0.5, playerPos[2] - 1]}>
      {/* Floating Prompt Notification in 3D Space */}
    </group>
  );
}
