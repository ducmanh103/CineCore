import React from 'react';

export const CurvedScreen: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center mb-10">
      {/* Curved Screen with Luminous Indigo-Cyan Glow */}
      <div className="w-full max-w-xl h-12 relative overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 500 45" className="w-full h-full stroke-indigo-500 fill-none drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]">
          <path d="M 15 38 Q 250 8 485 38" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mt-1">
        MÀN HÌNH CINECORE LASER IMAX
      </span>
    </div>
  );
};
