import React from 'react';

interface AgeBadgeProps {
  rating?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const RATING_CONFIG: Record<string, { badge: string; label: string }> = {
  P: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 backdrop-blur-md',
    label: 'Phổ biến mọi độ tuổi',
  },
  K: {
    badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40 backdrop-blur-md',
    label: 'Dưới 13 tuổi có người giám hộ',
  },
  T13: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/45 backdrop-blur-md',
    label: 'Khán giả từ đủ 13 tuổi',
  },
  C13: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/45 backdrop-blur-md',
    label: 'Khán giả từ đủ 13 tuổi',
  },
  T16: {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-400/45 backdrop-blur-md',
    label: 'Khán giả từ đủ 16 tuổi',
  },
  C16: {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-400/45 backdrop-blur-md',
    label: 'Khán giả từ đủ 16 tuổi',
  },
  T18: {
    badge: 'bg-rose-500/25 text-rose-200 border-rose-400/50 backdrop-blur-md',
    label: 'Khán giả từ đủ 18 tuổi',
  },
  C18: {
    badge: 'bg-rose-500/25 text-rose-200 border-rose-400/50 backdrop-blur-md',
    label: 'Khán giả từ đủ 18 tuổi',
  },
};

export const AgeBadge: React.FC<AgeBadgeProps> = ({
  rating = 'P',
  size = 'md',
  showLabel = false,
}) => {
  const normalized = rating.toUpperCase().trim();
  const cfg = RATING_CONFIG[normalized] || {
    badge: 'bg-white/10 text-slate-200 border-white/20 backdrop-blur-md',
    label: `Phân loại ${normalized}`,
  };

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] rounded-md'
      : 'px-2.5 py-1 text-[11px] rounded-lg';

  return (
    <span
      title={cfg.label}
      className={`inline-flex items-center gap-1.5 font-mono font-extrabold tracking-tight border select-none ${sizeClass} ${cfg.badge}`}
    >
      <span>{normalized}</span>
      {showLabel && (
        <span className="font-sans font-semibold opacity-95 border-l border-current/25 pl-1.5">
          {cfg.label}
        </span>
      )}
    </span>
  );
};
