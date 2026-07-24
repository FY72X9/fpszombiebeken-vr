import { PlayerState, InventoryItem } from '../types/game';

export function computeModifiedInitialPlayer(
  saved: Partial<PlayerState> | null
): PlayerState {
  const base: PlayerState = {
    position: [0, 1.6, 0],
    rotation: [0, 0, 0],
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    inventory: [
      { id: 'antidote_1', type: 'antidote', name: 'Antidot', count: 3, description: 'Antidot untuk menyembuhkan zombie', iconPath: '/assets/icons/antidote.png' },
      { id: 'bandage_1', type: 'bandage', name: 'Bandage', count: 2, description: 'Penutup luka segera', iconPath: '/assets/icons/bandage.png' },
      { id: 'flashlight_1', type: 'flashlight', name: 'Senter', count: 1, description: 'Senter taktikal', iconPath: '/assets/icons/flashlight.png' }
    ],
    equippedSlot: 0,
    isInVR: false,
    isSprinting: false,
    isCrouching: false,
    injectionsUsed: 0,
    injectionsConsumed: 0
  };

  if (!saved) return base;

  return {
    ...base,
    ...saved,
    inventory: saved.inventory?.length ? saved.inventory : base.inventory,
    equippedSlot: Math.min(saved.equippedSlot ?? 0, (saved.inventory?.length ?? 1) - 1)
  };
}

export function validateInventoryItem(item: InventoryItem): boolean {
  const validTypes = ['antidote', 'handgun', 'ammo_clip', 'bandage', 'flashlight', 'lure', 'key', 'note'];
  return validTypes.includes(item.type) && item.count > 0;
}

export function getItemWeight(type: InventoryItem['type']): number {
  const weights: Record<InventoryItem['type'], number> = {
    antidote: 0.3,
    handgun: 2.0,
    ammo_clip: 0.5,
    bandage: 0.1,
    flashlight: 0.5,
    lure: 0.2,
    key: 0.05,
    note: 0.01
  };
  return weights[type] ?? 0.1;
}

export function getTotalWeight(inventory: InventoryItem[]): number {
  return inventory.reduce((sum, item) => sum + getItemWeight(item.type) * item.count, 0);
}

export const MAX_INVENTORY_WEIGHT = 8.0;