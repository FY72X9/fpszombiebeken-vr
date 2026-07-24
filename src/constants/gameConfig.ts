export const DETECTION_CONFIG = {
  CONE_FOV_HORIZONTAL: 120,
  CONE_FOV_VERTICAL: 80,
  ALERT_DISTANCE: 15,
  CHASE_DISTANCE: 8,
  ATTACK_DISTANCE: 3,
  PERIPHERAL_DISTANCE: 4,
  PERIPHERAL_ANGLE: 180,
  
  SEARCH_DURATION: 10,
  RETURN_DURATION: 15,
  ATTACK_COOLDOWN: 1.5,
  
  LOS_CHECKS_PER_SECOND: 10,
  MAX_DISTANCE_CHECK: 20,
  
  NOISE_HEARING_MULTIPLIER: {
    IDLE: 1.0,
    WANDER: 1.0,
    ALERT: 1.5,
    CHASE: 1.2,
    SEARCH: 2.0
  }
} as const;

export const NOISE_CONFIG = {
  WALK: { radius: 0, intensity: 0, type: 'footstep' as const },
  SPRINT: { radius: 8, intensity: 3, type: 'footstep' as const },
  DOOR_SLOW: { radius: 3, intensity: 1, type: 'door' as const },
  DOOR_SLAM: { radius: 10, intensity: 4, type: 'door' as const },
  GUNSHOT: { radius: 25, intensity: 5, type: 'gunshot' as const },
  THROW: { radius: 5, intensity: 2, type: 'throw' as const },
  COLLISION: { radius: 5, intensity: 2, type: 'collision' as const },
  RELOAD: { radius: 4, intensity: 1, type: 'collision' as const },
  INJECTION: { radius: 2, intensity: 1, type: 'collision' as const }
} as const;

export const ZOMBIE_ARCHETYPES = {
  STUDENT: {
    speed: { idle: 0.8, wander: 1.0, alert: 1.8, chase: 2.8, attack: 4.0 },
    health: 80,
    damage: 15,
    detectionMultiplier: 1.0,
    animations: ['idle', 'walk', 'run', 'attack', 'hit', 'death', 'stunned']
  },
  LECTURER: {
    speed: { idle: 0.6, wander: 0.9, alert: 1.5, chase: 2.2, attack: 3.5 },
    health: 150,
    damage: 25,
    detectionMultiplier: 1.2,
    animations: ['idle', 'walk', 'run', 'attack', 'hit', 'death', 'stunned', 'lecture']
  },
  BOSS_WILLY: {
    speed: { idle: 0.5, wander: 0.8, alert: 1.2, chase: 2.0, attack: 3.0 },
    health: 300,
    damage: 35,
    detectionMultiplier: 1.5,
    animations: ['idle', 'walk', 'run', 'attack', 'heavy_attack', 'hit', 'death', 'stunned', 'roar']
  }
} as const;

export const PLAYER_CONFIG = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  staminaRegen: 8,
  staminaDrainSprint: 15,
  staminaDrainAim: 5,
  
  moveSpeed: {
    walk: 2.5,
    sprint: 4.5,
    crouch: 1.2,
    aim: 1.5
  },
  
  height: {
    stand: 1.6,
    crouch: 1.1
  },
  
  headbob: {
    walk: { frequency: 8, amplitude: 0.02 },
    sprint: { frequency: 12, amplitude: 0.04 },
    crouch: { frequency: 6, amplitude: 0.015 }
  },
  
  interactionRange: 3,
  injectionTime: 2500,
  injectionCooldown: 1000,
  
  startingItems: [
    { type: 'antidote', count: 3 },
    { type: 'bandage', count: 2 },
    { type: 'flashlight', count: 1 }
  ]
} as const;

export const WEAPON_CONFIG = {
  handgun: {
    damage: 40,
    range: 20,
    fireRate: 450,
    reloadTime: 1800,
    maxAmmo: 12,
    startingAmmo: 12,
    spread: 0.02,
    recoil: 0.15,
    staggerChance: 0.7,
    stunDuration: 3000
  }
} as const;

export const ITEM_CONFIG = {
  antidote: {
    maxStack: 6,
    healAmount: 0,
    useTime: 2500,
    cooldown: 0,
    description: 'Antidot untuk menyembuhkan zombie'
  },
  bandage: {
    maxStack: 4,
    healAmount: 40,
    useTime: 1500,
    cooldown: 0,
    description: 'Penutup luka segera'
  },
  flashlight: {
    maxStack: 1,
    healAmount: 0,
    useTime: 0,
    cooldown: 0,
    batteryDrain: 0.5,
    description: 'Senter taktikal'
  },
  lure: {
    maxStack: 4,
    healAmount: 0,
    useTime: 500,
    cooldown: 2000,
    noiseRadius: 5,
    noiseIntensity: 2,
    description: 'Botol kosong untuk mengalihkan perhatian'
  },
  ammo_clip: {
    maxStack: 24,
    healAmount: 0,
    useTime: 0,
    cooldown: 0,
    description: 'Klip peluru 9mm (12 peluru)'
  }
} as const;

export const NUSA_CONFIG = {
  health: 100,
  maxHealth: 100,
  followDistance: 2.5,
  followSpeed: 2.0,
  panicDistance: 1.5,
  interactionDialogs: {
    meet: 'Bina! Kamu selamat... Aku bersembunyi di sini sejak tadi.',
    follow: 'Aku ikut kamu, jangan tinggalkan aku!',
    rescued: 'Terima kasih Bina... Kita selamat.',
    injured: 'Aku tidak bisa... terlalu sakit...',
    death: 'Maaf Bina... aku...'
  }
} as const;

export const GAME_CONFIG = {
  grandWinCondition: {
    requiredCures: ['willyCured', 'indiCured', 'gatotCured'],
    requiredNusaRescue: true,
    requiredExitRoom: 'lobby_l1'
  },
  
  rescueWinCondition: {
    requiredNusaRescue: true,
    requiredExitRoom: 'lobby_l1'
  },
  
  checkpointRooms: ['kelas_2a', 'kelas_2b', 'kelas_2c', 'koridor_l2', 'lobby_l1'],
  autosaveInterval: 120000,
  
  difficultySettings: {
    easy: {
      zombieHealthMult: 0.7,
      zombieDamageMult: 0.7,
      detectionMult: 0.8,
      itemSpawnMult: 1.5,
      staminaRegenMult: 1.5
    },
    normal: {
      zombieHealthMult: 1.0,
      zombieDamageMult: 1.0,
      detectionMult: 1.0,
      itemSpawnMult: 1.0,
      staminaRegenMult: 1.0
    },
    hard: {
      zombieHealthMult: 1.3,
      zombieDamageMult: 1.3,
      detectionMult: 1.2,
      itemSpawnMult: 0.7,
      staminaRegenMult: 0.7
    }
  }
} as const;