import { RoomId } from '../types/game';

export interface InteractiveTarget {
  id: string;
  position: [number, number, number];
  targetRoom?: RoomId;
  label: string;
  action: () => void;
}

export const registeredDoorsMap = new Map<string, InteractiveTarget>();

export function registerInteractiveDoor(target: InteractiveTarget) {
  registeredDoorsMap.set(target.id, target);
}

export function unregisterInteractiveDoor(id: string) {
  registeredDoorsMap.delete(id);
}

export let triggerGlobalInteraction = () => {};

export function setTriggerGlobalInteraction(fn: () => void) {
  triggerGlobalInteraction = fn;
}
