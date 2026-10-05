import React from 'react';

interface FlightInstrumentsProps {
  pitch: number;    // degrees (-30 to +30)
  roll: number;     // degrees (-60 to +60)
  heading: number;  // degrees (0 to 360)
}

export const FlightInstruments: React.FC<FlightInstrumentsProps> = ({
  pitch,
  roll,
  heading,
}) => {
  // Constrain visual pitch offset in pixels (-25px to +25px)
  const pitchOffsetPx = Math.max(-28, Math.min(28, pitch * 1.5));
  const clampedRoll = Math.max(-65, Math.min(65, roll));

  // Cardinal direction text
  const getHeadingStr = (deg: number) => {
    const d = (deg % 360 + 360) % 360;
    if (d >= 337.5 || d < 22.5) return `${Math.round(d).toString().padStart(3, '0')}° N`;
    if (d >= 22.5 && d < 67.5) return `${Math.round(d).toString().padStart(3, '0')}° NE`;
    if (d >= 67.5 && d < 112.5) return `${Math.round(d).toString().padStart(3, '0')}° E`;
    if (d >= 112.5 && d < 157.5) return `${Math.round(d).toString().padStart(3, '0')}° SE`;
    if (d >= 157.5 && d < 202.5) return `${Math.round(d).toString().padStart(3, '0')}° S`;
    if (d >= 202.5 && d < 247.5) return `${Math.round(d).toString().padStart(3, '0')}° SW`;
    if (d >= 247.5 && d < 292.5) return `${Math.round(d).toString().padStart(3, '0')}° W`;
    return `${Math.round(d).toString().padStart(3, '0')}° NW`;
  };

  return (
    <div className="flex items-center gap-2 pointer-events-auto select-none font-mono">
      {/* 1. 水平姿態指示器 (ADI / Artificial Horizon) */}
      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#8a7348] bg-black/90 shadow-[0_4px_15px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-0.5">
        {/* Brass Bezel Frame */}
        <div className="absolute inset-0 rounded-full border border-stone-600/60 pointer-events-none z-20 shadow-inner" />

        {/* Outer Roll Reference Ticks */}
        <div className="absolute inset-1 rounded-full pointer-events-none z-15">
          {[-45, -30, -15, 0, 15, 30, 45].map(deg => (
            <div
              key={deg}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-amber-400 origin-[50%_35px] sm:origin-[50%_39px]"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>

        {/* Rotating Horizon Disc (Sky/Ground ball) */}
        <div
          className="absolute w-32 h-32 rounded-full overflow-hidden transition-transform duration-75 will-change-transform flex flex-col"
          style={{
            transform: `rotate(${-clampedRoll}deg) translateY(${pitchOffsetPx}px)`,
          }}
        >
          {/* Sky (Upper half) */}
          <div className="w-full h-16 bg-gradient-to-b from-sky-700 via-sky-600 to-sky-500 relative flex items-end justify-center">
            {/* Pitch ladder +10, +20 */}
            <div className="absolute bottom-6 w-8 h-px bg-white/90 flex justify-between items-center text-[7px] text-white">
              <span>20</span>
              <span className="w-1.5 h-1 border-t border-l border-white" />
              <span>20</span>
            </div>
            <div className="absolute bottom-3 w-5 h-px bg-white/80 flex justify-between items-center text-[7px] text-white">
              <span className="w-1 h-0.5 border-t border-l border-white" />
            </div>
          </div>

          {/* White Horizon Line */}
          <div className="w-full h-0.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] z-10" />

          {/* Ground (Lower half) */}
          <div className="w-full h-16 bg-gradient-to-b from-[#5c3e21] via-[#452e18] to-[#2e1d0e] relative flex items-start justify-center">
            {/* Pitch ladder -10, -20 */}
            <div className="absolute top-3 w-5 h-px bg-white/70 flex justify-between items-center text-[7px] text-white">
              <span className="w-1 h-0.5 border-b border-l border-white" />
            </div>
            <div className="absolute top-6 w-8 h-px bg-white/90 flex justify-between items-center text-[7px] text-white">
              <span>20</span>
              <span className="w-1.5 h-1 border-b border-l border-white" />
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Fixed Center Miniature Aircraft Reticle Symbol (Yellow wings & dot) */}
        <div className="absolute z-20 pointer-events-none flex items-center justify-center">
          {/* Left Wing */}
          <div className="w-3.5 sm:w-4 h-1 bg-amber-400 border border-black shadow" />
          {/* Center Pip */}
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-black mx-0.5 shadow" />
          {/* Right Wing */}
          <div className="w-3.5 sm:w-4 h-1 bg-amber-400 border border-black shadow" />
        </div>

        {/* Top roll indicator pointer */}
        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-amber-400 z-20" />

        {/* Label */}
        <div className="absolute bottom-1 text-[8px] font-bold text-[#d4a754] uppercase tracking-wider z-25 bg-black/60 px-1 rounded">
          ADI
        </div>
      </div>

      {/* 2. 航空羅盤 (Directional Gyro / Heading Compass) */}
      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#8a7348] bg-black/90 shadow-[0_4px_15px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-0.5">
        {/* Brass Bezel Frame */}
        <div className="absolute inset-0 rounded-full border border-stone-600/60 pointer-events-none z-20 shadow-inner" />

        {/* Rotating 360° Compass Card Dial */}
        <div
          className="absolute inset-1 rounded-full transition-transform duration-75 will-change-transform flex items-center justify-center"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          {/* Cardinal Points */}
          <span className="absolute top-1 text-[9px] font-black text-rose-500">N</span>
          <span className="absolute bottom-1 text-[9px] font-black text-stone-300">S</span>
          <span className="absolute right-1 text-[9px] font-black text-stone-300">E</span>
          <span className="absolute left-1 text-[9px] font-black text-stone-300">W</span>

          {/* Compass Ticks every 30 deg */}
          {[30, 60, 120, 150, 210, 240, 300, 330].map(deg => (
            <div
              key={deg}
              className="absolute top-0.5 left-1/2 -translate-x-1/2 w-px h-1.5 bg-stone-500 origin-[50%_33px] sm:origin-[50%_37px]"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}

          {/* Inner Compass Star Cross */}
          <div className="w-6 h-6 border border-stone-700/60 rounded-full flex items-center justify-center">
            <div className="w-px h-4 bg-stone-700" />
            <div className="w-4 h-px bg-stone-700 absolute" />
          </div>
        </div>

        {/* Top Lubber Line Marker (Current Heading Index) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-amber-400 z-20 shadow-[0_0_4px_rgba(245,158,11,0.8)]" />

        {/* Center Aircraft Symbol */}
        <div className="absolute z-20 pointer-events-none w-2 h-2 rounded-full bg-amber-400/80 border border-stone-900" />

        {/* Digital Heading Readout */}
        <div className="absolute bottom-1 text-[8px] font-bold text-amber-300 font-mono z-25 bg-black/75 px-1 py-0.2 rounded border border-stone-800">
          {getHeadingStr(heading)}
        </div>
      </div>
    </div>
  );
};
