import * as THREE from 'three';

export type WeatherType = 'sunny' | 'rainstorm' | 'dense_fog';
export type EnemyType = 'fighter' | 'bomber' | 'ace' | 'stuka' | 'torpedo' | 'boss';
export type GroundTargetType = 'factory' | 'flak' | 'fuel_depot' | 'radar';
export type PickupType = 'bomb' | 'repair' | 'medal';
export type WingmanType = 'none' | 'hurricane' | 'dauntless' | 'mustang';

export interface GameStats {
  acesDowned: number;
  groundTargetsBombed: number;
  bombsDropped: number;
  itemsCollected: number;
  maxCombo: number;
  shotsFired: number;
  shotsHit: number;
}

export interface PlayerUpgrades {
  cannonFireRate: number; // 1 to 10
  cannonDamage: number;   // 1 to 10
  armorMax: number;       // 1 to 10
  bombCapacity: number;   // 1 to 10
  bombReloadSpeed: number;// 1 to 10
}

export interface MissionWaypoint {
  x: number;
  y: number;
  label: string;
  type: 'airfield' | 'factory' | 'flak' | 'boss';
}

export interface EnemyIntel {
  name: string;
  type: string;
  threat: 'MODERATE' | 'HIGH' | 'CRITICAL';
  notes: string;
}

export interface MissionConfig {
  id: string;
  code: string;
  title: string;
  sector: string;
  briefing: string;
  weather: WeatherType;
  targetAirKills: number;
  targetGroundKills: number;
  hasBoss: boolean;
  bossName?: string;
  mapWaypoints: MissionWaypoint[];
  enemyIntel: EnemyIntel[];
  rewardGold: number;
  rewardMaterials: number;
}

export interface TacticalChallenge {
  id: string;
  type: 'no_bombs_kills' | 'bomb_structures' | 'no_damage_kills' | 'hunt_ace';
  title: string;
  description: string;
  duration: number; // total seconds
  timeLeft: number; // remaining seconds
  targetCount: number;
  currentCount: number;
  rewardGold: number;
  completed: boolean;
  failed: boolean;
}

export interface PlayerState {
  score: number;
  highScore: number;
  hp: number;
  maxHp: number;
  bombs: number;
  maxBombs: number;
  bombReloadProgress: number; // 0 to 1
  combo: number;
  comboMultiplier: number;
  active: boolean;
  isPaused: boolean;
  wave: number;
  currentWeather: WeatherType;
  mission: MissionConfig;
  missionAirKills: number;
  missionGroundKills: number;
  missionBossDefeated: boolean;
  missionComplete: boolean;
  selectedWingman: WingmanType;
  // Flight telemetry for ADI and Compass
  flightPitch: number; // degrees
  flightRoll: number;  // degrees
  flightHeading: number; // 0 to 360 degrees
  // Secondary Tactical Challenge
  tacticalChallenge: TacticalChallenge | null;
  stats: GameStats;
}

export interface DamageNumberItem {
  id: string;
  screenX: number;
  screenY: number;
  amount: number;
  isCrit: boolean;
  isBomb: boolean;
  isHeal: boolean;
  text?: string;
  createdAt: number;
}

export interface BulletEntity {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  isEnemy: boolean;
  damage: number;
  life: number;
  isWingman?: boolean;
}

export interface BombEntity {
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  targetY: number;
  shadowMesh?: THREE.Mesh;
}

export interface EnemyEntity {
  mesh: THREE.Group;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  fireCooldown: number;
  scoreValue: number;
  timeOffset: number;
  propeller?: THREE.Mesh;
  propellers?: THREE.Mesh[];
  diveState?: 'cruise' | 'diving' | 'pullup';
  diveTimer?: number;
  bossHealthBar?: boolean;
}

export interface GroundTargetEntity {
  mesh: THREE.Group;
  type: GroundTargetType;
  hp: number;
  maxHp: number;
  scoreValue: number;
  fireCooldown: number;
  turret?: THREE.Object3D;
  barrels?: THREE.Object3D[];
  smokingPipes?: THREE.Vector3[];
}

export interface PickupEntity {
  mesh: THREE.Group;
  type: PickupType;
  velocity: THREE.Vector3;
}

export interface ParticleEntity {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  decay: number;
  rotSpeed: THREE.Vector3;
}

export interface WeatherRainEntity {
  mesh: THREE.LineSegments;
  positions: Float32Array;
}

// Persistent Hangar Data
export interface FlightLogEntry {
  id: string;
  missionCode: string;
  score: number;
  won: boolean;
  airKills: number;
  groundKills: number;
  date: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardGold: number;
  completed: boolean;
  claimed: boolean;
  iconName: string;
}

export interface HangarProfile {
  gold: number;
  materials: number;
  lastLoginTimestamp: number;
  loginStreak: number;
  dailyClaimedDates: string[]; // YYYY-MM-DD
  upgrades: PlayerUpgrades;
  selectedWingman: WingmanType;
  unlockedWingmen: WingmanType[];
  flightLog: {
    missionsPlayed: number;
    missionsWon: number;
    totalAirKills: number;
    totalGroundKills: number;
    totalBombsDropped: number;
    totalBombsHit: number;
    recentMissions: FlightLogEntry[];
  };
  achievements: AchievementItem[];
  skins?: {
    [key in 'spitfire' | 'hurricane' | 'dauntless' | 'mustang']?: {
      currentSkinId: string;
      unlockedSkinIds: string[];
    };
  };
  hangarLighting?: {
    lightColor: string;
    rotationSpeed: number;
    specularIntensity: number;
  };
}
