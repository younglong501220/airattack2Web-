import React from 'react';
import { Plane, Bomb, Shield, Award, Play, Crosshair, Keyboard } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface BriefingOverlayProps {
  onStart: () => void;
  highScore: number;
  controlMode: 'mouse' | 'keyboard';
  onChangeControlMode: (mode: 'mouse' | 'keyboard') => void;
}

export const BriefingOverlay: React.FC<BriefingOverlayProps> = ({
  onStart,
  highScore,
  controlMode,
  onChangeControlMode,
}) => {
  const handleStartMission = () => {
    sound.startEngine();
    sound.pickup();
    onStart();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gradient-to-b from-[#080d12]/95 via-[#101720]/90 to-[#060a0e]/95 backdrop-blur-md">
      <div className="max-w-2xl w-full bg-gradient-to-b from-[#182026] to-[#0f1418] border-2 border-[#8a7348] rounded-lg shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-6 md:p-8 text-white relative overflow-hidden">
        {/* Decorative corner rivets */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#d4a754]/60 border border-stone-800" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d4a754]/60 border border-stone-800" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#d4a754]/60 border border-stone-800" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#d4a754]/60 border border-stone-800" />

        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="text-xs uppercase font-bold text-[#d4a754] tracking-[0.35em] mb-1.5 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#d4a754]/40" />
            AIRATTACK 2 TRIBUTE · PACIFIC 1944
            <span className="w-8 h-px bg-[#d4a754]/40" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-amber-400 tracking-wider uppercase drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)]">
            極限空戰 1944
          </h1>
          <p className="text-stone-300 text-sm md:text-base tracking-[0.2em] font-medium mt-1">
            縱軸 3D 二戰電影級突襲 · 雙層戰場實裝版
          </p>

          {highScore > 0 && (
            <div className="mt-2.5 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded text-xs text-amber-300">
              <Award size={14} className="text-amber-400" />
              <span>歷史最高戰果：{highScore.toLocaleString()} PTS</span>
            </div>
          )}
        </div>

        {/* Tactical Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-black/40 border border-stone-700/80 p-3.5 rounded">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Plane size={16} />
              <span>1. 高空機砲攔截</span>
            </div>
            <p className="text-[12px] text-stone-300 leading-relaxed">
              雙聯 Hispano 20mm 機砲自動全速開火，獵殺來襲的敵方戰鬥機與雙發重轟炸機。
            </p>
          </div>

          <div className="bg-black/40 border border-stone-700/80 p-3.5 rounded">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Bomb size={16} />
              <span>2. 戰術地面轟炸</span>
            </div>
            <p className="text-[12px] text-stone-300 leading-relaxed">
              利用地面紅色導引準心，投擲 500lb 重爆炸彈徹底炸毀兵工廠、防空砲堡與油庫！
            </p>
          </div>

          <div className="bg-black/40 border border-stone-700/80 p-3.5 rounded">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Shield size={16} />
              <span>3. 空投物資奪取</span>
            </div>
            <p className="text-[12px] text-stone-300 leading-relaxed">
              炸毀重型建築或擊落王牌敵機會爆出降落傘物資包，迅速接近即可修復裝甲與補給炸彈。
            </p>
          </div>
        </div>

        {/* Control Preference Selector */}
        <div className="bg-black/50 border border-stone-700/70 p-3.5 rounded mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-300 flex items-center gap-2">
            <span className="font-bold text-amber-400">操作偏好：</span>
            <span>選擇你的駕駛控制模式</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeControlMode('mouse')}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                controlMode === 'mouse'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
              }`}
            >
              <Crosshair size={14} />
              <span>滑鼠跟隨 (推薦)</span>
            </button>
            <button
              onClick={() => onChangeControlMode('keyboard')}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                controlMode === 'keyboard'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
              }`}
            >
              <Keyboard size={14} />
              <span>WASD / 方向鍵</span>
            </button>
          </div>
        </div>

        {/* Start Mission Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleStartMission}
            className="w-full py-4 rounded bg-gradient-to-r from-[#d4a754] via-[#f5c363] to-[#b3852b] hover:from-[#e0b462] hover:to-[#c49434] text-stone-950 font-black text-xl md:text-2xl uppercase tracking-[0.2em] shadow-[0_6px_25px_rgba(212,167,84,0.45)] hover:shadow-[0_8px_35px_rgba(212,167,84,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3 border border-[#ffea9f]"
          >
            <Play size={22} className="fill-stone-950" />
            <span>出擊 START MISSION</span>
          </button>
          <div className="text-[11px] text-stone-400 text-center tracking-wider">
            Web Audio 引擎已就緒 · 即開即玩無延遲
          </div>
        </div>
      </div>
    </div>
  );
};
