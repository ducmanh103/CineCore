import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, ChevronLeft, ChevronRight, Star, Clock, Sparkles } from 'lucide-react';
import { Movie } from '../../types';

interface HeroCarouselProps {
  movies: Movie[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % movies.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies.length) return null;

  const currentMovie = movies[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-card-hover bg-slate-100">
      {/* Background Banner */}
      <img
        src={currentMovie.bannerUrl || currentMovie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600'}
        alt={currentMovie.title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 filter brightness-[0.88] saturate-[1.1]"
      />

      {/* Luminous Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

      {/* Hero Floating Content Card */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12 max-w-2xl">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-luminous flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>TÂM ĐIỂM RẠP CINECORE</span>
            </span>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>Độ tuổi {currentMovie.ageRating}</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentMovie.duration} Phút</span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {currentMovie.title}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/movies/${currentMovie.id}`}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-luminous hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>ĐẶT VÉ TRẢI NGHIỆM</span>
            </Link>

            {currentMovie.trailerUrl && (
              <a
                href={currentMovie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm transition-colors"
              >
                <Play className="w-4 h-4 fill-current text-rose-500" />
                <span>Xem Trailer</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Nav Controls */}
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2.5 z-10">
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all shadow-md border border-slate-200/80 hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all shadow-md border border-slate-200/80 hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
