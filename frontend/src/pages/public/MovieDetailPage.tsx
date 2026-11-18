import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { Movie, Showtime } from '../../types';
import { DEFAULT_LANDING_DATA } from '../../constants/defaultLandingData';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUiStore } from '../../store/uiStore';
import { getCensorshipText } from '../../components/movies/HeroCarousel';
import { Play, ArrowLeft, Ticket, MapPin, X } from 'lucide-react';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const { openTrailer } = useUiStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<any, Movie>(`/movies/${id}`)
      .then((res) => {
        setMovie(res);
      })
      .catch(() => {
        const fallback = [
          ...DEFAULT_LANDING_DATA.heroMovies,
          ...DEFAULT_LANDING_DATA.nowShowing,
          ...DEFAULT_LANDING_DATA.comingSoon,
        ].find((m) => m.id === Number(id));
        if (fallback) setMovie(fallback);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Distinct dates from showtimes (or 5 upcoming dates if none)
  const showtimeDates = useMemo(() => {
    if (movie?.showtimes && movie.showtimes.length > 0) {
      const set = new Set<string>();
      movie.showtimes.forEach((st) => {
        const d = new Date(st.startTime).toISOString().split('T')[0];
        set.add(d);
      });
      return Array.from(set).sort();
    }
    const base = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [movie?.showtimes]);

  useEffect(() => {
    if (showtimeDates.length > 0 && !showtimeDates.includes(selectedDate)) {
      setSelectedDate(showtimeDates[0]);
    }
  }, [showtimeDates, selectedDate]);

  const groupedByTheater = useMemo(() => {
    if (!movie?.showtimes?.length) return [];
    const filtered = selectedDate
      ? movie.showtimes.filter(
          (st) => new Date(st.startTime).toISOString().split('T')[0] === selectedDate,
        )
      : movie.showtimes;

    const map = new Map<
      string,
      { theaterName: string; theaterAddress?: string; items: Showtime[] }
    >();

    filtered.forEach((st) => {
      const tName = st.room?.theater?.name || 'Trung Tâm Chiếu Phim CineCore';
      const existing = map.get(tName);
      if (existing) {
        existing.items.push(st);
      } else {
        map.set(tName, {
          theaterName: tName,
          theaterAddress: st.room?.theater?.address,
          items: [st],
        });
      }
    });

    return Array.from(map.values()).map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    }));
  }, [movie?.showtimes, selectedDate]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-56 aspect-[2/3] rounded-xl shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-9 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-1/2 rounded-lg" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-bold text-xl text-white">
          Không tìm thấy thông tin bộ phim
        </h2>
        <Link
          to="/movies"
          className="btn-ncc-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay về danh sách phim</span>
        </Link>
      </div>
    );
  }

  const posterSrc =
    movie.posterUrl ||
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';
  const bannerSrc = movie.bannerUrl || posterSrc;
  const genreStr =
    movie.genres?.map((g) => g.genre.name).join(', ') || 'Điện ảnh chiếu rạp';

  return (
    <div className="w-full bg-[#10141B]">
      {/* 1. Exact NCC Blurred Backdrop Feature Stage */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={bannerSrc}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center opacity-35 scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#10141B]/70 via-[#10141B]/80 to-[#10141B]" />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 xl:py-14">
          <div className="flex flex-col md:flex-row gap-7 xl:gap-10 items-start">
            {/* Left Rounded-XL Poster (238px on XL like NCC) */}
            <div className="w-[170px] sm:w-[210px] xl:w-[238px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/15 shrink-0 mx-auto md:mx-0">
              <img
                src={posterSrc}
                alt={`${movie.title} - ${movie.ageRating}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Movie Details */}
            <div className="flex-1 text-sm space-y-2.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-bold text-xl sm:text-2xl uppercase text-white leading-snug">
                  {movie.title} - {movie.ageRating || 'P'}
                </h1>
                <span className="rounded-xl px-2.5 py-1 border border-white text-xs font-bold text-white">
                  2D / IMAX
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90 pt-1">
                <p>{genreStr}</p>
                <p>{movie.duration} phút</p>
                <p>Đạo diễn: {movie.director || 'Đang cập nhật'}</p>
              </div>

              <p className="text-white/85">
                Diễn viên: {movie.cast || 'Đang cập nhật'}
              </p>
              <p className="text-white/85">
                Khởi chiếu:{' '}
                {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
              </p>

              <p className="pt-2 line-clamp-4 text-white/85 leading-relaxed">
                {movie.description}
              </p>

              {/* NCC Red Censorship Notice */}
              <div className="text-[#FF575F] font-medium pt-2">
                Kiểm duyệt: {getCensorshipText(movie.ageRating)}
              </div>

              {/* NCC Action Row: "Chi tiết nội dung →" + Amber Rounded-Full "Xem trailer" */}
              <div className="pt-3 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => setShowFullSynopsis(true)}
                  className="group inline-flex items-center gap-2 text-sm sm:text-base font-medium text-white/85 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="relative">
                    Chi tiết nội dung
                    <span className="absolute -bottom-0.5 left-0 h-px w-full bg-white/75 group-hover:bg-white" />
                  </span>
                  <span className="text-white/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                </button>

                {movie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => openTrailer(movie)}
                    className="btn-ncc-trailer inline-flex h-11 md:h-12 items-center justify-center gap-2 rounded-full px-7 md:px-9 text-sm md:text-base font-semibold cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Xem trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Exact NCC Full-Width #1A1D23 Date Strip (h-[91px], bg-red-600 active block) */}
      <section id="lich-chieu" className="w-full">
        <div
          role="tablist"
          aria-label="Chọn ngày xem phim"
          className="flex h-[90px] justify-start sm:justify-center bg-[#1A1D23] border-y border-white/10 overflow-x-auto no-scrollbar"
        >
          {showtimeDates.map((dStr, idx) => {
            const d = new Date(dStr);
            const active = selectedDate === dStr;
            const monthNum = d.getMonth() + 1;
            const dayNum = String(d.getDate()).padStart(2, '0');
            const weekday =
              idx === 0
                ? 'Hôm nay'
                : d.toLocaleDateString('vi-VN', { weekday: 'long' });

            return (
              <button
                key={dStr}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedDate(dStr)}
                className={`w-[84px] shrink-0 h-full flex flex-col items-center justify-center text-xs transition-colors cursor-pointer ${
                  active
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <p>Th. {monthNum}</p>
                <p className="text-xl font-bold font-mono my-0.5">{dayNum}</p>
                <p className="capitalize text-[11px]">{weekday}</p>
              </button>
            );
          })}
        </div>

        {/* 3. Centered Max-W-4XL Showtime Pill Buttons */}
        <div className="mx-auto w-full max-w-4xl py-8 px-4 space-y-6">
          <p className="text-center text-xs sm:text-sm text-amber-400 font-medium">
            Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h00 và dưới 16 tuổi kết thúc trước 23h00.
          </p>

          {groupedByTheater.length === 0 ? (
            <div className="rounded-2xl border border-gray-700 bg-[#141923] p-10 text-center space-y-3">
              <Ticket className="w-8 h-8 text-[#8B9BB4] mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">
                Hiện chưa có lịch chiếu cho ngày đã chọn.
              </p>
              <Link
                to="/showtimes"
                className="btn-ncc-primary inline-flex items-center gap-2 h-10 px-6 rounded-full text-xs font-semibold"
              >
                <span>Xem toàn bộ lịch chiếu hệ thống</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByTheater.map((group) => (
                <div
                  key={group.theaterName}
                  className="rounded-2xl border border-white/10 bg-[#141923] p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-white/10">
                    <h2 className="font-bold text-base text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF575F]" aria-hidden="true" />
                      <span>{group.theaterName}</span>
                    </h2>
                    {group.theaterAddress && (
                      <span className="text-xs text-[#8B9BB4]">
                        {group.theaterAddress}
                      </span>
                    )}
                  </div>

                  {/* NCC Rounded-Full Showtime Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {group.items.map((st) => (
                      <Link
                        key={st.id}
                        to={`/booking/select-seat/${st.id}`}
                        className="btn-ncc-outline h-11 px-4 rounded-full flex items-center justify-center gap-2"
                      >
                        <span className="font-mono font-bold text-sm text-white">
                          {new Date(st.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] font-semibold text-[#8B9BB4]">
                          {st.room?.screenType || '2D'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full Synopsis Dialog ("Chi tiết nội dung") */}
      {showFullSynopsis && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullSynopsis(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Nội dung phim ${movie.title}`}
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-lg rounded-2xl bg-[#1A1D23] border border-white/15 p-6 space-y-4 shadow-float"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base uppercase text-white">
                Chi tiết nội dung — {movie.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowFullSynopsis(false)}
                aria-label="Đóng"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              {movie.description}
            </p>
            <p className="text-xs text-[#FF575F] font-medium">
              Kiểm duyệt: {getCensorshipText(movie.ageRating)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
