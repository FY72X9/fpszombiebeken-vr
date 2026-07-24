export const PLAYER_CONFIG = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  staminaDrainSprint: 15,
  staminaRegen: 10,
  moveSpeed: {
    walk: 4.2,
    sprint: 7.5,
    crouch: 2.2
  },
  height: {
    stand: 1.6,
    crouch: 1.0
  },
  injectionTime: 2500, // 2.5 seconds
  stealth: {
    crouchNoiseMultiplier: 0.3,
    sprintNoiseMultiplier: 2.5
  }
};

export const DETECTION_CONFIG = {
  fovAngle: 120,
  CONE_FOV_HORIZONTAL: Math.PI / 3, // 60 deg cone half-angle
  ALERT_DISTANCE: 7.0,
  PERIPHERAL_DISTANCE: 3.5,
  ATTACK_DISTANCE: 1.5,
  ATTACK_COOLDOWN: 1.5,
  CHASE_DISTANCE: 12.0,
  SEARCH_DURATION: 4.0,
  sightDistance: {
    crouch: 4.0,
    walk: 7.0,
    sprint: 12.0
  },
  detectionTimeMs: 1500
};

export const NOISE_CONFIG = {
  FOOTSTEP_WALK: { radius: 3, intensity: 1 },
  FOOTSTEP_SPRINT: { radius: 8, intensity: 3 },
  DOOR_SLOW: { radius: 2, intensity: 1 },
  DOOR_FAST: { radius: 6, intensity: 3 },
  INJECTION: { radius: 4, intensity: 2 }
};

export const NUSA_CONFIG = {
  followDistance: 2.2,
  followSpeed: 3.8,
  interactionDialogs: {
    meet: 'Bina! Terima kasih sudah datang menyelamatkanku!',
    follow: 'Aku akan mengikutimu dari belakang, ayo keluar dari kampus!',
    rescued: 'Kita berhasil sampai di gerbang utama! Kampus BINUS Bekasi selamat!'
  }
};