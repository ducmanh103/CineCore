import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Ticket, ExternalLink, Film, Clock } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { AgeBadge } from './AgeBadge';

function toYoutubeEmbedUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  try {
    if (rawUrl.includes('youtube.com/embed/')) {
      const sep = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${sep}autoplay=1&rel=0`;
    }
    const url = new URL(rawUrl);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}?autoplay=1&rel=0` : rawUrl;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export const TrailerModal: React.FC = () => {
  const { trailerMovie, closeTrailer } = useUiStore();

  useEffect(() => {
    if (!trailerMovie) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTrailer();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [trailerMovie, closeTrailer]);

  if (!trailerMovie) return null;

  const embedUrl = toYoutubeEmbedUrl(trailerMovie.trailerUrl);

  return (
    <div
      className="fixed inset-0 z-[108] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
      onClick={closeTrailer}
    >
      {/* Ambient Cinema Screen Backlight */}
      {(trailerMovie.bannerUrl || trailerMovie.posterUrl) && (
        <img
          src={trailerMovie.bannerUrl || trailerMovie.posterUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 w-full h-full object-cover opacity-25 blur-3xl scale-110"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Trailer phim ${trailerMovie.title}`}
        onClick={(e) => e.stopPropagation()}
        className="relative animate-scale-in w-full max-w-5xl rounded-3xl bg-[#0B0F1A] border border-white/15 shadow-float overflow-hidden"
      >
        {/* Screening Room Header */}
        <div className="px-5 py-4 sm:px-6 bg-[#0E1320]/95 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-400/30 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-mono font-bold text-indigo-300 uppercase">
                  TRAILER CHÍNH THỨC
                </span>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-50 truncate">
                  {trailerMovie.title}
                </h3>
                <AgeBadge rating={trailerMovie.ageRating} size="sm" />
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-rose-400" aria-hidden="true" />
                  {trailerMovie.duration} phút
                </span>
                {trailerMovie.director && (
                  <span className="truncate">• Đạo diễn: {trailerMovie.director}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={`/movies/${trailerMovie.id}`}
              onClick={closeTrailer}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-luminous hover:opacity-95 transition-opacity"
            >
              <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Chọn Suất & Đặt Vé</span>
            </Link>
            <button
              type="button"
              onClick={closeTrailer}
              aria-label="Đóng cửa sổ trailer"
              className="p-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] border border-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 16:9 Projection Stage */}
        <div className="aspect-video w-full bg-black relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Trailer chính thức ${trailerMovie.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-slate-300 space-y-4">
              <Film className="w-10 h-10 text-slate-500" aria-hidden="true" />
              <p className="text-sm font-semibold">
                Bộ phim này hiện đang cập nhật đường dẫn Trailer IMAX chính thức.
              </p>
              <Link
                to={`/movies/${trailerMovie.id}`}
                onClick={closeTrailer}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-luminous"
              >
                <span>Xem chi tiết & lịch chiếu</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
