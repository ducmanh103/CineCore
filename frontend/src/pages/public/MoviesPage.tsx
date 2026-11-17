import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { MovieCard } from '../../components/movies/MovieCard';
import { Movie } from '../../types';
import { Film, ArrowLeft } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);

    api
      .get<any, Movie[]>(`/movies?${query.toString()}`)
      .then((res) => setMovies(res || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {search && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-600" />
              <span>Kết quả tìm kiếm cho: "{search}"</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Tìm thấy {movies.length} kết quả</p>
          </div>
          <Link
            to="/movies"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xem tất cả phim</span>
          </Link>
        </div>
      )}

      {/* Grid danh sách phim */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Đang tải danh sách phim CineCore...</div>
      ) : movies.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm">
          {search ? `Không tìm thấy phim phù hợp với từ khóa "${search}".` : 'Hiện chưa có phim nào trong danh sách.'}
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
