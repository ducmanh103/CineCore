import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Star,
  Pause,
  Clock,
  Calendar,
  Film,
} from 'lucide-react';
import { Movie } from '../../types';
import { AgeBadge } from '../ui/AgeBadge';
import { useUiStore } from '../../store/uiStore';

interface HeroCarouselProps {
  movies: Movie[];
}

export function getCensorshipText(rating?: string): string {
  const r = (rating || 'P').toUpperCase().trim();
  if (r === 'T18' || r === 'C18') {
    return 'Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (18+)';
  }
  if (r === 'T16' || r === 'C16') {
    return 'Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên (16+)';
  }
  if (r === 'T13' || r === 'C13') {
    return 'Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (13+)';
  }
  if (r === 'K') {
    return 'Phim được phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ';
  }
  return 'Phim được phép phổ biến đến người xem ở mọi độ tuổi (P)';
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userStars, setUserStars] = useState<number>(5);
  const touchStartX = useRef<number | null>(null);
  const { openTrailer } = useUiStore();

  const goToSlide = useCallback(
    (nextIdx: number) => {
      if (!movies.length) return;
      const wrapped = (nextIdx + movies.length) % movies.length;
      setCurrentIdx(wrapped);
    },
    [movies.length],
  );

  // Slow, calm 8-second auto transition
  useEffect(() => {
    if (movies.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies.length, isPaused]);

  if (!movies.length) return null;

  const currentMovie = movies[currentIdx] || movies[0];

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 45) {
      if (delta < 0) goToSlide(currentIdx + 1);
      else goToSlide(currentIdx - 1);
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Phim tâm điểm đang chiếu tại rạp"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#080B11] border-b border-white/[0.08]"
    >
      {/* ====================================================================
          MOBILE HERO VIEW (< lg): Native Cinema App Layout
         ==================================================================== */}
      <div className="lg:hidden">
        {/* Top Clean 16:9 Widescreen Banner Stage with Silky Crossfade */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#0B0F19]">
          {movies.map((m, idx) => {
            const active = idx === currentIdx;
            const src =
              m.bannerUrl ||
              m.posterUrl ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200';
            return (
              <img
                key={`mob-bg-${m.id}`}
                src={src}
                alt={active ? m.title : ''}
                aria-hidden={!active}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  active ? 'opacity-100 scale-100 z-[1]' : 'opacity-0 scale-[1.04] z-0'
                }`}
              />
            );
          })}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#080B11] via-[#080B11]/35 to-black/20"
          />

          {/* Top-Left Live Tag */}
          <div className="absolute top-3 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-white">
              <Film className="w-3 h-3 text-[#FF575F]" aria-hidden="true" />
              <span>
                {currentMovie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Phim nổi bật'}
              </span>
            </span>
          </div>

          {/* Centered Play Trailer Circle on Banner */}
          {currentMovie.trailerUrl && (
            <button
              type="button"
              onClick={() => openTrailer(currentMovie)}
              aria-label={`Xem trailer ${currentMovie.title}`}
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            >
              <span className="h-12 w-12 rounded-full bg-black/55 border border-white/75 text-white backdrop-blur-md flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>

        {/* Overlapping Compact Editorial Card Body */}
        <div className="relative z-20 -mt-10 px-4 pb-5 space-y-4">
          <div className="flex items-end gap-3.5">
            {/* Mini Poster Crossfade Stack */}
            <div className="relative w-[88px] sm:w-[104px] aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/20 bg-[#111622] shadow-2xl shrink-0">
              {movies.map((m, idx) => {
                const active = idx === currentIdx;
                const pSrc =
                  m.posterUrl ||
                  m.bannerUrl ||
                  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600';
                return (
                  <img
                    key={`mob-poster-${m.id}`}
                    src={pSrc}
                    alt={active ? m.title : ''}
                    aria-hidden={!active}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${
                      active ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
                    }`}
                  />
                );
              })}
            </div>

            {/* Movie Title & Quick Specs */}
            <div className="flex-1 min-w-0 pb-0.5 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <AgeBadge rating={currentMovie.ageRating} size="sm" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/10 text-[11px] font-mono text-white/90">
                  <Clock className="w-3 h-3 text-[#FF575F]" aria-hidden="true" />
                  {currentMovie.duration}p
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/35 text-[10px] font-mono font-bold text-amber-300">
                  2D • IMAX
                </span>
              </div>

              <h1 className="font-display text-lg sm:text-2xl font-black uppercase text-white leading-tight line-clamp-2">
                {currentMovie.title}
              </h1>

              <p className="text-xs text-[#FF7A63] font-semibold truncate">
                {currentMovie.genres?.map((g) => g.genre.name).join(', ') || 'Phim chiếu rạp'}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
            {currentMovie.description}
          </p>

          {/* Clean Full-Width 2-Column Mobile Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to={`/movies/${currentMovie.id}`}
              className="btn-ncc-primary h-11 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Mua vé ngay</span>
            </Link>

            {currentMovie.trailerUrl ? (
              <button
                type="button"
                onClick={() => openTrailer(currentMovie)}
                className="btn-ncc-trailer h-11 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
                <span>Xem trailer</span>
              </button>
            ) : (
              <Link
                to={`/movies/${currentMovie.id}`}
                className="btn-ncc-outline h-11 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center"
              >
                Chi tiết phim
              </Link>
            )}
          </div>

          {/* Mobile Slide Indicator Dots & Compact Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Chọn slide phim">
              {movies.map((m, idx) => {
                const active = idx === currentIdx;
                return (
                  <button
                    key={`mob-dot-${m.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Slide ${idx + 1}: ${m.title}`}
                    onClick={() => goToSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      active ? 'w-7 bg-[#FF385C]' : 'w-2 bg-white/25'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToSlide(currentIdx - 1)}
                aria-label="Slide trước"
                className="h-8 w-8 rounded-lg border border-white/15 bg-white/[0.05] text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goToSlide(currentIdx + 1)}
                aria-label="Slide tiếp theo"
                className="h-8 w-8 rounded-lg border border-white/15 bg-white/[0.05] text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          DESKTOP HERO VIEW (lg+): Slow Luxurious Cinema Dissolve Stage
         ==================================================================== */}
      <div className="hidden lg:flex relative min-h-[640px] xl:min-h-[680px] flex-col justify-between">
        {/* Stacked Backdrop Images with Slow 1500ms Smooth Dissolve */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          {movies.map((m, idx) => {
            const active = idx === currentIdx;
            const src =
              m.bannerUrl ||
              m.posterUrl ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600';
            return (
              <img
                key={`desk-bg-${m.id}`}
                src={src}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[1600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-[opacity,transform] ${
                  active ? 'opacity-50 scale-100 z-[1]' : 'opacity-0 scale-[1.035] z-0'
                }`}
              />
            );
          })}
        </div>

        {/* Ambient Vignette Overlays */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 z-[1] w-[460px] h-[460px] rounded-full aurora-orb-crimson"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#080B11] via-[#080B11]/88 to-[#080B11]/35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#080B11] via-[#080B11]/25 to-[#080B11]/55"
        />

        {/* Main 2-Column Content */}
        <div className="relative z-20 mx-auto w-full max-w-[1440px] px-8 xl:px-14 pt-12 pb-6 flex-1 flex items-center">
          <div className="w-full grid grid-cols-12 gap-10 xl:gap-12 items-center">
            {/* LEFT 7 COLS: Stacked Crossfade Copy (No Abrupt Remounting!) */}
            <div className="col-span-7 grid">
              {movies.map((m, idx) => {
                const active = idx === currentIdx;
                const gLabel =
                  m.genres?.map((g) => g.genre.name).join(', ') || 'Phim chiếu rạp';
                const rDate = m.releaseDate
                  ? new Date(m.releaseDate).toLocaleDateString('vi-VN')
                  : 'Đang khởi chiếu';

                return (
                  <div
                    key={`desk-copy-${m.id}`}
                    aria-hidden={!active}
                    className={`col-start-1 row-start-1 space-y-5 transition-all duration-[1050ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active
                        ? 'opacity-100 translate-y-0 z-10 pointer-events-auto'
                        : 'opacity-0 translate-y-3 z-0 pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF385C]/20 border border-[#FF385C]/50 text-xs font-extrabold uppercase tracking-wider text-white">
                        <Film className="w-3.5 h-3.5 text-[#FF7A63]" aria-hidden="true" />
                        <span>
                          {m.status === 'COMING_SOON'
                            ? 'Phim sắp khởi chiếu'
                            : 'Phim tâm điểm tại rạp'}
                        </span>
                      </span>

                      <AgeBadge rating={m.ageRating} />

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-md text-xs font-mono font-semibold text-white/90">
                        <Clock className="w-3.5 h-3.5 text-[#FF575F]" aria-hidden="true" />
                        <span>{m.duration} phút</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-md text-xs font-mono text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                        <span>Khởi chiếu: {rDate}</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold uppercase tracking-wider text-[#FF7A63]">
                        Thể loại: {gLabel} • 2D / IMAX
                      </p>
                      <h1 className="font-display text-4xl xl:text-[50px] font-black uppercase leading-[1.08] tracking-tight text-white drop-shadow-2xl">
                        {m.title} - {m.ageRating || 'P'}
                      </h1>
                    </div>

                    <p className="text-sm xl:text-[15px] text-white/85 leading-relaxed line-clamp-3 max-w-2xl">
                      {m.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm text-white/80">
                      {m.director && (
                        <span>
                          <strong className="text-white font-semibold">Đạo diễn:</strong>{' '}
                          {m.director}
                        </span>
                      )}
                      {m.cast && (
                        <span className="line-clamp-1">
                          <strong className="text-white font-semibold">Diễn viên:</strong>{' '}
                          {m.cast}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md max-w-2xl space-y-2">
                      <p className="text-[13px] text-[#FF7A63] font-semibold">
                        Kiểm duyệt: {getCensorshipText(m.ageRating)}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                        <span className="text-white/75 font-medium">
                          Bạn đã xem bộ phim này? Đánh giá ngay:
                        </span>
                        <div
                          className="inline-flex items-center gap-1.5"
                          role="group"
                          aria-label="Đánh giá sao bộ phim"
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              tabIndex={active ? 0 : -1}
                              onClick={() => setUserStars(star)}
                              aria-label={`Đánh giá ${star} sao`}
                              className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= userStars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-white/25'
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          ))}
                          <span className="ml-1 px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/40 font-mono font-bold text-amber-300 text-[11px]">
                            {(4.6 + userStars * 0.08).toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <Link
                        to={`/movies/${m.id}`}
                        tabIndex={active ? 0 : -1}
                        className="btn-ncc-primary inline-flex items-center justify-center gap-2.5 rounded-full h-12 px-8 text-base font-bold"
                      >
                        <Ticket className="w-5 h-5" aria-hidden="true" />
                        <span>Mua vé ngay</span>
                      </Link>

                      {m.trailerUrl && (
                        <button
                          type="button"
                          tabIndex={active ? 0 : -1}
                          onClick={() => openTrailer(m)}
                          className="btn-ncc-trailer inline-flex items-center justify-center gap-2.5 rounded-full h-12 px-7 text-base font-bold cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                          <span>Xem trailer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT 5 COLS: Calm Framed Poster with Slow 1200ms Smooth Crossfade */}
            <div className="col-span-5 flex items-center justify-center">
              <div className="relative w-[265px] xl:w-[295px] aspect-[2/3] rounded-[26px] overflow-hidden border-2 border-white/15 bg-[#0E131D] shadow-[0_28px_72px_rgba(0,0,0,0.8)]">
                {movies.map((m, idx) => {
                  const active = idx === currentIdx;
                  const pSrc =
                    m.posterUrl ||
                    m.bannerUrl ||
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';
                  return (
                    <img
                      key={`desk-poster-${m.id}`}
                      src={pSrc}
                      alt={active ? `Poster ${m.title}` : ''}
                      aria-hidden={!active}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                        active
                          ? 'opacity-100 scale-100 z-[1]'
                          : 'opacity-0 scale-[1.04] z-0 pointer-events-none'
                      }`}
                    />
                  );
                })}

                <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#080B11]/80 via-transparent to-transparent" />

                {currentMovie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => openTrailer(currentMovie)}
                    aria-label={`Phát trailer ${currentMovie.title}`}
                    className="absolute inset-0 z-[3] flex items-center justify-center group cursor-pointer"
                  >
                    <span className="h-14 w-14 rounded-full bg-black/65 border-2 border-white/80 text-white backdrop-blur-md flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#FF385C] group-hover:border-[#FF385C]">
                      <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
                    </span>
                  </button>
                )}

                <div className="absolute bottom-3 inset-x-3 z-[4] px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white/90">
                    Phụ đề & Lồng tiếng
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    2D • IMAX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Thumbnail Switcher Dock */}
        <div className="relative z-30 mx-auto w-full max-w-[1440px] px-8 xl:px-14 pb-6 pt-2">
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#0E131D]/85 border border-white/10 backdrop-blur-2xl shadow-float">
            <div
              className="flex items-center gap-2.5 overflow-x-auto no-scrollbar"
              role="tablist"
              aria-label="Chọn phim nổi bật"
            >
              {movies.map((m, idx) => {
                const active = idx === currentIdx;
                const thumbSrc =
                  m.posterUrl ||
                  m.bannerUrl ||
                  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400';

                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Phim ${idx + 1}: ${m.title}`}
                    onClick={() => goToSlide(idx)}
                    className={`relative overflow-hidden flex items-center gap-2.5 pr-3.5 pl-1.5 py-1.5 rounded-xl border text-left transition-all duration-500 shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white/[0.1] border-[#FF385C]/65'
                        : 'bg-white/[0.03] border-white/10 opacity-70 hover:opacity-100 hover:border-white/25'
                    }`}
                  >
                    <img
                      src={thumbSrc}
                      alt=""
                      aria-hidden="true"
                      className="w-8 h-10 rounded-lg object-cover shrink-0 border border-white/15"
                    />
                    <div className="min-w-0 max-w-[140px]">
                      <p className="font-display font-bold text-xs text-white truncate">
                        {m.title}
                      </p>
                      <p className="text-[10px] font-mono text-white/60">
                        {m.duration} phút • {m.ageRating || 'P'}
                      </p>
                    </div>

                    {active && !isPaused && (
                      <span
                        key={`progress-${currentIdx}`}
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF385C] via-amber-400 to-[#FF385C] animate-hero-progress"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs text-white/50 mr-1">
                {String(currentIdx + 1).padStart(2, '0')} /{' '}
                {String(movies.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                aria-label={isPaused ? 'Tiếp tục chuyển slide' : 'Tạm dừng chuyển slide'}
                className="h-9 w-9 rounded-xl border border-white/15 bg-white/[0.05] text-white/85 hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
                ) : (
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => goToSlide(currentIdx - 1)}
                aria-label="Slide trước"
                className="h-9 w-9 rounded-xl border border-white/15 bg-white/[0.05] text-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => goToSlide(currentIdx + 1)}
                aria-label="Slide tiếp theo"
                className="h-9 w-9 rounded-xl border border-white/15 bg-white/[0.05] text-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
