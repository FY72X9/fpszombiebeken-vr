import { create } from 'zustand';
import { ROOM_SPAWN_POINTS } from '../constants/roomGraph';
import { Vector3Tuple } from '../types/game';
import { resetDetectionSystem } from '../systems/DetectionSystem';

export interface InventoryItem {
  id: string;
  type:
    | 'antidote'
    | 'handgun'
    | 'ammo_clip'
    | 'bandage'
    | 'flashlight'
    | 'lure'
    | 'key'
    | 'note';
  name: string;
  count: number;
  description: string;
  iconPath: string;
  data?: Record<string, any>;
}

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
  currentRoom: string;
  isDead: boolean;
  isRescued: boolean;
}

export interface CureState {
  antidoteCrafted: boolean;
  willyCured: boolean;
  indiCured: boolean;
  gatotCured: boolean;
  studentsCured: number;
  totalStudents: number;
  curedZombieIds: string[];
}

export type GamePhase = 'menu' | 'intro' | 'playing' | 'paused' | 'gameover' | 'win' | 'debug';

interface GameStoreState {
  // Phase/State
  phase: GamePhase;
  currentRoom: string;
  saveData: any | null;
  showLoading: boolean;
  
  // Player
  player: PlayerState;
  
  // NPCs & enemies
  nusa: NusaState;
  cure: CureState;
  
  // Threat detection and status
  threatLevel: 0 | 1 | 2 | 3;
  lastDetectionMessage: string | null;
  
  // Audio
  backgroundMusicKey: string | null;
  
  // Subtasks / task lists
  objectives: any[];
  
  // Input state
  input: {
    move: Vector3Tuple | null;
    lookDelta?: [number, number] | null;
    sprint: boolean;
    crouch: boolean;
    attack: boolean;
    useInteract: boolean;
    reload: boolean;
    aim: boolean;
    fullScreen?: boolean;
  };
  
  // Controls
  controls: {
    keyboard: { [key: string]: boolean };
    vrController: {
      left: any;
      right: any;
    };
  };
  
  // UI state flags
  ui: {
    inventoryOpen: boolean;
    wristMenuActive: boolean;
    subtitleActive: boolean;
    hintsVisible: boolean;
    crosshairVisible: boolean;
  };
  
  // Debug & Dev Tools
  debug: {
    physicsDebug: boolean;
    volumeBoxId?: string;
    performanceMetrics: any;
  };
  
  // Game mechanics
  headbobOffset: { x: number; y: number; z: number };
  
  // Save/Autoshare
  lastSaveTime: number;
  autosaveInterval: number;
  
  // Audio state
  audioVolume: number;
  backgroundMusicVolume: number;
  
  // Effects
  screenShake: {
    intensity: number;
    duration: number;
    timestamp: number;
  };
  
  // Manual / control helpers
  playerInitialized: boolean;
  
  // Actions
  setPhase: (p: GamePhase) => void;
  setRoom: (id: string, spawnPos?: Vector3Tuple, facingY?: number) => void;
  setPlayerPosition: (p: Vector3Tuple) => void;
  setPlayerRotation: (r: Vector3Tuple) => void;
  setPlayerHealth: (h: number) => void;
  updatePlayerStamina: (val: number) => void;
  updatePlayerInventory: (inv: InventoryItem[]) => void;
  addInventoryItem: (id: string, type: InventoryItem['type'], name: string, count: number) => void;
  removeInventoryItem: (id: string) => void;
  setEquippedSlot: (slot: number) => void;
  setPlayerSprint: (s: boolean) => void;
  setPlayerCrouch: (c: boolean) => void;
  setNusaState: (state: Partial<NusaState>) => void;
  setCureState: (state: Partial<CureState>) => void;
  setNusaDead: (dead: boolean) => void;
  setNusaRescued: (res: boolean) => void;
  setCured: (flag: string) => void;
  markZombieCured: (id: string) => void;
  incrementStudentsCured: () => void;
  setThreatLevel: (lvl: 0 | 1 | 2 | 3) => void;
  setDetectionMessage: (msg: string | null) => void;
  setBackgroundMusic: (key: string | null) => void;
  setUiFlag: (k: keyof GameStoreState['ui'], v: any) => void;
  updateInput: (newInput: Partial<GameStoreState['input']>) => void;
  updateVRController: (hand: 'left' | 'right', ctrl: any) => void;
  reset: () => void;
  saveGame: () => void;
  loadGame: () => void;
  getSaveData: () => any;
  updateSaveData: (data: any) => void;
  setDebugFlag: (k: keyof GameStoreState['debug'], v: any) => void;
  tick: () => void;
}

const initialPlayerState: PlayerState = {
  position: [0, 1.6, 2.0],  // lobby_l1 safe interior spawn
  rotation: [0, Math.PI, 0],
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

const initialNusaState: NusaState = {
  position: [0, 0, 0],
  state: 'hiding',
  health: 100,
  currentRoom: 'kelas_2a',
  isDead: false,
  isRescued: false
};

const initialCureState: CureState = {
  antidoteCrafted: false,
  willyCured: false,
  indiCured: false,
  gatotCured: false,
  studentsCured: 0,
  totalStudents: 0,
  curedZombieIds: []
};

const initialSaveData = {
  checkpointRoom: 'lobby_l1',
  timestamp: Date.now(),
  playerState: initialPlayerState,
  nusaState: initialNusaState,
  cureState: initialCureState
};

const initialInputState = {
  move: null,
  lookDelta: null,
  sprint: false,
  crouch: false,
  attack: false,
  useInteract: false,
  reload: false,
  aim: false,
  fullScreen: false
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  phase: 'menu',
  currentRoom: 'lobby_l1',
  saveData: initialSaveData,
  showLoading: false,
  
  player: initialPlayerState,
  
  nusa: initialNusaState,
  cure: initialCureState,
  
  threatLevel: 0,
  lastDetectionMessage: null,
  
  backgroundMusicKey: null,
  
  objectives: [],
  
  input: { ...initialInputState },
  
  controls: {
    keyboard: {},
    vrController: { left: null, right: null }
  },
  
  ui: {
    inventoryOpen: false,
    wristMenuActive: false,
    subtitleActive: false,
    hintsVisible: false,
    crosshairVisible: false
  },
  
  debug: {
    physicsDebug: false,
    volumeBoxId: undefined,
    performanceMetrics: null
  },
  
  headbobOffset: { x: 0, y: 0, z: 0 },
  
  lastSaveTime: Date.now(),
  autosaveInterval: 120000,
  
  audioVolume: 0.7,
  backgroundMusicVolume: 0.5,
  
  screenShake: {
    intensity: 0,
    duration: 0,
    timestamp: 0
  },
  
  playerInitialized: false,
  
  setPhase: (p) => set({ phase: p }),
  setRoom: (id, spawnPos, facingY) => {
    const rawSpawn = ROOM_SPAWN_POINTS[id] || [0, 1.6, 2.0, 0];
    const targetPos: Vector3Tuple = spawnPos || [rawSpawn[0], rawSpawn[1], rawSpawn[2]];
    const targetFacingY = facingY !== undefined ? facingY : (rawSpawn[3] ?? 0);
    set((s) => ({
      currentRoom: id,
      player: { ...s.player, position: targetPos, rotation: [0, targetFacingY, 0] }
    }));
  },
  setPlayerPosition: (p) => set((s) => ({ player: { ...s.player, position: p } })),
  setPlayerRotation: (r) => set((s) => ({ player: { ...s.player, rotation: r } })),
  setPlayerHealth: (h) => set((s) => ({ player: { ...s.player, health: Math.min(s.player.maxHealth, Math.max(0, h)) } })),
  updatePlayerStamina: (val) => set((s) => ({ player: { ...s.player, stamina: Math.min(s.player.maxStamina, Math.max(0, val)) } })),
  updatePlayerInventory: (inv) => set({ player: { ...get().player, inventory: inv } }),
  addInventoryItem: (id, type, name, count) => {
    const items = get().player.inventory;
    const existing = items.find((i) => i.type === type);
    const updated = existing
      ? items.map((i) => (i.type === type ? { ...i, count: i.count + count } : i))
      : [...items, { id, type, name, count, description: '', iconPath: '' }];
    set({ player: { ...get().player, inventory: updated } });
  },
  removeInventoryItem: (id) => set((s) => {
    const items = s.player.inventory;
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return {};
    const newInv = [...items];
    if (items[idx].count > 1) {
      newInv[idx].count--;
    } else {
      newInv.splice(idx, 1);
    }
    return { player: { ...s.player, inventory: newInv } };
  }),
  setEquippedSlot: (slot) => set({ player: { ...get().player, equippedSlot: slot } }),
  setPlayerSprint: (s) => set((st) => ({ player: { ...st.player, isSprinting: s } })),
  setPlayerCrouch: (c) => set((st) => ({ player: { ...st.player, isCrouching: c } })),
  setNusaState: (state) => set((s) => ({ nusa: { ...s.nusa, ...state } })),
  setCureState: (state) => set((s) => ({ cure: { ...s.cure, ...state } })),
  setNusaDead: (d) => set((s) => ({ nusa: { ...s.nusa, isDead: d } })),
  setNusaRescued: (r) => set((s) => ({ nusa: { ...s.nusa, isRescued: r } })),
  setCured: (flag) => set((s) => ({
    cure: {
      ...s.cure,
      willyCured: flag === 'willy' ? true : s.cure.willyCured,
      indiCured: flag === 'indi' ? true : s.cure.indiCured,
      gatotCured: flag === 'gatot' ? true : s.cure.gatotCured,
    }
  })),
  markZombieCured: (id) => set((s) => ({
    cure: {
      ...s.cure,
      curedZombieIds: s.cure.curedZombieIds.includes(id) ? s.cure.curedZombieIds : [...s.cure.curedZombieIds, id]
    }
  })),
  incrementStudentsCured: () => set((s) => ({
    cure: { ...s.cure, studentsCured: s.cure.studentsCured + 1 }
  })),
  setThreatLevel: (lvl) => set({ threatLevel: lvl }),
  setDetectionMessage: (msg) => set({ lastDetectionMessage: msg, ui: { ...get().ui, subtitleActive: !!msg } }),
  setBackgroundMusic: (key) => set({ backgroundMusicKey: key }),
  setUiFlag: (k, v) => set((s) => ({ ui: { ...s.ui, [k]: v } })),
  updateInput: (newInput) => set((s) => ({ input: { ...s.input, ...newInput } })),
  updateVRController: (hand, ctrl) => set((s) => ({
    controls: {
      ...s.controls,
      vrController: { ...s.controls.vrController, [hand]: ctrl }
    }
  })),
  reset: () => {
    try {
      localStorage.removeItem('fpszombiebeken-save');
    } catch (e) { }

    resetDetectionSystem();

    // Initialize Bina's starter items based on core game design with fresh object copies
    const initialState = {
      phase: 'menu' as GamePhase,
      currentRoom: 'lobby_l1',
      player: {
        position: [0, 1.6, 2.0] as Vector3Tuple,
        rotation: [0, Math.PI, 0] as Vector3Tuple,
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        inventory: [
          { id: 'antidote_1', type: 'antidote' as const, name: 'Antidot', count: 3, description: 'Antidot untuk menyembuhkan zombie', iconPath: '/assets/icons/antidote.png' },
          { id: 'bandage_1', type: 'bandage' as const, name: 'Bandage', count: 2, description: 'Penutup luka segera', iconPath: '/assets/icons/bandage.png' },
          { id: 'flashlight_1', type: 'flashlight' as const, name: 'Senter', count: 1, description: 'Senter taktikal', iconPath: '/assets/icons/flashlight.png' }
        ],
        equippedSlot: 0,
        isInVR: false,
        isSprinting: false,
        isCrouching: false,
        injectionsUsed: 0,
        injectionsConsumed: 0
      },
      nusa: {
        position: [0, 0, 0] as Vector3Tuple,
        state: 'hiding' as const,
        health: 100,
        currentRoom: 'kelas_2a',
        isDead: false,
        isRescued: false
      },
      cure: {
        antidoteCrafted: false,
        willyCured: false,
        indiCured: false,
        gatotCured: false,
        studentsCured: 0,
        totalStudents: 0,
        curedZombieIds: []
      },
      threatLevel: 0 as 0 | 1 | 2 | 3,
      lastDetectionMessage: null,
      backgroundMusicKey: null,
      objectives: [],
      input: { ...initialInputState },
      controls: { keyboard: {}, vrController: { left: null, right: null } },
      ui: { inventoryOpen: false, wristMenuActive: false, subtitleActive: false, hintsVisible: true, crosshairVisible: false },
      debug: { physicsDebug: false, volumeBoxId: undefined, performanceMetrics: null },
      headbobOffset: { x: 0, y: 0, z: 0 },
      saveData: initialSaveData,
      showLoading: false,
      audioVolume: 0.7,
      backgroundMusicVolume: 0.5,
      screenShake: { intensity: 0, duration: 0, timestamp: 0 },
      playerInitialized: true
    };
    set(initialState);
  },
  saveGame: () => set((s) => {
    const newSaveData = {
      checkpointRoom: s.currentRoom,
      timestamp: Date.now(),
      playerState: s.player,
      nusaState: s.nusa,
      cureState: s.cure
    };
    // Persist save to localStorage for prototype scope
    localStorage.setItem('fpszombiebeken-save', JSON.stringify(newSaveData));
    return { saveData: newSaveData, lastSaveTime: Date.now() };
  }),
  loadGame: () => {
    const saved = localStorage.getItem('fpszombiebeken-save');
    if (saved) {
      const data = JSON.parse(saved);
      // Apply loaded state to store
      // This is a simplified example - ensure all required fields exist
      set({
        player: data.playerState,
        nusa: data.nusaState,
        cure: data.cureState,
        currentRoom: data.checkpointRoom,
        phase: 'playing',
        playerInitialized: true
      });
    }
  },
  getSaveData: () => get().saveData,
  updateSaveData: (data) => set({ saveData: data }),
  setDebugFlag: (k, v) => set((s) => ({
    debug: { ...s.debug, [k]: v }
  })),
  tick: () => { }
}));