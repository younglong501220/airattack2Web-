import React from 'react';
import { DamageNumberItem } from '../game/types';

interface DamageNumbersProps {
  items: DamageNumberItem[];
}

export const DamageNumbers: React.FC<DamageNumbersProps> = ({ items }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {items.map(item => {
        const age = (Date.now() - item.createdAt) / 1000;
        const translateY = -age * 45; // float upwards
        const opacity = Math.max(0, 1 - age * 1.4);
        const scale = item.isCrit || item.isBomb ? Math.max(1, 1.4 - age * 0.4) : 1;

        let textColor = 'text-amber-300';
        let strokeColor = 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]';

        if (item.isBomb) {
          textColor = 'text-rose-400 font-black text-xl md:text-2xl';
          strokeColor = 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
        } else if (item.isCrit) {
          textColor = 'text-yellow-400 font-extrabold text-lg';
          strokeColor = 'drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]';
        } else if (item.isHeal) {
          textColor = 'text-emerald-400 font-bold text-base';
          strokeColor = 'drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]';
        }

        return (
          <div
            key={item.id}
            className={`absolute font-mono select-none transition-transform will-change-transform ${textColor} ${strokeColor}`}
            style={{
              left: `${item.screenX}%`,
              top: `${item.screenY}%`,
              transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
              opacity,
            }}
          >
            {item.text || `-${item.amount}`}
            {item.isCrit && <span className="text-[10px] text-amber-200 ml-1">CRIT!</span>}
            {item.isBomb && <span className="text-[10px] text-red-300 ml-1">BOOM!</span>}
          </div>
        );
      })}
    </div>
  );
};
