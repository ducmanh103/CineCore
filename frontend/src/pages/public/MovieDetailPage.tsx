import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { Movie, Showtime } from '../../types';
import { Clock, Star, Calendar, MapPin, Ticket, Play, ArrowLeft, Clapperboard } from 'lucide-react';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<any, Movie>(`/movies/${id}`)
      .then((res) => setMovie(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !movie) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-sm">
        Đang tải thông tin chi tiết phim...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách</span>
      </button>

      {/* Top Banner / Movie Info Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-card p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Poster */}
        <div className="w-52 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-xl border border-slate-200">
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Content */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>Phân loại {movie.ageRating}</span>
            </span>

            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{movie.duration} phút</span>
            </span>

            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            {movie.title}
          </h1>

          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
            Thể loại: {movie.genres?.map((g) => g.genre.name).join(' • ') || 'Chiếu rạp'}
          </p>

          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl font-medium">
            {movie.description}
          </p>

          <div className="pt-2 text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
            <p><span className="font-bold text-slate-900">Đạo diễn:</span> {movie.director || 'Đang cập nhật'}</p>
            <p><span className="font-bold text-slate-900">Diễn viên chính:</span> {movie.cast || 'Đang cập nhật'}</p>
          </div>

          {movie.trailerUrl && (
            <div className="pt-3">
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
              >
                <Play className="w-4 h-4 fill-current text-rose-500" />
                <span>Xem Trailer Chính Thức</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-indigo-600" />
            <span>Lịch Chiếu & Đặt Vé Nhanh</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Chọn suất chiếu bên dưới để chọn ghế
          </span>
        </div>

        {!movie.showtimes || movie.showtimes.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm">
            Hiện chưa có lịch chiếu mới cho phim này. Vui lòng quay lại sau!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {movie.showtimes.map((st) => (
              <div
                key={st.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {st.room?.theater?.name || 'CineCore'}
                    </span>
                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {st.room?.name}
                    </span>
                  </div>

                  <div className="text-2xl font-display font-black text-slate-900 mt-2">
                    {new Date(st.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Ngày chiếu: {new Date(st.startTime).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm font-extrabold text-amber-600">
                    {Number(st.price).toLocaleString('vi-VN')} đ
                  </span>
                  <Link
                    to={`/booking/select-seat/${st.id}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-luminous hover:opacity-95 transition-opacity"
                  >
                    Chọn Ghế
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
