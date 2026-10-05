import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  PlayerState,
  HangarProfile,
  MissionConfig,
  DamageNumberItem,
  FlightLogEntry,
  AchievementItem,
  WeatherType,
} from './game/types';
import { MISSIONS_LIST } from './game/missionsData';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { DamageNumbers } from './components/DamageNumbers';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { HangarView } from './hangar/HangarView';
import { GameOverOverlay } from './components/GameOverOverlay';
import { PauseModal } from './components/PauseModal';
import { sound } from './audio/soundEngine';

const HIGH_SCORE_KEY = 'airattack_1944_highscore';
const CONTROL_MODE_KEY = 'airattack_1944_control_mode';
const PROFILE_KEY = 'airattack_1944_hangar_profile';

const initialAchievements: AchievementItem[] = [
  {
    id: 'ach_ground_100',
    title: '地面清道夫 (Ground Sweeper)',
    description: '累積摧毀 100 座重型地面設施與防空地堡',
    progress: 0,
    target: 100,
    rewardGold: 800,
    completed: false,
    claimed: false,
    iconName: 'bomb',
  },
  {
    id: 'ach_score_50k',
    title: '傳奇飛行員 (Ace of Legend)',
    description: '在單次出擊巡航中作戰得分突破 50,000 分',
    progress: 0,
    target: 50000,
    rewardGold: 1200,
    completed: false,
    claimed: false,
    iconName: 'award',
  },
  {
    id: 'ach_bomb_acc',
    title: '精準彈著點 (Precision Bombardier)',
    description: '累積精準投擲炸彈命中目標達 30 次',
    progress: 0,
    target: 30,
    rewardGold: 600,
    completed: false,
    claimed: false,
    iconName: 'crosshair',
  },
  {
    id: 'ach_air_50',
    title: '空域霸權 (Sky Superiority)',
    description: '空中機砲對決累積擊落 50 架敵機編隊',
    progress: 0,
    target: 50,
    rewardGold: 900,
    completed: false,
    claimed: false,
    iconName: 'plane',
  },
  {
    id: 'ach_streak_3',
    title: '堅守陣地 (Loyal Veteran)',
    description: '連續 3 天回訪基地機庫簽到領取戰備補給',
    progress: 0,
    target: 3,
    rewardGold: 500,
    completed: false,
    claimed: false,
    iconName: 'calendar',
  },
];

const defaultProfile: HangarProfile = {
  gold: 1500,
  materials: 6,
  lastLoginTimestamp: 0,
  loginStreak: 0,
  dailyClaimedDates: [],
  upgrades: {
    cannonFireRate: 1,
    cannonDamage: 1,
    armorMax: 1,
    bombCapacity: 1,
    bombReloadSpeed: 1,
  },
  selectedWingman: 'none',
  unlockedWingmen: ['hurricane'],
  flightLog: {
    missionsPlayed: 0,
    missionsWon: 0,
    totalAirKills: 0,
    totalGroundKills: 0,
    totalBombsDropped: 0,
    totalBombsHit: 0,
    recentMissions: [],
  },
  achievements: initialAchievements,
};

const initialStats = {
  acesDowned: 0,
  groundTargetsBombed: 0,
  bombsDropped: 0,
  itemsCollected: 0,
  maxCombo: 0,
  shotsFired: 0,
  shotsHit: 0,
};

export default function App() {
  const [profile, setProfile] = useState<HangarProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultProfile,
          ...parsed,
          upgrades: { ...defaultProfile.upgrades, ...parsed.upgrades },
          flightLog: { ...defaultProfile.flightLog, ...parsed.flightLog },
          achievements: defaultProfile.achievements.map(defaultAch => {
            const found = parsed.achievements?.find((a: AchievementItem) => a.id === defaultAch.id);
            return found ? { ...defaultAch, ...found } : defaultAch;
          }),
        };
      }
    } catch {
      // fallback
    }
    return defaultProfile;
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [controlMode, setControlMode] = useState<'mouse' | 'keyboard'>(() => {
    const saved = localStorage.getItem(CONTROL_MODE_KEY);
    return saved === 'keyboard' ? 'keyboard' : 'mouse';
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [currentView, setCurrentView] = useState<'hangar' | 'briefing' | 'battle' | 'debrief'>('hangar');
  const [selectedMission, setSelectedMission] = useState<MissionConfig>(MISSIONS_LIST[0]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [isMissionSuccess, setIsMissionSuccess] = useState<boolean>(false);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberItem[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [radioComms, setRadioComms] = useState<string | null>(null);

  // Weather change and Comms handlers
  const handleWeatherChange = useCallback((_weather: WeatherType, notification: string) => {
    setWeatherAlert(notification);
    setTimeout(() => setWeatherAlert(null), 4500);
  }, []);

  const handleComms = useCallback((msg: string) => {
    setRadioComms(msg);
    setTimeout(() => setRadioComms(null), 4000);
  }, []);

  // Calculate Base Max HP and Bombs from Upgrades
  const maxHpFromUpgrades = 100 + (profile.upgrades.armorMax - 1) * 15;
  const maxBombsFromUpgrades = 3 + (profile.upgrades.bombCapacity - 1);

  const [playerState, setPlayerState] = useState<PlayerState>({
    score: 0,
    highScore: highScore,
    hp: maxHpFromUpgrades,
    maxHp: maxHpFromUpgrades,
    bombs: maxBombsFromUpgrades,
    maxBombs: maxBombsFromUpgrades,
    bombReloadProgress: 0,
    combo: 0,
    comboMultiplier: 1,
    active: false,
    isPaused: false,
    wave: 1,
    currentWeather: selectedMission.weather,
    mission: selectedMission,
    missionAirKills: 0,
    missionGroundKills: 0,
    missionBossDefeated: false,
    missionComplete: false,
    selectedWingman: profile.selectedWingman,
    flightPitch: 0,
    flightRoll: 0,
    flightHeading: 0,
    tacticalChallenge: null,
    stats: { ...initialStats },
  });

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Keep sound volume synced
  useEffect(() => {
    sound.setVolume(volume);
  }, [volume]);

  // Handle Control Mode Switch
  const handleControlModeChange = (mode: 'mouse' | 'keyboard') => {
    setControlMode(mode);
    localStorage.setItem(CONTROL_MODE_KEY, mode);
  };

  // Sound toggle
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  }, []);

  // Damage Numbers Handler
  const handleDamageEvent = useCallback((item: DamageNumberItem) => {
    setDamageNumbers(prev => [...prev.slice(-35), item]);
  }, []);

  // Cleanup old damage numbers periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setDamageNumbers(prev => prev.filter(item => now - item.createdAt < 1200));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Start Battle from Briefing Modal
  const handleLaunchBattle = useCallback(() => {
    const calcHp = 100 + (profile.upgrades.armorMax - 1) * 15;
    const calcBombs = 3 + (profile.upgrades.bombCapacity - 1);

    setDamageNumbers([]);
    setIsNewHighScore(false);
    setIsMissionSuccess(false);

    setPlayerState({
      score: 0,
      highScore: highScore,
      hp: calcHp,
      maxHp: calcHp,
      bombs: calcBombs,
      maxBombs: calcBombs,
      bombReloadProgress: 0,
      combo: 0,
      comboMultiplier: 1,
      active: true,
      isPaused: false,
      wave: 1,
      currentWeather: selectedMission.weather,
      mission: selectedMission,
      missionAirKills: 0,
      missionGroundKills: 0,
      missionBossDefeated: false,
      missionComplete: false,
      selectedWingman: profile.selectedWingman,
      flightPitch: 0,
      flightRoll: 0,
      flightHeading: 0,
      tacticalChallenge: null,
      stats: { ...initialStats },
    });

    setGameKey(k => k + 1);
    setCurrentView('battle');
  }, [profile, selectedMission, highScore]);

  // Handle Tactical Challenge Gold Reward
  const handleChallengeReward = useCallback((rewardGold: number, _title: string) => {
    sound.pickup();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#fbbf24'],
    });
    setRadioComms(`🏆 戰術挑戰達成！獲得 +${rewardGold} 黃金軍餉！`);
    setProfile(prev => ({
      ...prev,
      gold: prev.gold + rewardGold,
    }));
  }, []);

  // Update Flight Log & Achievements
  const recordMissionResult = useCallback(
    (won: boolean, score: number, airKills: number, groundKills: number, bombsDropped: number) => {
      setProfile(prev => {
        const newTotalAir = prev.flightLog.totalAirKills + airKills;
        const newTotalGround = prev.flightLog.totalGroundKills + groundKills;
        const newTotalBombs = prev.flightLog.totalBombsDropped + bombsDropped;
        const newBombsHit = prev.flightLog.totalBombsHit + groundKills;

        const newEntry: FlightLogEntry = {
          id: `log_${Date.now()}`,
          missionCode: selectedMission.code,
          score,
          won,
          airKills,
          groundKills,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedAchievements = prev.achievements.map(ach => {
          let progress = ach.progress;
          if (ach.id === 'ach_ground_100') {
            progress = newTotalGround;
          } else if (ach.id === 'ach_score_50k') {
            progress = Math.max(progress, score);
          } else if (ach.id === 'ach_bomb_acc') {
            progress = newBombsHit;
          } else if (ach.id === 'ach_air_50') {
            progress = newTotalAir;
          } else if (ach.id === 'ach_streak_3') {
            progress = prev.loginStreak || 1;
          }

          const completed = progress >= ach.target;
          return { ...ach, progress, completed };
        });

        // Award bonus gold for victory
        const goldReward = won ? selectedMission.rewardGold : Math.floor(score * 0.05);
        const matReward = won ? selectedMission.rewardMaterials : 0;

        return {
          ...prev,
          gold: prev.gold + goldReward,
          materials: prev.materials + matReward,
          flightLog: {
            ...prev.flightLog,
            missionsPlayed: prev.flightLog.missionsPlayed + 1,
            missionsWon: prev.flightLog.missionsWon + (won ? 1 : 0),
            totalAirKills: newTotalAir,
            totalGroundKills: newTotalGround,
            totalBombsDropped: newTotalBombs,
            totalBombsHit: newBombsHit,
            recentMissions: [newEntry, ...prev.flightLog.recentMissions].slice(0, 10),
          },
          achievements: updatedAchievements,
        };
      });
    },
    [selectedMission]
  );

  // Mission Complete / Victory Trigger
  const handleMissionComplete = useCallback(() => {
    sound.pickup();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#d4a754', '#f59e0b', '#10b981', '#38bdf8'],
    });

    setIsMissionSuccess(true);
    setPlayerState(prev => {
      recordMissionResult(
        true,
        prev.score,
        prev.missionAirKills,
        prev.missionGroundKills,
        prev.stats.bombsDropped
      );
      return { ...prev, active: false };
    });
    setCurrentView('debrief');
  }, [recordMissionResult]);

  // Game Over handler (Plane Destroyed)
  const handleGameOver = useCallback(() => {
    setPlayerState(prev => {
      const finalScore = prev.score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        setIsNewHighScore(true);
        localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
      } else {
        setIsNewHighScore(false);
      }

      recordMissionResult(
        false,
        finalScore,
        prev.missionAirKills,
        prev.missionGroundKills,
        prev.stats.bombsDropped
      );
      return { ...prev, active: false, isPaused: false };
    });
    setIsMissionSuccess(false);
    setCurrentView('debrief');
  }, [highScore, recordMissionResult]);

  // Pause / Resume
  const handlePause = useCallback(() => {
    setPlayerState(prev => {
      if (!prev.active) return prev;
      return { ...prev, isPaused: true };
    });
  }, []);

  const handleResume = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Global key bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (currentView === 'battle') {
          setPlayerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        }
      }
      if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleToggleMute]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0e12] select-none font-sans">
      {/* Cinematic Cockpit Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]"
        aria-hidden="true"
      />

      {/* 3D WebGL Game Canvas (Always active in background, controlled by currentView) */}
      <GameCanvas
        key={gameKey}
        playerState={playerState}
        onUpdateState={setPlayerState}
        onGameOver={handleGameOver}
        onMissionComplete={handleMissionComplete}
        controlMode={controlMode}
        upgrades={profile.upgrades}
        playerSkinId={profile.skins?.spitfire?.currentSkinId}
        wingmanSkinId={
          profile.selectedWingman !== 'none'
            ? profile.skins?.[profile.selectedWingman]?.currentSkinId
            : undefined
        }
        onDamageEvent={handleDamageEvent}
        onWeatherChange={handleWeatherChange}
        onComms={handleComms}
        onChallengeReward={handleChallengeReward}
      />

      {/* Visual Floating Damage Numbers */}
      {currentView === 'battle' && <DamageNumbers items={damageNumbers} />}

      {/* HUD (Active during combat) */}
      {currentView === 'battle' && (
        <HUD
          playerState={playerState}
          onPause={handlePause}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
          controlMode={controlMode}
          onToggleControlMode={() =>
            handleControlModeChange(controlMode === 'mouse' ? 'keyboard' : 'mouse')
          }
          weatherAlert={weatherAlert}
          radioComms={radioComms}
          onReturnToHangar={() => {
            sound.stopEngine();
            setPlayerState(p => ({ ...p, active: false, isPaused: false }));
            setCurrentView('hangar');
          }}
        />
      )}

      {/* 1. Hangar View (Tech R&D, Wingman, Daily bonus, Flight log, Medals) */}
      {currentView === 'hangar' && (
        <HangarView
          profile={profile}
          onUpdateProfile={setProfile}
          onStartMissionSelect={() => setCurrentView('briefing')}
        />
      )}

      {/* 2. Mission Briefing Modal (Tactical Map, Objectives & Enemy Intel) */}
      {currentView === 'briefing' && (
        <MissionBriefingModal
          mission={selectedMission}
          missionsList={MISSIONS_LIST}
          onSelectMission={setSelectedMission}
          onLaunchBattle={handleLaunchBattle}
          onOpenHangar={() => setCurrentView('hangar')}
          selectedWingman={profile.selectedWingman}
          upgrades={profile.upgrades}
          onClose={() => setCurrentView('hangar')}
        />
      )}

      {/* 3. Mission Debriefing / Game Over Modal */}
      {currentView === 'debrief' && (
        <GameOverOverlay
          playerState={playerState}
          onRestart={handleLaunchBattle}
          onHome={() => setCurrentView('hangar')}
          isNewHighScore={isNewHighScore}
          isVictory={isMissionSuccess}
        />
      )}

      {/* 4. Tactical Pause Modal */}
      {playerState.isPaused && currentView === 'battle' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleLaunchBattle}
          volume={volume}
          onChangeVolume={setVolume}
          controlMode={controlMode}
          onChangeControlMode={handleControlModeChange}
        />
      )}
    </div>
  );
}
