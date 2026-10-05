import React, { useEffect } from 'react';
import { RotateCcw, Award, Plane, Bomb, Shield, Zap, CheckCircle2, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerState } from '../game/types';
import { sound } from '../audio/soundEngine';

interface GameOverOverlayProps {
  playerState: PlayerState;
  onRestart: () => void;
  onHome: () => void;
  isNewHighScore: boolean;
  isVictory?: boolean;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  playerState,
  onRestart,
  onHome,
  isNewHighScore,
  isVictory = false,
}) => {
  useEffect(() => {
    if (isVictory || (isNewHighScore && playerState.score > 0)) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4a754', '#f59e0b', '#10b981', '#38bdf8'],
      });
    }
  }, [isVictory, isNewHighScore, playerState.score]);

  const handleRetry = () => {
    sound.startEngine();
    sound.pickup();
    onRestart();
  };

  const mission = playerState.mission;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gradient-to-b from-[#080d12]/95 via-[#101720]/90 to-[#060a0e]/95 backdrop-blur-md">
      <div className="max-w-xl w-full bg-gradient-to-b from-[#182026] to-[#0f1418] border-2 border-[#8a7348] rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-6 md:p-8 text-white relative overflow-hidden">
        {/* Title Header */}
        <div className="text-center mb-5">
          <div
            className={`text-xs uppercase font-bold tracking-[0.3em] mb-1 flex items-center justify-center gap-1.5 ${
              isVictory ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            {isVictory ? <CheckCircle2 size={14} /> : null}
            <span>
              {isVictory
                ? 'VICTORY OVER PACIFIC · 作戰大獲全勝'
                : 'MISSION TERMINATED · 作戰簡報'}
            </span>
          </div>
          <h2
            className={`text-4xl md:text-5xl font-black tracking-wider uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
              isVictory ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isVictory ? '戰役勝利' : '任務告終'}
          </h2>
          <p className="text-stone-300 text-xs md:text-sm tracking-wider mt-1">
            {isVictory
              ? `成功肅清 ${mission?.code || '戰區'}，完成所有作戰指標！`
              : '你的戰鬥機在太平洋前線完成了英勇的巡航'}
          </p>
        </div>

        {/* Score Summary Card */}
        <div className="bg-black/60 border border-[#8a7348] p-4 rounded text-center mb-5 relative">
          <div className="text-xs uppercase font-bold text-[#d4a754] tracking-[0.2em] mb-1">
            最終作戰果實 FINAL SCORE
          </div>
          <div className="text-4xl md:text-5xl font-black text-amber-300 font-mono tracking-widest drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
            {playerState.score.toLocaleString()}
          </div>

          {isNewHighScore && (
            <div className="mt-2 inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/50 px-3 py-1 rounded text-xs font-bold text-amber-300 animate-pulse">
              <Award size={14} className="text-amber-400" />
              <span>榮獲新歷史最高紀錄 NEW RECORD!</span>
            </div>
          )}

          {isVictory && mission && (
            <div className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-1 px-3 rounded inline-block">
              獲得作戰獎勵：+{mission.rewardGold} 黃金 · +{mission.rewardMaterials} 合金
            </div>
          )}
        </div>

        {/* Combat Metrics Breakdown */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-black/40 border border-stone-800 p-2.5 rounded flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/20 text-amber-400">
              <Plane size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                擊落敵機編隊
              </div>
              <div className="text-base font-bold text-white font-mono">
                {playerState.missionAirKills} 架
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-stone-800 p-2.5 rounded flex items-center gap-2.5">
            <div className="p-2 rounded bg-rose-500/20 text-rose-400">
              <Bomb size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                轟炸地面設施
              </div>
              <div className="text-base font-bold text-white font-mono">
                {playerState.missionGroundKills} 座
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-stone-800 p-2.5 rounded flex items-center gap-2.5">
            <div className="p-2 rounded bg-purple-500/20 text-purple-400">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                最高連擊次數
              </div>
              <div className="text-base font-bold text-white font-mono">
                {playerState.stats.maxCombo} 連殺
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-stone-800 p-2.5 rounded flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-500/20 text-emerald-400">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                回收空投物資
              </div>
              <div className="text-base font-bold text-white font-mono">
                {playerState.stats.itemsCollected} 箱
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleRetry}
            className="w-full sm:flex-1 py-3 rounded bg-gradient-to-r from-[#d4a754] via-[#f5c363] to-[#b3852b] hover:from-[#e0b462] hover:to-[#c49434] text-stone-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(212,167,84,0.4)] transition cursor-pointer flex items-center justify-center gap-2 border border-[#ffea9f]"
          >
            <RotateCcw size={16} />
            <span>再次出擊 RETRY MISSION</span>
          </button>

          <button
            onClick={onHome}
            className="w-full sm:w-auto px-5 py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-stone-700 flex items-center justify-center gap-1.5"
          >
            <Home size={14} />
            <span>返回基地機庫</span>
          </button>
        </div>
      </div>
    </div>
  );
};
