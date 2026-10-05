import React from 'react';
import { Play, RotateCcw, Volume2, Crosshair, Keyboard } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  controlMode: 'mouse' | 'keyboard';
  onChangeControlMode: (mode: 'mouse' | 'keyboard') => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  volume,
  onChangeVolume,
  controlMode,
  onChangeControlMode,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-gradient-to-b from-[#182026] to-[#0f1418] border-2 border-[#8a7348] rounded-lg shadow-2xl p-6 text-white">
        <div className="text-center mb-6">
          <div className="text-xs uppercase font-bold text-[#d4a754] tracking-[0.25em] mb-1">
            TACTICAL STANDBY
          </div>
          <h2 className="text-3xl font-black text-white tracking-wider uppercase">
            作戰暫停 PAUSED
          </h2>
        </div>

        {/* Volume Slider */}
        <div className="bg-black/50 border border-stone-800 p-4 rounded mb-4">
          <div className="flex items-center justify-between text-xs text-stone-300 font-bold mb-2">
            <span className="flex items-center gap-2 text-amber-400">
              <Volume2 size={16} />
              <span>主音量 MASTER VOLUME</span>
            </span>
            <span className="font-mono">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => onChangeVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Control Mode Toggle */}
        <div className="bg-black/50 border border-stone-800 p-4 rounded mb-6">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2.5">
            駕駛操作方式 FLIGHT CONTROLS
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeControlMode('mouse')}
              className={`p-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                controlMode === 'mouse'
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
              }`}
            >
              <Crosshair size={14} />
              <span>滑鼠瞄準跟隨</span>
            </button>
            <button
              onClick={() => onChangeControlMode('keyboard')}
              className={`p-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                controlMode === 'keyboard'
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
              }`}
            >
              <Keyboard size={14} />
              <span>WASD 鍵盤</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 rounded bg-gradient-to-r from-[#d4a754] via-[#f5c363] to-[#b3852b] hover:from-[#e0b462] hover:to-[#c49434] text-stone-950 font-black text-base uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#ffea9f]"
          >
            <Play size={18} className="fill-stone-950" />
            <span>繼續作戰 RESUME MISSION</span>
          </button>

          <button
            onClick={() => {
              sound.pickup();
              onRestart();
            }}
            className="w-full py-2.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-700 flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>重新開始戰役 RESTART</span>
          </button>
        </div>
      </div>
    </div>
  );
};
