import React from 'react';
import {
  Compass,
  AlertTriangle,
  Award,
  CloudRain,
  Sun,
  CloudFog,
  ChevronRight,
  Plane,
  X,
} from 'lucide-react';
import { MissionConfig, WingmanType, PlayerUpgrades } from '../game/types';
import { sound } from '../audio/soundEngine';

interface MissionBriefingModalProps {
  mission: MissionConfig;
  missionsList: MissionConfig[];
  onSelectMission: (m: MissionConfig) => void;
  onLaunchBattle: () => void;
  onOpenHangar: () => void;
  selectedWingman: WingmanType;
  upgrades: PlayerUpgrades;
  onClose?: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  mission,
  missionsList,
  onSelectMission,
  onLaunchBattle,
  onOpenHangar,
  selectedWingman,
  upgrades,
  onClose,
}) => {
  const handleLaunch = () => {
    sound.startEngine();
    sound.pickup();
    onLaunchBattle();
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'rainstorm':
        return <CloudRain size={16} className="text-cyan-400" />;
      case 'dense_fog':
        return <CloudFog size={16} className="text-stone-300" />;
      default:
        return <Sun size={16} className="text-amber-400" />;
    }
  };

  const getWeatherLabel = (weather: string) => {
    switch (weather) {
      case 'rainstorm':
        return '熱帶暴風雨 (Rainstorm & Lightning)';
      case 'dense_fog':
        return '濃霧封鎖 (Dense Fog & Searchlights)';
      default:
        return '晴朗拂曉 (Sunny & Clear)';
    }
  };

  const getWingmanName = (w: WingmanType) => {
    switch (w) {
      case 'hurricane':
        return '颶風號 (火力掩護僚機)';
      case 'dauntless':
        return '無畏號 (戰術俯衝對地火箭)';
      case 'mustang':
        return '野馬號 (截擊防空護衛)';
      default:
        return '未派遣僚機 (單機突擊)';
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-4xl w-full bg-gradient-to-b from-[#182026] via-[#12171c] to-[#0c1014] border-2 border-[#8a7348] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-5 md:p-7 text-white relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Decorative corner bolts */}
        <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-[#d4a754]/60 border border-stone-800" />
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#d4a754]/60 border border-stone-800" />
        <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-[#d4a754]/60 border border-stone-800" />
        <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#d4a754]/60 border border-stone-800" />

        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-[#8a7348]/40 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#d4a754] uppercase tracking-[0.25em]">
              <Compass size={14} />
              <span>作戰簡報室 · MISSION BRIEFING</span>
              <span className="text-stone-500">|</span>
              <span className="text-amber-300 font-mono">{mission.code}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide mt-0.5">
              {mission.title}
            </h2>
            <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <span>{mission.sector}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-stone-300">
                {getWeatherIcon(mission.weather)}
                <span>氣候：{getWeatherLabel(mission.weather)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
                title="關閉"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Mission Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {missionsList.map(m => {
            const isSelected = m.id === mission.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMission(m)}
                className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-stone-900/80 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                <span>{m.code}</span>
                {m.hasBoss && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-red-600 text-white font-mono">
                    BOSS
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Layout (Tactical Map + Intelligence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1 flex-1">
          {/* Left: Tactical Map Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="text-xs font-bold text-[#d4a754] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>戰術飛行圖預覽 (TACTICAL MAP)</span>
              <span className="text-[10px] text-stone-400 font-mono">SCALE 1:50,000</span>
            </div>

            {/* Radar Map Canvas Preview */}
            <div className="relative aspect-square w-full rounded-lg bg-[#08121a] border border-[#8a7348]/60 overflow-hidden shadow-inner flex items-center justify-center p-3">
              {/* Radar Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Concentric Range Rings */}
              <div className="absolute w-[80%] h-[80%] rounded-full border border-cyan-500/20" />
              <div className="absolute w-[50%] h-[50%] rounded-full border border-cyan-500/20" />
              <div className="absolute w-[20%] h-[20%] rounded-full border border-cyan-500/20" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/25" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/25" />

              {/* Flight Vector Path Polyline */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  points={mission.mapWaypoints.map(wp => `${wp.x}%,${wp.y}%`).join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="opacity-80"
                />
              </svg>

              {/* Waypoints & Target Strongholds */}
              {mission.mapWaypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border-2 text-[9px] font-black ${
                      wp.type === 'boss'
                        ? 'bg-red-600 border-red-300 text-white animate-ping'
                        : wp.type === 'flak'
                        ? 'bg-rose-500 border-amber-300 text-white'
                        : wp.type === 'factory'
                        ? 'bg-amber-500 border-amber-200 text-stone-950'
                        : 'bg-emerald-500 border-emerald-300 text-stone-950'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[10px] text-amber-200/90 whitespace-nowrap bg-black/80 px-1 py-0.2 rounded mt-1 font-mono tracking-tight pointer-events-none shadow">
                    {wp.label}
                  </span>
                </div>
              ))}

              {/* Map Footer status */}
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-black/60 px-1.5 py-0.5 rounded">
                ALT: 8,000 FT · BEARING 045° NNE
              </div>
            </div>
          </div>

          {/* Right: Mission Directives & Enemy Intel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Briefing Narrative */}
            <div className="bg-black/40 border border-stone-800 p-3 rounded text-xs text-stone-300 leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1 uppercase tracking-wider">
                戰區情勢概述 (SITUATION BRIEFING)：
              </span>
              {mission.briefing}
            </div>

            {/* Clear Objectives List */}
            <div className="bg-black/50 border border-stone-800 p-3 rounded">
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>主要任務目標 (PRIMARY OBJECTIVES)</span>
                <span className="text-[10px] text-stone-400">必須全數達成</span>
              </div>
              <div className="space-y-1.5 text-xs text-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-[10px] text-amber-300 font-bold">
                    ✓
                  </div>
                  <span>
                    擊落敵軍空中編隊：
                    <strong className="text-amber-300 font-mono">
                      0 / {mission.targetAirKills}
                    </strong>{' '}
                    架
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-[10px] text-rose-300 font-bold">
                    ✓
                  </div>
                  <span>
                    俯衝轟炸地面核心設施：
                    <strong className="text-rose-300 font-mono">
                      0 / {mission.targetGroundKills}
                    </strong>{' '}
                    座
                  </span>
                </div>

                {mission.hasBoss && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600/30 border border-red-500 flex items-center justify-center text-[10px] text-red-300 font-bold animate-pulse">
                      !
                    </div>
                    <span className="text-red-300 font-bold">
                      擊潰旗艦 BOSS：{mission.bossName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enemy Intel */}
            <div className="bg-black/50 border border-stone-800 p-3 rounded">
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-400" />
                <span>敵情規格剖析 (ENEMY INTELLIGENCE)</span>
              </div>
              <div className="space-y-2">
                {mission.enemyIntel.map((intel, i) => (
                  <div key={i} className="border-l-2 border-amber-500/60 pl-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{intel.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          intel.threat === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : intel.threat === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        THREAT: {intel.threat}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">{intel.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards & Squadron Deployment */}
            <div className="bg-black/60 border border-stone-800 p-3 rounded flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  已派遣僚機支援
                </div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                  <Plane size={14} />
                  <span>{getWingmanName(selectedWingman)}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  預估作戰軍餉
                </div>
                <div className="text-xs font-black text-amber-300 font-mono mt-0.5 flex items-center gap-1 justify-end">
                  <Award size={14} className="text-amber-400" />
                  <span>+{mission.rewardGold} 黃金</span>
                  <span className="text-cyan-400">+{mission.rewardMaterials} 合金</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#8a7348]/40 pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onOpenHangar}
            className="w-full sm:w-auto px-5 py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-stone-700 flex items-center justify-center gap-2"
          >
            <span>返回基地機庫 (HANGAR & UPGRADES)</span>
          </button>

          <button
            onClick={handleLaunch}
            className="w-full sm:flex-1 max-w-md py-3.5 rounded bg-gradient-to-r from-[#d4a754] via-[#f5c363] to-[#b3852b] hover:from-[#e0b462] hover:to-[#c49434] text-stone-950 font-black text-lg uppercase tracking-wider shadow-[0_4px_25px_rgba(212,167,84,0.5)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 border border-[#ffea9f]"
          >
            <span>確認出擊 ENGAGE ENEMY</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
