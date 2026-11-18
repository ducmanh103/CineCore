import React from 'react';

interface CurvedScreenProps {
  roomName?: string;
  screenType?: string;
}

export const CurvedScreen: React.FC<CurvedScreenProps> = ({
  roomName = 'Phòng chiếu trung tâm',
  screenType = '2D Digital',
}) => {
  return (
    <div className="w-full flex flex-col items-center mb-6 select-none">
      {/* NCC Signature Warm Orange-Red Curved Projection Screen */}
      <div className="w-full max-w-3xl h-16 sm:h-20 relative flex items-center justify-center">
        <svg
          viewBox="0 0 700 76"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nccScreenArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FB923C" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#FF575F" stopOpacity="1" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="nccScreenGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FF7A63" stopOpacity="0.32" />
              <stop offset="55%" stopColor="#FB923C" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10141B" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M 30 30 Q 350 4 670 30 L 696 74 Q 350 48 4 74 Z"
            fill="url(#nccScreenGlow)"
          />

          <path
            d="M 30 30 Q 350 4 670 30"
            fill="none"
            stroke="url(#nccScreenArc)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-center -mt-2 space-y-0.5">
        <p className="font-bold text-sm sm:text-base text-white">
          {roomName} • <span className="text-[#FF7A63]">{screenType}</span>
        </p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8B9BB4] font-semibold">
          Màn hình chiếu
        </p>
      </div>
    </div>
  );
};
