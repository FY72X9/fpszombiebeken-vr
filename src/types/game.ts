/**
 * Core game state types for FPZombieBeken VR
 */

export type GamePhase = 'menu' | 'intro' | 'playing' | 'paused' | 'gameover' | 'win' | 'debug';

export type Vector3Tuple = [number, number, number];

export type RoomId =
  | 'entrance'
  | 'lobby_l1'
  | 'kelas_1a'
  | 'kelas_1b'
  | 'ruang_direktur'
  | 'ruang_dosen'
  | 'stairs_l1_to_l2'
  | 'koridor_l2'
  | 'kelas_2a'
  | 'kelas_2b'
  | 'kelas_2c';

export interface RoomNode {
  id: RoomId;
  floor: 1 | 2;
  spawn?: string[];
  connections: RoomId[];
  hasStairs?: boolean;
}

export type ZombieState = 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'search' | 'stunned' | 'cured';

export type PlayerForm = 'normal' | 'crouch' | 'sprint' | 'aim';

export type ItemType =
  | 'antidote'
  | 'handgun'
  | 'ammo_clip'
  | 'bandage'
  | 'flashlight'
  | 'lure'
  | 'key'
  | 'note';

export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  count: number;
  description: string;
  iconPath: string;
  data?: Record<string, any>;
}

export type IngredientType = 'amry_1' | 'amry_2' | 'amry_3' | 'catalyst';

export interface PlayerState {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  inventory: InventoryItem[];
  equippedSlot: number;
  isInVR: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  injectionsUsed: number;
  injectionsConsumed: number;
}

export interface NusaState {
  position: Vector3Tuple;
  state: 'hiding' | 'following' | 'cured' | 'dead' | 'rescued';
  health: number;
  currentRoom: RoomId;
}

export interface CureState {
  antidoteCrafted: boolean;
  willyCured: boolean;
  indiCured: boolean;
  gatotCured: boolean;
  studentsCured: number;
  totalStudents: number;
}

export interface SaveData {
  checkpointRoom: RoomId;
  timestamp: number;
  playerState: PlayerState;
  nusaState: NusaState;
  cureState: CureState;
}

export interface NoiseEvent {
  position: Vector3Tuple;
  radius: number;
  intensity: number;
  type: 'footstep' | 'door' | 'gunshot' | 'throw' | 'collision';
}
