import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Flame, Clock } from 'lucide-react';
import { Movie } from '../../types';
import { AgeBadge } from '../ui/AgeBadge';
import { useUiStore } from '../../store/uiStore';

interface MovieCardProps {
  movie: Movie;
  badgeType?: 'HOT' | 'SNEAKSHOW' | null;
  revealIndex?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  badgeType,
  revealIndex = 0,
}) => {
  const { openTrailer } = useUiStore();
  const cardRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const genreText =
    movie.genres && movie.genres.length > 0
      ? movie.genres.map((g) => g.genre.name).slice(0, 2).join(', ')
      : 'Phim chiếu rạp';

  const releaseStr = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
    : '2026';

  const staggerMs = (revealIndex % 4) * 90;

  return (
    <article
      ref={cardRef}
      style={{ transitionDelay: isVisible ? `${staggerMs}ms` : '0ms' }}
      className={`movie-reveal ${isVisible ? 'is-visible' : ''} flex flex-col`}
    >
      {/* Clean Static Poster Frame (No Hover Tilt / No Shine / No Obstructing Overlays) */}
      <div className="relative">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#111622] border border-white/10">
          <Link to={`/movies/${movie.id}`} className="block w-full h-full">
            <img
              src={
                movie.posterUrl ||
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'
              }
              alt={`${movie.title} - ${movie.ageRating}`}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </Link>

          {/* Subtle bottom fade only for badge legibility */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 to-transparent"
          />

          {/* Top-Left Age Rating */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
            <AgeBadge rating={movie.ageRating} size="sm" />
          </div>

          {/* Top-Right Duration */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/15 text-[10px] font-mono font-semibold text-white/95">
              <Clock className="w-2.5 h-2.5 text-[#FF575F]" aria-hidden="true" />
              {movie.duration}p
            </span>
          </div>

          {/* Compact Corner Trailer Button */}
          {movie.trailerUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openTrailer(movie);
              }}
              aria-label={`Xem trailer ${movie.title}`}
              title={`Xem trailer ${movie.title}`}
              className="absolute bottom-2.5 right-2.5 z-10 h-8 w-8 rounded-full border border-white/25 bg-black/70 text-white hover:bg-[#FF385C] hover:border-[#FF385C] backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Optional Corner Status Tag */}
        {badgeType && (
          <div className="pointer-events-none absolute -right-1 -top-2 z-20">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-md border ${
                badgeType === 'HOT'
                  ? 'bg-[#FF385C] text-white border-white/25'
                  : 'bg-amber-400 text-slate-950 border-amber-200/60'
              }`}
            >
              {badgeType === 'HOT' && (
                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" aria-hidden="true" />
              )}
              <span>{badgeType === 'HOT' ? 'HOT' : 'Chiếu sớm'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Crisp Below-Poster Typography */}
      <div className="pt-2.5 sm:pt-3 px-0.5 space-y-1">
        <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs text-[#8B9BB4]">
          <span className="truncate font-medium">{genreText}</span>
          <span className="font-mono text-[10px] sm:text-[11px] text-white/60 shrink-0">
            {releaseStr}
          </span>
        </div>

        <Link
          to={`/movies/${movie.id}`}
          className="block font-display text-[13px] sm:text-sm xl:text-[15px] font-bold uppercase leading-snug text-white hover:text-[#FF575F] transition-colors line-clamp-2"
        >
          {movie.title} - {movie.ageRating || 'P'}
        </Link>
      </div>
    </article>
  );
};
