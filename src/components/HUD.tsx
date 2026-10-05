import React from 'react';
import { PlayerState } from '../game/types';
import {
  Volume2,
  VolumeX,
  Pause,
  Maximize,
  MousePointer,
  Keyboard,
  Target,
  Sun,
  CloudRain,
  CloudFog,
  Plane,
  Home,
  Radio,
  Zap,
  Sparkles,
} from 'lucide-react';
import { FlightInstruments } from './FlightInstruments';

interface HUDProps {
  playerState: PlayerState;
  onPause: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  controlMode: 'mouse' | 'keyboard';
  onToggleControlMode: () => void;
  onReturnToHangar?: () => void;
  weatherAlert?: string | null;
  radioComms?: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  playerState,
  onPause,
  onToggleMute,
  isMuted,
  controlMode,
  onToggleControlMode,
  onReturnToHangar,
  weatherAlert,
  radioComms,
}) => {
  const hpPct = Math.max(0, Math.min(100, (playerState.hp / playerState.maxHp) * 100));
  const isCriticalHp = hpPct < 30;

  const handleBombClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trigger = (window as unknown as { triggerGameBomb?: () => void }).triggerGameBomb;
    if (trigger) {
      trigger();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getWeatherIcon = (w: string) => {
    switch (w) {
      case 'rainstorm':
        return <CloudRain size={13} className="text-cyan-400" />;
      case 'dense_fog':
        return <CloudFog size={13} className="text-stone-300" />;
      default:
        return <Sun size={13} className="text-amber-400" />;
    }
  };

  const getWeatherText = (w: string) => {
    switch (w) {
      case 'rainstorm':
        return '暴風雨 (Rainstorm)';
      case 'dense_fog':
        return '濃霧 (Dense Fog)';
      default:
        return '晴朗 (Sunny)';
    }
  };

  const mission = playerState.mission;
  const airKills = playerState.missionAirKills;
  const groundKills = playerState.missionGroundKills;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 z-20 font-sans select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start w-full gap-2 md:gap-3">
        {/* Left: Score & Combo Panel */}
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="bg-gradient-to-br from-[#1e2329]/95 via-[#14191f]/90 to-[#0c1014]/95 border-2 border-[#8a7348] px-3.5 py-2 rounded shadow-[0_6px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
            <div className="text-[10px] uppercase font-bold text-[#d4a754] tracking-[0.2em]">
              作戰得分 SCORE
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-wider text-white font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {String(playerState.score).padStart(6, '0')}
            </div>

            {/* Combo Multiplier Alert */}
            {playerState.combo > 1 && (
              <div className="mt-1 flex items-center gap-1.5 animate-pulse">
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 tracking-wider">
                  x{playerState.comboMultiplier} COMBO
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  {playerState.combo} 連續擊殺
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={onToggleMute}
              className="p-1.5 md:p-2 rounded bg-black/60 border border-stone-700/80 text-amber-400 hover:text-amber-300 hover:border-amber-500 hover:bg-black/80 transition cursor-pointer backdrop-blur-sm"
              title={isMuted ? '取消靜音 (Unmute)' : '靜音 (Mute)'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={onToggleControlMode}
              className="px-2 py-1 rounded bg-black/60 border border-stone-700/80 text-[11px] font-medium text-stone-300 hover:text-amber-300 hover:border-amber-500 transition cursor-pointer flex items-center gap-1 backdrop-blur-sm"
              title="切換操作方式"
            >
              {controlMode === 'mouse' ? (
                <>
                  <MousePointer size={12} className="text-amber-400" />
                  <span>滑鼠</span>
                </>
              ) : (
                <>
                  <Keyboard size={12} className="text-amber-400" />
                  <span>WASD</span>
                </>
              )}
            </button>

            <button
              onClick={onPause}
              className="p-1.5 md:p-2 rounded bg-black/60 border border-stone-700/80 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition cursor-pointer backdrop-blur-sm"
              title="暫停遊戲 (Pause)"
            >
              <Pause size={15} />
            </button>

            {onReturnToHangar && (
              <button
                onClick={onReturnToHangar}
                className="p-1.5 md:p-2 rounded bg-black/60 border border-stone-700/80 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition cursor-pointer backdrop-blur-sm"
                title="返回機庫 (Base Hangar)"
              >
                <Home size={15} />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 rounded bg-black/60 border border-stone-700/80 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition cursor-pointer backdrop-blur-sm hidden md:block"
              title="全螢幕"
            >
              <Maximize size={15} />
            </button>
          </div>
        </div>

        {/* Center: Live Mission Objectives Tracker */}
        <div className="flex flex-col items-center max-w-xs md:max-w-md w-full">
          <div className="bg-gradient-to-b from-[#182026]/95 to-[#0e1318]/95 border-2 border-[#8a7348]/70 px-3.5 py-2 rounded-lg shadow-xl backdrop-blur-md w-full text-center">
            <div className="flex items-center justify-between text-[10px] text-[#d4a754] font-bold uppercase tracking-wider mb-1.5 border-b border-stone-800 pb-1">
              <span className="flex items-center gap-1 text-white">
                <Target size={12} className="text-amber-400" />
                <span>{mission ? mission.code : 'PATROL MISSION'}</span>
              </span>
              <span className="flex items-center gap-1 font-normal text-stone-300">
                {getWeatherIcon(playerState.currentWeather)}
                <span>{getWeatherText(playerState.currentWeather)}</span>
              </span>
            </div>

            {/* Directives Progress */}
            {mission && (
              <div className="grid grid-cols-2 gap-2 text-left">
                {/* Air Target Goal */}
                <div className="bg-black/40 px-2 py-1 rounded border border-stone-800">
                  <div className="flex justify-between text-[10px] text-stone-300">
                    <span>擊落敵機</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {airKills} / {mission.targetAirKills}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-stone-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-200"
                      style={{
                        width: `${Math.min(100, (airKills / mission.targetAirKills) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Ground Bomb Target Goal */}
                <div className="bg-black/40 px-2 py-1 rounded border border-stone-800">
                  <div className="flex justify-between text-[10px] text-stone-300">
                    <span>轟炸設施</span>
                    <span className="font-mono text-rose-300 font-bold">
                      {groundKills} / {mission.targetGroundKills}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-stone-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-200"
                      style={{
                        width: `${Math.min(
                          100,
                          (groundKills / mission.targetGroundKills) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wingman Active Tag */}
            {playerState.selectedWingman !== 'none' && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-cyan-300 font-mono">
                <Plane size={11} />
                <span>僚機隨行: {playerState.selectedWingman.toUpperCase()} IN FLIGHT</span>
              </div>
            )}
          </div>

          {/* Random Tactical Secondary Challenge Banner */}
          {playerState.tacticalChallenge && (
            <div
              className={`mt-2 border-2 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md w-full max-w-sm transition-all duration-300 ${
                playerState.tacticalChallenge.completed
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                  : playerState.tacticalChallenge.failed
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                  : 'bg-gradient-to-r from-[#241a0b]/95 via-[#1a1408]/95 to-[#241a0b]/95 border-amber-500/90 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-white">
                  <Sparkles size={13} className="text-amber-400 animate-spin" />
                  <span>{playerState.tacticalChallenge.title}</span>
                </span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/60 font-bold">
                  {playerState.tacticalChallenge.completed ? (
                    <span className="text-emerald-400">達成 (+{playerState.tacticalChallenge.rewardGold}G)</span>
                  ) : playerState.tacticalChallenge.failed ? (
                    <span className="text-rose-400">未達成</span>
                  ) : (
                    <span className="text-amber-300">{Math.ceil(playerState.tacticalChallenge.timeLeft)}s</span>
                  )}
                </span>
              </div>
              <div className="text-[10px] text-stone-300 mt-1 leading-tight">
                {playerState.tacticalChallenge.description}
              </div>
              {!playerState.tacticalChallenge.completed && !playerState.tacticalChallenge.failed && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-150"
                      style={{
                        width: `${(playerState.tacticalChallenge.timeLeft / playerState.tacticalChallenge.duration) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 font-bold shrink-0">
                    {playerState.tacticalChallenge.currentCount} / {playerState.tacticalChallenge.targetCount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Radio Comms & Weather Notification Banners */}
          {radioComms && (
            <div className="mt-2 bg-black/85 border border-cyan-400/70 text-cyan-300 px-3 py-1.5 rounded shadow-lg backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-bounce max-w-sm">
              <Radio size={14} className="text-cyan-400 shrink-0 animate-pulse" />
              <span className="leading-tight">{radioComms}</span>
            </div>
          )}

          {weatherAlert && (
            <div className="mt-1.5 bg-black/85 border border-amber-400/70 text-amber-300 px-3 py-1.5 rounded shadow-lg backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-pulse max-w-sm">
              <Zap size={14} className="text-amber-400 shrink-0" />
              <span className="leading-tight">{weatherAlert}</span>
            </div>
          )}
        </div>

        {/* Right: Armor & Tactical Bombs */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="bg-gradient-to-bl from-[#1e2329]/95 via-[#14191f]/90 to-[#0c1014]/95 border-2 border-[#8a7348] px-3.5 py-2 rounded shadow-[0_6px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm text-right min-w-[150px] sm:min-w-[190px]">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] mb-1">
              <span className="text-stone-400">裝甲</span>
              <span
                className={
                  isCriticalHp ? 'text-red-400 font-black animate-pulse' : 'text-emerald-400'
                }
              >
                {Math.round(hpPct)}%
              </span>
            </div>

            {/* Armor Gauge Fill */}
            <div className="w-full h-2.5 bg-stone-900 border border-stone-600 rounded-sm overflow-hidden relative shadow-inner">
              <div
                className={`h-full transition-all duration-150 rounded-sm ${
                  isCriticalHp
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                    : hpPct < 60
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                }`}
                style={{ width: `${hpPct}%` }}
              />
            </div>

            {/* Heavy Bombs Indicator */}
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase text-[#d4a754] tracking-[0.15em]">
                重爆炸彈 BOMBS
              </div>
              <div className="text-[10px] font-mono text-stone-400">
                {playerState.bombs} / {playerState.maxBombs}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-1">
              {Array.from({ length: playerState.maxBombs }).map((_, idx) => {
                const isLoaded = idx < playerState.bombs;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-5 rounded-t-xs rounded-b-sm border transition-all duration-200 flex flex-col justify-between p-0.5 ${
                      isLoaded
                        ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                        : 'bg-stone-800 border-stone-700 opacity-30 shadow-none'
                    }`}
                    title={isLoaded ? '炸彈就緒 Ready' : '補給裝填中 Reloading'}
                  >
                    <div className="w-full h-0.5 bg-stone-900/60 rounded-xs" />
                    <div className="w-full h-1 bg-red-700/80 rounded-b-xs" />
                  </div>
                );
              })}
            </div>

            {/* Bomb Reload Progress Bar */}
            {playerState.bombs < playerState.maxBombs && (
              <div className="w-full h-1 bg-stone-800 mt-1.5 rounded overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100"
                  style={{ width: `${(playerState.bombReloadProgress || 0) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Instructions & Tactical Actuator */}
      <div className="flex justify-between items-end w-full gap-2 sm:gap-4">
        {/* Controls Info Box */}
        <div className="pointer-events-auto bg-black/75 border-l-4 border-[#d4a754] px-3 py-2 rounded-r shadow-lg backdrop-blur-sm text-xs text-stone-300 max-w-sm hidden sm:block">
          <div className="text-[10px] text-[#d4a754] font-bold uppercase tracking-wider mb-0.5">
            飛行火控系統
          </div>
          <div className="space-y-0.5 text-[11px] leading-relaxed">
            <div>
              <span className="text-amber-300 font-semibold">[滑鼠拖曳 / WASD]</span> 戰術飛行
            </div>
            <div>
              <span className="text-amber-300 font-semibold">[空白鍵 / 右鍵]</span> 投擲 500lb 重磅炸彈
            </div>
          </div>
        </div>

        {/* Center: Real Cockpit Flight Instruments (ADI & Compass) */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="bg-gradient-to-b from-[#1b2229]/95 to-[#0b1014]/95 border-2 border-[#8a7348] p-1.5 rounded-xl shadow-[0_6px_25px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <FlightInstruments
              pitch={playerState.flightPitch || 0}
              roll={playerState.flightRoll || 0}
              heading={playerState.flightHeading || 0}
            />
          </div>
        </div>

        {/* Big Tactical Bomb Button */}
        <div className="pointer-events-auto ml-auto">
          <button
            onClick={handleBombClick}
            onTouchStart={handleBombClick}
            disabled={playerState.bombs <= 0}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex flex-col items-center justify-center font-bold tracking-wider transition-all duration-150 select-none cursor-pointer ${
              playerState.bombs > 0
                ? 'bg-gradient-to-b from-red-600 via-rose-700 to-red-950 border-amber-400 text-white shadow-[0_0_25px_rgba(225,29,72,0.8)] active:scale-95 hover:scale-105'
                : 'bg-stone-800/80 border-stone-600 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            <span className="text-[10px] uppercase text-amber-300 tracking-widest font-black">
              戰術投彈
            </span>
            <span className="text-base md:text-lg font-black tracking-tighter">BOMB</span>
            <span className="text-[10px] text-amber-200/90 font-mono mt-0.5">
              [{playerState.bombs}]
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
