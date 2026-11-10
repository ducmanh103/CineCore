import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Ticket, Sparkles } from 'lucide-react';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/70 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* Poster Image Container */}
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-slate-100 p-2.5">
        <div className="w-full h-full rounded-2xl overflow-hidden relative">
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Rating Badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200/80 text-[11px] font-extrabold text-amber-600 flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-current text-amber-500" />
            <span>{movie.ageRating}</span>
          </div>

          {/* Duration Badge */}
          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>{movie.duration}p</span>
          </div>

          {/* Quick Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <Link
              to={`/movies/${movie.id}`}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-luminous hover:opacity-95 transition-opacity"
            >
              <Ticket className="w-4 h-4" />
              <span>ĐẶT VÉ NGAY</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/movies/${movie.id}`}
            className="font-display font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {movie.title}
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
            {movie.genres?.map((g) => g.genre.name).join(' • ') || 'Chiếu Rạp'}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            Đang chiếu
          </span>
          <span className="font-bold text-indigo-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Chi tiết &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
