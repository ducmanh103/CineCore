import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { MovieCard } from '../../components/movies/MovieCard';
import { Movie } from '../../types';
import { Search, Filter, Clapperboard } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);

    api
      .get<any, Movie[]>(`/movies?${query.toString()}`)
      .then((res) => setMovies(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Filters */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Clapperboard className="w-4 h-4" />
            <span>Kho Phim Chiếu Rạp CineCore</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Khám Phá Phim Chiếu Rạp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật liên tục các siêu phẩm điện ảnh Việt Nam và quốc tế mới nhất
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm phim, đạo diễn..."
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white w-52 sm:w-64 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Đang tải danh sách phim CineCore...</div>
      ) : movies.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm">
          Không tìm thấy phim phù hợp với từ khóa tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
};
