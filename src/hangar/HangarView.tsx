import React, { useState } from 'react';
import {
  Wrench,
  BookOpen,
  Award,
  Calendar,
  Plane,
  Coins,
  Shield,
  Zap,
  Bomb,
  ChevronRight,
  CheckCircle,
  Crosshair,
  BarChart3,
  TrendingUp,
  Sparkles,
  Eye,
  Rotate3d,
  Sliders,
  Sun,
  Palette,
  Check,
  Lock,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  HangarProfile,
  PlayerUpgrades,
  WingmanType,
  AchievementItem,
  FlightLogEntry,
} from '../game/types';
import { sound } from '../audio/soundEngine';
import { HangarTurntableCanvas, HangarLightingConfig } from './HangarTurntableCanvas';
import {
  AIRCRAFT_SKINS,
  AircraftSkin,
  PlaneModelKey,
  getSkinById,
} from '../game/aircraftSkins';

interface HangarViewProps {
  profile: HangarProfile;
  onUpdateProfile: (updater: (prev: HangarProfile) => HangarProfile) => void;
  onStartMissionSelect: () => void;
}

export const HangarView: React.FC<HangarViewProps> = ({
  profile,
  onUpdateProfile,
  onStartMissionSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'rd' | 'wingman' | 'log' | 'medals' | 'daily'>('showcase');
  const [inspectedModel, setInspectedModel] = useState<'player' | WingmanType>('player');
  const [dailyClaimSuccess, setDailyClaimSuccess] = useState<boolean>(false);
  const [showLightingPanel, setShowLightingPanel] = useState<boolean>(false);
  const [showcaseSubTab, setShowcaseSubTab] = useState<'specs' | 'skins'>('specs');
  const [skinActionFeedback, setSkinActionFeedback] = useState<string | null>(null);

  // Lighting Configuration and Handlers
  const defaultLighting: HangarLightingConfig = {
    lightColor: '#fffaed',
    rotationSpeed: 1.0,
    specularIntensity: 1.0,
  };
  const lighting = profile.hangarLighting || defaultLighting;

  const handleUpdateLighting = (patch: Partial<HangarLightingConfig>) => {
    onUpdateProfile(prev => ({
      ...prev,
      hangarLighting: {
        ...(prev.hangarLighting || defaultLighting),
        ...patch,
      },
    }));
  };

  // Aircraft Skin Selection & Unlocking Handlers
  const currentModelKey: PlaneModelKey =
    inspectedModel === 'player' || inspectedModel === 'none'
      ? 'spitfire'
      : (inspectedModel as PlaneModelKey);

  const availableSkins = AIRCRAFT_SKINS[currentModelKey] || AIRCRAFT_SKINS.spitfire;
  const currentSkinId =
    profile.skins?.[currentModelKey]?.currentSkinId || availableSkins[0].id;
  const unlockedSkinIds =
    profile.skins?.[currentModelKey]?.unlockedSkinIds || [availableSkins[0].id];

  const handleUnlockSkin = (skin: AircraftSkin) => {
    if (profile.materials < skin.materialCost) {
      setSkinActionFeedback(`缺少合金！需要 ${skin.materialCost} 單位合金。`);
      setTimeout(() => setSkinActionFeedback(null), 3500);
      return;
    }
    sound.pickup();
    onUpdateProfile(prev => {
      const existing = prev.skins?.[currentModelKey] || {
        currentSkinId: availableSkins[0].id,
        unlockedSkinIds: [availableSkins[0].id],
      };
      return {
        ...prev,
        materials: prev.materials - skin.materialCost,
        skins: {
          ...prev.skins,
          [currentModelKey]: {
            currentSkinId: skin.id,
            unlockedSkinIds: Array.from(new Set([...existing.unlockedSkinIds, skin.id])),
          },
        },
      };
    });
    setSkinActionFeedback(`已消耗 ${skin.materialCost} 合金解鎖並套用【${skin.name}】！`);
    setTimeout(() => setSkinActionFeedback(null), 4000);
  };

  const handleApplySkin = (skinId: string) => {
    sound.pickup();
    onUpdateProfile(prev => {
      const existing = prev.skins?.[currentModelKey] || {
        currentSkinId: availableSkins[0].id,
        unlockedSkinIds: [availableSkins[0].id],
      };
      return {
        ...prev,
        skins: {
          ...prev.skins,
          [currentModelKey]: {
            ...existing,
            currentSkinId: skinId,
          },
        },
      };
    });
    const s = availableSkins.find(item => item.id === skinId);
    setSkinActionFeedback(`已切換為【${s?.name || '指定塗裝'}】！`);
    setTimeout(() => setSkinActionFeedback(null), 3000);
  };

  // Check 24h Daily Login Status
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const timeSinceLastLogin = now - profile.lastLoginTimestamp;
  const canClaimDaily = timeSinceLastLogin >= ONE_DAY_MS || profile.lastLoginTimestamp === 0;

  const handleClaimDaily = () => {
    if (!canClaimDaily) return;
    sound.pickup();
    const streakDay = ((profile.loginStreak || 0) % 7) + 1;
    const goldBonus = 400 + streakDay * 150;
    const matBonus = streakDay >= 4 ? 3 : 1;

    onUpdateProfile(prev => ({
      ...prev,
      gold: prev.gold + goldBonus,
      materials: prev.materials + matBonus,
      lastLoginTimestamp: Date.now(),
      loginStreak: (prev.loginStreak || 0) + 1,
    }));
    setDailyClaimSuccess(true);
    setTimeout(() => setDailyClaimSuccess(false), 4000);
  };

  // Upgrade Calculations
  const getUpgradeCost = (currentLvl: number) => Math.floor(250 * Math.pow(1.45, currentLvl - 1));

  const handleUpgrade = (statKey: keyof PlayerUpgrades) => {
    const currentLvl = profile.upgrades[statKey];
    if (currentLvl >= 10) return;
    const cost = getUpgradeCost(currentLvl);
    if (profile.gold < cost) return;

    sound.pickup();
    onUpdateProfile(prev => ({
      ...prev,
      gold: prev.gold - cost,
      upgrades: {
        ...prev.upgrades,
        [statKey]: prev.upgrades[statKey] + 1,
      },
    }));
  };

  // Wingman Specs
  const wingmanList: {
    type: WingmanType;
    name: string;
    role: string;
    description: string;
    cost: number;
    specs: { speed: string; armor: string; firepower: string };
  }[] = [
    {
      type: 'hurricane',
      name: '颶風號 (Hawker Hurricane Mk.II)',
      role: '空中機砲速射支援',
      description: '皇家空軍主力戰機，緊貼左翼以雙聯機砲持續壓制空中敵機。耐損性高，火力綿密。',
      cost: 0,
      specs: { speed: '340 MPH', armor: '中裝甲 杜拉鋁', firepower: '雙聯 20mm 機砲' },
    },
    {
      type: 'dauntless',
      name: '無畏號 (SBD-5 Dauntless)',
      role: '戰術俯衝對地火箭',
      description: '美軍太平洋功勳俯衝轟炸機，定期向地面兵工廠與防空陣地投擲重型穿甲火箭彈。',
      cost: 1500,
      specs: { speed: '255 MPH', armor: '重型防彈鋼板', firepower: '高爆對地穿甲火箭' },
    },
    {
      type: 'mustang',
      name: '野馬號 (P-51D Mustang)',
      role: '全空域防空護衛攔截',
      description: '配備流線拋光鋁翼與塔斯基吉赤色垂尾，能精準擊落飛向玩家的高危敵方防空砲彈。',
      cost: 3200,
      specs: { speed: '437 MPH', armor: '高強度輕量化', firepower: '點防空精準攔截' },
    },
  ];

  const handleSelectWingman = (wType: WingmanType) => {
    sound.pickup();
    setInspectedModel(wType);
    onUpdateProfile(prev => ({
      ...prev,
      selectedWingman: prev.selectedWingman === wType ? 'none' : wType,
    }));
  };

  const handleUnlockWingman = (wType: WingmanType, cost: number) => {
    if (profile.gold < cost) return;
    sound.pickup();
    setInspectedModel(wType);
    onUpdateProfile(prev => ({
      ...prev,
      gold: prev.gold - cost,
      unlockedWingmen: [...prev.unlockedWingmen, wType],
      selectedWingman: wType,
    }));
  };

  // Claim Achievement Reward
  const handleClaimAchievement = (achId: string, rewardGold: number) => {
    sound.pickup();
    onUpdateProfile(prev => ({
      ...prev,
      gold: prev.gold + rewardGold,
      achievements: prev.achievements.map(a =>
        a.id === achId ? { ...a, claimed: true } : a
      ),
    }));
  };

  // Flight Log Stats
  const winRate =
    profile.flightLog.missionsPlayed > 0
      ? Math.round((profile.flightLog.missionsWon / profile.flightLog.missionsPlayed) * 100)
      : 0;

  const bombAccuracy =
    profile.flightLog.totalBombsDropped > 0
      ? Math.min(
          100,
          Math.round((profile.flightLog.totalBombsHit / profile.flightLog.totalBombsDropped) * 100)
        )
      : 85;

  // Selected aircraft info for the 3D showcase
  const getInspectedSpecs = () => {
    if (inspectedModel === 'player') {
      return {
        name: '超級馬林 噴火式 Mk.IX (Supermarine Spitfire)',
        typeStr: '全天候主力制空戰鬥機 (Main Interceptor)',
        desc: '搭載勞斯萊斯梅林 61 發動機與雙聯 20mm 西斯帕諾機砲，具備出色的高空滾轉率與靈活性。機腹掛載 500lb 重磅航空炸彈。',
        speed: '408 MPH (656 km/h)',
        armor: `裝甲等級 LV.${profile.upgrades.armorMax}`,
        firepower: `雙聯 Hispano 20mm 機砲 (LV.${profile.upgrades.cannonDamage}) + 500lb 重爆`,
        isUnlocked: true,
      };
    }
    const found = wingmanList.find(w => w.type === inspectedModel);
    if (!found) return null;
    return {
      name: found.name,
      typeStr: found.role,
      desc: found.description,
      speed: found.specs.speed,
      armor: found.specs.armor,
      firepower: found.specs.firepower,
      isUnlocked: profile.unlockedWingmen.includes(found.type),
      cost: found.cost,
    };
  };

  const inspectedSpecs = getInspectedSpecs();

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#0a0f14] via-[#121921] to-[#080d12] flex flex-col font-sans select-none overflow-hidden">
      {/* Top Banner (Resources & Station Info) */}
      <div className="border-b border-[#8a7348]/40 bg-black/60 px-4 md:px-8 py-3 flex justify-between items-center backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400">
            <Plane size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#d4a754] tracking-[0.25em]">
              太平洋前線空軍基地 · BASE HANGAR
            </div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-wide">
              第 1944 特遣航空聯隊
            </h1>
          </div>
        </div>

        {/* Resources Badges & Launch Button */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-3 bg-black/50 border border-stone-800 px-3.5 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm">
              <Coins size={16} />
              <span>{profile.gold.toLocaleString()}</span>
              <span className="text-[10px] text-amber-200/70 font-sans">黃金</span>
            </div>
            <div className="w-px h-4 bg-stone-700" />
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-sm">
              <Wrench size={15} />
              <span>{profile.materials}</span>
              <span className="text-[10px] text-cyan-200/70 font-sans">合金</span>
            </div>
          </div>

          <button
            onClick={onStartMissionSelect}
            className="px-5 py-2.5 rounded bg-gradient-to-r from-[#d4a754] via-[#f5c363] to-[#b3852b] hover:from-[#e0b462] hover:to-[#c49434] text-stone-950 font-black text-sm uppercase tracking-wider shadow-[0_2px_15px_rgba(212,167,84,0.45)] hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2 border border-[#ffea9f]"
          >
            <span>出擊作戰 DEPLOY</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 px-4 md:px-8 py-2 bg-stone-950/80 border-b border-stone-800 overflow-x-auto scrollbar-none z-10">
        <button
          onClick={() => setActiveTab('showcase')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'showcase'
              ? 'bg-[#8a7348] text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Rotate3d size={14} className="text-amber-400" />
          <span>機體 3D 展台 (3D TURNTABLE)</span>
        </button>

        <button
          onClick={() => setActiveTab('rd')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rd'
              ? 'bg-[#8a7348] text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Wrench size={14} />
          <span>技術研發處 (UPGRADES)</span>
        </button>

        <button
          onClick={() => setActiveTab('wingman')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'wingman'
              ? 'bg-[#8a7348] text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Plane size={14} />
          <span>僚機編隊 (WINGMEN)</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'log'
              ? 'bg-[#8a7348] text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <BookOpen size={14} />
          <span>飛行日誌 (FLIGHT LOG)</span>
        </button>

        <button
          onClick={() => setActiveTab('medals')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'medals'
              ? 'bg-[#8a7348] text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Award size={14} />
          <span>榮譽勳章 (MEDALS)</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'daily'
              ? 'bg-[#8a7348] text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Calendar size={14} />
          <span>每日補給 (DAILY BONUS)</span>
          {canClaimDaily && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
          )}
        </button>
      </div>

      {/* Main Tab Views Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* 0. 3D TURNTABLE SHOWCASE TAB */}
        {activeTab === 'showcase' && (
          <div className="relative w-full h-full flex flex-col">
            {/* Model Switcher Buttons (Top-Left) */}
            <div className="absolute top-3 left-4 md:left-8 z-20 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setInspectedModel('player')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  inspectedModel === 'player'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-black/70 text-stone-300 border-stone-700 hover:bg-black/90'
                }`}
              >
                <Plane size={14} />
                <span>噴火式主力戰機 (Spitfire Mk.IX)</span>
              </button>

              {wingmanList.map(w => {
                const isUnlocked = profile.unlockedWingmen.includes(w.type);
                return (
                  <button
                    key={w.type}
                    onClick={() => setInspectedModel(w.type)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      inspectedModel === w.type
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : isUnlocked
                        ? 'bg-black/70 text-stone-300 border-stone-700 hover:bg-black/90'
                        : 'bg-black/40 text-stone-500 border-stone-800'
                    }`}
                  >
                    <span>{w.name}</span>
                    {!isUnlocked && (
                      <span className="text-[10px] text-stone-500">[{w.cost}G]</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Top-Right Toolbar (Lighting Setup & Drag Prompt) */}
            <div className="absolute top-3 right-4 md:right-8 z-20 flex items-center gap-2">
              <button
                onClick={() => setShowLightingPanel(prev => !prev)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border flex items-center gap-2 shadow-lg backdrop-blur-md ${
                  showLightingPanel
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-black/75 text-amber-300 border-amber-500/40 hover:bg-black/90 hover:border-amber-400'
                }`}
              >
                <Sun size={14} className={showLightingPanel ? 'text-stone-950' : 'text-amber-400 animate-spin-slow'} />
                <span>整備照明設定 (LIGHTING)</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 bg-black/60 border border-stone-800 px-3 py-1.5 rounded text-[11px] text-stone-400 backdrop-blur-sm">
                <Rotate3d size={14} className="text-amber-400" />
                <span>拖曳 360° 旋轉</span>
              </div>
            </div>

            {/* Floating 『整備照明設定』 Panel */}
            {showLightingPanel && (
              <div className="absolute top-14 right-4 md:right-8 z-30 w-80 md:w-88 bg-gradient-to-b from-[#131a22] to-[#0a0e14] border-2 border-[#8a7348] rounded-xl shadow-2xl p-4 text-stone-200 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        機庫整備照明設定
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono">
                        REALTIME THREE.JS LIGHTING
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLightingPanel(false)}
                    className="p-1 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* 1. Light Color Presets & Picker */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Palette size={13} className="text-amber-400" />
                        <span>環境光源色溫 (Color Temp)</span>
                      </span>
                      <span className="font-mono text-[10px] text-amber-300">{lighting.lightColor}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: '戰備暖黃', color: '#fffaed', bg: '#fffaed' },
                        { name: '高亮日光', color: '#f8fafc', bg: '#f8fafc' },
                        { name: '戰術冷藍', color: '#38bdf8', bg: '#38bdf8' },
                        { name: '夜襲暗紅', color: '#ef4444', bg: '#ef4444' },
                        { name: '雷達翠綠', color: '#10b981', bg: '#10b981' },
                        { name: '沙漠金輝', color: '#f59e0b', bg: '#f59e0b' },
                      ].map(preset => {
                        const isSelected = lighting.lightColor.toLowerCase() === preset.color.toLowerCase();
                        return (
                          <button
                            key={preset.name}
                            onClick={() => handleUpdateLighting({ lightColor: preset.color })}
                            className={`p-1.5 rounded flex items-center gap-1.5 border transition cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/20 text-white font-bold'
                                : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/40 shrink-0"
                              style={{ backgroundColor: preset.bg }}
                            />
                            <span className="text-[10px] truncate">{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Color Input */}
                    <div className="mt-2 flex items-center justify-between bg-stone-900/70 border border-stone-800 px-2.5 py-1.5 rounded">
                      <span className="text-[10px] text-stone-400">自訂光源色彩:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={lighting.lightColor}
                          onChange={e => handleUpdateLighting({ lightColor: e.target.value })}
                          className="w-7 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-[10px] text-amber-300 uppercase">{lighting.lightColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Turntable Rotation Speed */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Rotate3d size={13} className="text-amber-400" />
                        <span>轉盤旋轉速度 (Rotation Speed)</span>
                      </span>
                      <span className="font-mono text-amber-300 tabular-nums">
                        {lighting.rotationSpeed.toFixed(1)}x
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.0"
                      max="2.5"
                      step="0.1"
                      value={lighting.rotationSpeed}
                      onChange={e => handleUpdateLighting({ rotationSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                    />

                    <div className="flex items-center justify-between gap-1 mt-1.5">
                      {[
                        { label: '靜止 0x', speed: 0.0 },
                        { label: '標準 1.0x', speed: 1.0 },
                        { label: '巡弋 2.0x', speed: 2.0 },
                      ].map(b => (
                        <button
                          key={b.label}
                          onClick={() => handleUpdateLighting({ rotationSpeed: b.speed })}
                          className={`flex-1 py-1 rounded text-[10px] font-mono transition cursor-pointer border ${
                            Math.abs(lighting.rotationSpeed - b.speed) < 0.05
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Specular Reflection Intensity */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sliders size={13} className="text-amber-400" />
                        <span>金屬反光與高光強度 (Reflectivity)</span>
                      </span>
                      <span className="font-mono text-cyan-300 tabular-nums">
                        {lighting.specularIntensity.toFixed(1)}x
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="2.2"
                      step="0.1"
                      value={lighting.specularIntensity}
                      onChange={e => handleUpdateLighting({ specularIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
                    />

                    <div className="flex items-center justify-between gap-1 mt-1.5">
                      {[
                        { label: '消光 0.6x', spec: 0.6 },
                        { label: '標準 1.0x', spec: 1.0 },
                        { label: '高光 1.8x', spec: 1.8 },
                      ].map(b => (
                        <button
                          key={b.label}
                          onClick={() => handleUpdateLighting({ specularIntensity: b.spec })}
                          className={`flex-1 py-1 rounded text-[10px] font-mono transition cursor-pointer border ${
                            Math.abs(lighting.specularIntensity - b.spec) < 0.05
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="border-t border-stone-800 pt-2 flex justify-end">
                    <button
                      onClick={() => handleUpdateLighting({
                        lightColor: '#fffaed',
                        rotationSpeed: 1.0,
                        specularIntensity: 1.0,
                      })}
                      className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[10px] transition cursor-pointer flex items-center gap-1 border border-stone-800"
                    >
                      <RotateCcw size={11} />
                      <span>重設為標準整備光照</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Three.js Turntable Viewport */}
            <div className="w-full h-full flex-1">
              <HangarTurntableCanvas
                modelType={inspectedModel}
                skinId={currentSkinId}
                lightingConfig={lighting}
              />
            </div>

            {/* Bottom Multi-Function Aircraft Deck (Specs & Livery Selector) */}
            {inspectedSpecs && (
              <div className="absolute bottom-3 left-4 right-4 md:left-8 md:right-8 z-20 pointer-events-none">
                <div className="pointer-events-auto bg-gradient-to-t from-black/95 via-stone-900/95 to-stone-900/90 border-2 border-[#8a7348]/80 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-5xl mx-auto flex flex-col gap-3">
                  {/* Sub-Tabs: Specs vs Liveries */}
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowcaseSubTab('specs')}
                        className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          showcaseSubTab === 'specs'
                            ? 'bg-[#8a7348] text-white shadow'
                            : 'text-stone-400 hover:text-stone-200 bg-stone-900/60'
                        }`}
                      >
                        <Plane size={13} />
                        <span>戰機作戰規格 (SPECS)</span>
                      </button>

                      <button
                        onClick={() => setShowcaseSubTab('skins')}
                        className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          showcaseSubTab === 'skins'
                            ? 'bg-amber-500 text-stone-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                            : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30'
                        }`}
                      >
                        <Palette size={13} />
                        <span>戰機塗裝更換 (LIVERIES · 4款)</span>
                      </button>
                    </div>

                    {/* Material Balance indicator */}
                    <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-mono font-bold bg-black/50 border border-stone-800 px-2.5 py-1 rounded">
                      <Wrench size={13} />
                      <span>現有合金: {profile.materials}</span>
                    </div>
                  </div>

                  {/* Feedback Toast if any */}
                  {skinActionFeedback && (
                    <div className="bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 px-3 py-1 rounded text-xs flex items-center gap-2 animate-in fade-in">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>{skinActionFeedback}</span>
                    </div>
                  )}

                  {/* SUB-VIEW 1: SPECS TAB */}
                  {showcaseSubTab === 'specs' && (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#d4a754] uppercase tracking-[0.2em]">
                          <span>二戰經典戰鬥航空檔案</span>
                          <span>·</span>
                          <span className="text-amber-300 font-mono">{inspectedSpecs.typeStr}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-white mt-0.5">{inspectedSpecs.name}</h3>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed max-w-3xl">
                          {inspectedSpecs.desc}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono">
                          <div className="text-stone-400">
                            極速: <span className="text-amber-300 font-bold">{inspectedSpecs.speed}</span>
                          </div>
                          <div className="text-stone-400">
                            裝甲: <span className="text-emerald-400 font-bold">{inspectedSpecs.armor}</span>
                          </div>
                          <div className="text-stone-400">
                            武器: <span className="text-cyan-300 font-bold">{inspectedSpecs.firepower}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        {inspectedModel === 'player' ? (
                          <button
                            onClick={() => setActiveTab('rd')}
                            className="w-full md:w-auto px-4 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow"
                          >
                            <Wrench size={14} />
                            <span>前往升級戰機 UPGRADE</span>
                          </button>
                        ) : inspectedSpecs.isUnlocked ? (
                          <button
                            onClick={() => handleSelectWingman(inspectedModel as WingmanType)}
                            className={`w-full md:w-auto px-4 py-2.5 rounded font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
                              profile.selectedWingman === inspectedModel
                                ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                            }`}
                          >
                            <Plane size={14} />
                            <span>
                              {profile.selectedWingman === inspectedModel
                                ? '取消隨行 DISENGAGE'
                                : '指派此僚機出擊 ASSIGN'}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUnlockWingman(
                                inspectedModel as WingmanType,
                                (inspectedSpecs as { cost: number }).cost
                              )
                            }
                            disabled={profile.gold < (inspectedSpecs as { cost: number }).cost}
                            className="w-full md:w-auto px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Coins size={14} />
                            <span>解鎖機型 ({(inspectedSpecs as { cost: number }).cost} 黃金)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 2: LIVERIES SELECTION TAB */}
                  {showcaseSubTab === 'skins' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                      {availableSkins.map(skin => {
                        const isCurrent = skin.id === currentSkinId;
                        const isUnlocked = unlockedSkinIds.includes(skin.id);
                        const canAfford = profile.materials >= skin.materialCost;

                        const hexString = (num: number) => '#' + num.toString(16).padStart(6, '0');

                        return (
                          <div
                            key={skin.id}
                            className={`rounded-lg p-2.5 flex flex-col justify-between transition border ${
                              isCurrent
                                ? 'border-amber-400 bg-amber-950/25 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                                : isUnlocked
                                ? 'border-stone-700 bg-black/60 hover:border-stone-500'
                                : 'border-stone-800/80 bg-black/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {skin.era}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 flex items-center gap-0.5">
                                    <Check size={10} />
                                    <span>裝備中</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs font-bold text-white mt-0.5">{skin.name}</h4>
                              <p className="text-[10px] text-amber-200/70 font-mono">{skin.codename}</p>
                              <p className="text-[10px] text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                                {skin.description}
                              </p>

                              {/* Color swatch dots */}
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[9px] text-stone-500 font-mono">配色:</span>
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                                  style={{ backgroundColor: hexString(skin.colors.body) }}
                                  title="機身主色"
                                />
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                                  style={{ backgroundColor: hexString(skin.colors.camo) }}
                                  title="機翼迷彩"
                                />
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm"
                                  style={{ backgroundColor: hexString(skin.colors.accent) }}
                                  title="識別標飾"
                                />
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-2.5 border-t border-stone-800/80 pt-2">
                              {isCurrent ? (
                                <div className="text-center py-1 text-[11px] font-bold text-amber-400">
                                  當前裝備塗裝
                                </div>
                              ) : isUnlocked ? (
                                <button
                                  onClick={() => handleApplySkin(skin.id)}
                                  className="w-full py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Palette size={12} />
                                  <span>套用此塗裝 APPLY</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnlockSkin(skin)}
                                  disabled={!canAfford}
                                  className={`w-full py-1.5 rounded font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1 ${
                                    canAfford
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow'
                                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800'
                                  }`}
                                >
                                  <Lock size={12} />
                                  <span>
                                    {canAfford
                                      ? `解鎖塗裝 (${skin.materialCost} 合金)`
                                      : `合金不足 (需 ${skin.materialCost})`}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. 技術研發處 (Technology R&D) */}
        {activeTab === 'rd' && (
          <div className="max-w-5xl mx-auto space-y-4 p-4 md:p-6 overflow-y-auto w-full">
            <div className="bg-gradient-to-r from-amber-950/40 via-stone-900/40 to-transparent p-4 rounded-lg border border-[#8a7348]/40 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-amber-400">航空技術裝備研發所</h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  消耗作戰繳獲之黃金研發高性能航空零件，全面增幅噴火式戰機作戰實力。
                </p>
              </div>
              <div className="text-right font-mono text-xs text-stone-400">
                MAX LEVEL: 10
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cannon Fire Rate */}
              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span>機砲射速 (Fire Rate)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      LV. {profile.upgrades.cannonFireRate} / 10
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    改良 20mm 機砲彈鏈供彈結構，提升射擊密度與射速。
                  </p>
                  <div className="w-full h-2 bg-stone-800 rounded mt-3 overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded"
                      style={{ width: `${profile.upgrades.cannonFireRate * 10}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-800/80 pt-3">
                  <div className="text-xs font-mono text-stone-300">
                    {profile.upgrades.cannonFireRate >= 10 ? (
                      <span className="text-emerald-400 font-bold">已達最高等級 MAX</span>
                    ) : (
                      <span>費用: {getUpgradeCost(profile.upgrades.cannonFireRate)} 黃金</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUpgrade('cannonFireRate')}
                    disabled={
                      profile.upgrades.cannonFireRate >= 10 ||
                      profile.gold < getUpgradeCost(profile.upgrades.cannonFireRate)
                    }
                    className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold text-xs uppercase transition cursor-pointer"
                  >
                    升級 UPGRADE
                  </button>
                </div>
              </div>

              {/* Cannon Damage */}
              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Crosshair size={16} className="text-amber-400" />
                      <span>機砲破壞力 (Firepower)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      LV. {profile.upgrades.cannonDamage} / 10
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    換裝高爆穿甲燃燒榴彈，大幅度提升單發子彈傷害值。
                  </p>
                  <div className="w-full h-2 bg-stone-800 rounded mt-3 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded"
                      style={{ width: `${profile.upgrades.cannonDamage * 10}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-800/80 pt-3">
                  <div className="text-xs font-mono text-stone-300">
                    {profile.upgrades.cannonDamage >= 10 ? (
                      <span className="text-emerald-400 font-bold">已達最高等級 MAX</span>
                    ) : (
                      <span>費用: {getUpgradeCost(profile.upgrades.cannonDamage)} 黃金</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUpgrade('cannonDamage')}
                    disabled={
                      profile.upgrades.cannonDamage >= 10 ||
                      profile.gold < getUpgradeCost(profile.upgrades.cannonDamage)
                    }
                    className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold text-xs uppercase transition cursor-pointer"
                  >
                    升級 UPGRADE
                  </button>
                </div>
              </div>

              {/* Armor Max HP */}
              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Shield size={16} className="text-emerald-400" />
                      <span>裝甲厚度 (Hull Armor)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                      LV. {profile.upgrades.armorMax} / 10
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    在機腹與發動機關鍵部位鉚接杜拉鋁防彈裝甲板，強化最大血量。
                  </p>
                  <div className="w-full h-2 bg-stone-800 rounded mt-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded"
                      style={{ width: `${profile.upgrades.armorMax * 10}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-800/80 pt-3">
                  <div className="text-xs font-mono text-stone-300">
                    {profile.upgrades.armorMax >= 10 ? (
                      <span className="text-emerald-400 font-bold">已達最高等級 MAX</span>
                    ) : (
                      <span>費用: {getUpgradeCost(profile.upgrades.armorMax)} 黃金</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUpgrade('armorMax')}
                    disabled={
                      profile.upgrades.armorMax >= 10 ||
                      profile.gold < getUpgradeCost(profile.upgrades.armorMax)
                    }
                    className="px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold text-xs uppercase transition cursor-pointer"
                  >
                    升級 UPGRADE
                  </button>
                </div>
              </div>

              {/* Bomb Capacity */}
              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Bomb size={16} className="text-rose-400" />
                      <span>炸彈載彈量 (Bomb Capacity)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">
                      LV. {profile.upgrades.bombCapacity} / 10
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    擴充翼下掛架重磅航空炸彈攜帶上限，出擊時最多可連投多發！
                  </p>
                  <div className="w-full h-2 bg-stone-800 rounded mt-3 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded"
                      style={{ width: `${profile.upgrades.bombCapacity * 10}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-800/80 pt-3">
                  <div className="text-xs font-mono text-stone-300">
                    {profile.upgrades.bombCapacity >= 10 ? (
                      <span className="text-emerald-400 font-bold">已達最高等級 MAX</span>
                    ) : (
                      <span>費用: {getUpgradeCost(profile.upgrades.bombCapacity)} 黃金</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUpgrade('bombCapacity')}
                    disabled={
                      profile.upgrades.bombCapacity >= 10 ||
                      profile.gold < getUpgradeCost(profile.upgrades.bombCapacity)
                    }
                    className="px-3.5 py-1.5 rounded bg-rose-500 hover:bg-rose-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold text-xs uppercase transition cursor-pointer"
                  >
                    升級 UPGRADE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 僚機編隊 (Wingmen Squadron) */}
        {activeTab === 'wingman' && (
          <div className="max-w-5xl mx-auto space-y-4 p-4 md:p-6 overflow-y-auto w-full">
            <div className="bg-black/40 border border-stone-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-amber-400">僚機支援作戰系統</h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  選定一架僚機隨行出擊。僚機將在空戰中以編隊姿態緊隨主機，提供關鍵自動掩護火力！
                </p>
              </div>
              <button
                onClick={() => setActiveTab('showcase')}
                className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Eye size={14} className="text-amber-400" />
                <span>3D 展台檢視</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wingmanList.map(w => {
                const isUnlocked = profile.unlockedWingmen.includes(w.type);
                const isSelected = profile.selectedWingman === w.type;

                return (
                  <div
                    key={w.type}
                    className={`bg-black/60 border-2 rounded-xl p-4 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-amber-950/20'
                        : 'border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs uppercase font-bold text-[#d4a754] tracking-wider">
                          {w.role}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-stone-950 flex items-center gap-1">
                            <CheckCircle size={10} />
                            <span>出擊中</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white mt-1">{w.name}</h4>
                      <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                        {w.description}
                      </p>

                      <div className="mt-3 bg-stone-900/80 p-2 rounded text-[11px] font-mono space-y-0.5 text-stone-300 border border-stone-800">
                        <div>航速: <span className="text-amber-300">{w.specs.speed}</span></div>
                        <div>防護: <span className="text-emerald-400">{w.specs.armor}</span></div>
                        <div>武裝: <span className="text-cyan-300">{w.specs.firepower}</span></div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-stone-800 pt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setInspectedModel(w.type);
                          setActiveTab('showcase');
                        }}
                        className="px-2.5 py-2 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition cursor-pointer"
                        title="在 3D 展台檢視模型"
                      >
                        <Eye size={14} />
                      </button>

                      {isUnlocked ? (
                        <button
                          onClick={() => handleSelectWingman(w.type)}
                          className={`flex-1 py-2 rounded text-xs font-bold uppercase transition cursor-pointer ${
                            isSelected
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                          }`}
                        >
                          {isSelected ? '取消派遣 DISENGAGE' : '指派隨行 ASSIGN'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockWingman(w.type, w.cost)}
                          disabled={profile.gold < w.cost}
                          className="flex-1 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Coins size={14} />
                          <span>解鎖僚機 ({w.cost} G)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. 飛行日誌 (Flight Log Charts & Visualization) */}
        {activeTab === 'log' && (
          <div className="max-w-5xl mx-auto space-y-5 p-4 md:p-6 overflow-y-auto w-full">
            {/* Visual KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg">
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  作戰生存率 (WIN RATE)
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {winRate}%
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  勝場: {profile.flightLog.missionsWon} / 總出擊: {profile.flightLog.missionsPlayed}
                </div>
              </div>

              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg">
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  累積擊落敵機 (AIR KILLS)
                </div>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                  {profile.flightLog.totalAirKills}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">王牌空戰戰果總計</div>
              </div>

              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg">
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  炸毀地面工事 (GROUND TARGETS)
                </div>
                <div className="text-3xl font-black text-rose-400 font-mono mt-1">
                  {profile.flightLog.totalGroundKills}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">兵工廠與防空地堡摧毀</div>
              </div>

              <div className="bg-black/50 border border-stone-800 p-4 rounded-lg">
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  戰術投彈命中率 (BOMB ACCURACY)
                </div>
                <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
                  {bombAccuracy}%
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  總投彈: {profile.flightLog.totalBombsDropped} 枚
                </div>
              </div>
            </div>

            {/* Visual Breakdown Bars */}
            <div className="bg-black/50 border border-stone-800 p-5 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <BarChart3 size={16} />
                <span>戰場摧毀類別對比 (COMBAT BALANCE ANALYSIS)</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>空中目標 (Air Target Downed)</span>
                  <span className="font-mono text-amber-400">
                    {profile.flightLog.totalAirKills} 架
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded"
                    style={{
                      width: `${Math.min(
                        100,
                        (profile.flightLog.totalAirKills /
                          Math.max(
                            1,
                            profile.flightLog.totalAirKills + profile.flightLog.totalGroundKills
                          )) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>地面重裝設施 (Ground Target Bombed)</span>
                  <span className="font-mono text-rose-400">
                    {profile.flightLog.totalGroundKills} 座
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded"
                    style={{
                      width: `${Math.min(
                        100,
                        (profile.flightLog.totalGroundKills /
                          Math.max(
                            1,
                            profile.flightLog.totalAirKills + profile.flightLog.totalGroundKills
                          )) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Mission History Table */}
            <div className="bg-black/50 border border-stone-800 p-4 rounded-lg">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                <span>近期出擊航次紀錄 (RECENT MISSIONS)</span>
              </div>

              {profile.flightLog.recentMissions && profile.flightLog.recentMissions.length > 0 ? (
                <div className="space-y-2">
                  {profile.flightLog.recentMissions.map((m: FlightLogEntry) => (
                    <div
                      key={m.id}
                      className="bg-stone-900/60 p-2.5 rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.won ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-mono font-bold text-white">{m.missionCode}</span>
                        <span className="text-stone-400">{m.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-stone-300">
                          擊落: <strong className="text-amber-400">{m.airKills}</strong> | 轟炸:{' '}
                          <strong className="text-rose-400">{m.groundKills}</strong>
                        </span>
                        <span className="font-mono font-black text-amber-300">
                          {m.score.toLocaleString()} PTS
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-stone-500 py-6">
                  尚無近期任務紀錄，點擊右上角「出擊作戰」啟動第一次空戰巡航！
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. 榮譽勳章 (Achievements & Medals) */}
        {activeTab === 'medals' && (
          <div className="max-w-5xl mx-auto space-y-4 p-4 md:p-6 overflow-y-auto w-full">
            <div className="bg-black/40 border border-stone-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-amber-400">特遣軍功勳章館</h3>
              <p className="text-xs text-stone-300 mt-0.5">
                達成戰役里程碑獲得空軍榮譽勳章，並可兌換大量作戰黃金軍餉！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.achievements.map((ach: AchievementItem) => {
                const progressPct = Math.min(100, Math.round((ach.progress / ach.target) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`bg-black/50 border p-4 rounded-lg flex items-center justify-between gap-3 ${
                      ach.completed ? 'border-amber-500/70 bg-amber-950/10' : 'border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                          ach.completed
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                            : 'bg-stone-900 border-stone-700 text-stone-600'
                        }`}
                      >
                        <Award size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{ach.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-24 h-1.5 bg-stone-800 rounded overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">
                            {ach.progress} / {ach.target}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {ach.claimed ? (
                        <span className="text-[11px] font-bold text-stone-500 bg-stone-900 px-2.5 py-1 rounded">
                          已領取
                        </span>
                      ) : ach.completed ? (
                        <button
                          onClick={() => handleClaimAchievement(ach.id, ach.rewardGold)}
                          className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase animate-bounce cursor-pointer shadow"
                        >
                          領取 +{ach.rewardGold}
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-400/70">
                          +{ach.rewardGold} G
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. 每日補給 (Daily Login Bonus) */}
        {activeTab === 'daily' && (
          <div className="max-w-4xl mx-auto space-y-5 p-4 md:p-6 overflow-y-auto w-full">
            <div className="bg-gradient-to-r from-amber-950/60 to-stone-900/60 border border-[#8a7348] p-5 rounded-xl text-center">
              <div className="text-xs uppercase font-bold text-[#d4a754] tracking-[0.25em] mb-1">
                24 小時每日簽到軍需補給
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-amber-300">
                DAILY LOGISTICS SUPPLY
              </h3>
              <p className="text-xs text-stone-300 mt-1 max-w-lg mx-auto">
                飛行員每日回訪基地簽到，均可領取陸軍航空指揮部配發之戰備金幣與升級合金！
              </p>

              {dailyClaimSuccess && (
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400 px-4 py-1.5 rounded text-xs font-bold text-emerald-300 animate-pulse">
                  <Sparkles size={14} />
                  <span>補給領取成功！已存入你的金庫與裝備庫。</span>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleClaimDaily}
                  disabled={!canClaimDaily}
                  className={`px-8 py-3 rounded-lg font-black text-sm uppercase tracking-wider transition cursor-pointer ${
                    canClaimDaily
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-105'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  {canClaimDaily ? '立刻領取今日補給 CLAIM BONUS' : '今日補給已領取 (24H COOLDOWN)'}
                </button>
              </div>
            </div>

            {/* 7-Day Track Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const isCurrentStreak = ((profile.loginStreak || 0) % 7) + 1 === day;
                const isPast = ((profile.loginStreak || 0) % 7) >= day && !canClaimDaily;

                return (
                  <div
                    key={day}
                    className={`bg-black/60 border rounded-lg p-3 flex flex-col items-center justify-between text-center relative ${
                      isCurrentStreak && canClaimDaily
                        ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : isPast
                        ? 'border-emerald-600/60 bg-emerald-950/20'
                        : 'border-stone-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-stone-400 uppercase">
                      第 {day} 天
                    </span>
                    <Coins
                      size={24}
                      className={
                        isPast
                          ? 'text-emerald-400 my-2'
                          : isCurrentStreak
                          ? 'text-amber-400 my-2 animate-bounce'
                          : 'text-stone-600 my-2'
                      }
                    />
                    <div className="text-xs font-mono font-bold text-white">
                      +{400 + day * 150} G
                    </div>
                    {day >= 4 && (
                      <span className="text-[9px] text-cyan-400 font-mono mt-0.5">+3 合金</span>
                    )}
                    {isPast && (
                      <span className="text-[9px] text-emerald-400 font-bold mt-1">已領取</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
