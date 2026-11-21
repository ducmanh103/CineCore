import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { Showtime, Theater } from '../../types';
import { Link, useSearchParams } from 'react-router-dom';
import { DEFAULT_LANDING_DATA } from '../../constants/defaultLandingData';
import { ShowtimeCardSkeleton } from '../../components/ui/Skeleton';
import { getCensorshipText } from '../../components/movies/HeroCarousel';
import { X, Ticket } from 'lucide-react';

export const ShowtimesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Generate 7 upcoming days
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const urlDate = searchParams.get('date');
  const initialDate = urlDate && dates.includes(urlDate) ? urlDate : dates[0];

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>(
    searchParams.get('theaterId') || '',
  );
  const [selectedMovieId, setSelectedMovieId] = useState<string>(
    searchParams.get('movieId') || '',
  );
  const [screenFilter, setScreenFilter] = useState<string>('ALL');

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>(DEFAULT_LANDING_DATA.theaters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, Theater[]>('/theaters')
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setTheaters(res);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set('date', selectedDate);
    if (selectedTheaterId) q.set('theaterId', selectedTheaterId);
    if (selectedMovieId) q.set('movieId', selectedMovieId);

    api
      .get<any, Showtime[]>(`/showtimes?${q.toString()}`)
      .then((res) => setShowtimes(Array.isArray(res) ? res : []))
      .catch(() => setShowtimes([]))
      .finally(() => setLoading(false));
  }, [selectedDate, selectedTheaterId, selectedMovieId]);

  const syncQuery = (nextDate: string, nextTheater: string, nextMovie: string) => {
    const next = new URLSearchParams();
    if (nextDate) next.set('date', nextDate);
    if (nextTheater) next.set('theaterId', nextTheater);
    if (nextMovie) next.set('movieId', nextMovie);
    setSearchParams(next, { replace: true });
  };

  // Group showtimes by Movie for NCC 2-Column Horizontal Showtime Cards
  const movieCards = useMemo(() => {
    const filtered = showtimes.filter((st) => {
      if (screenFilter === 'ALL') return true;
      return (st.room?.screenType || '').toUpperCase().includes(screenFilter);
    });

    const map = new Map<
      number,
      {
        movie: NonNullable<Showtime['movie']>;
        slots: Showtime[];
      }
    >();

    filtered.forEach((st) => {
      if (!st.movie) return;
      const mId = st.movie.id;
      const existing = map.get(mId);
      if (existing) {
        existing.slots.push(st);
      } else {
        map.set(mId, { movie: st.movie, slots: [st] });
      }
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      slots: entry.slots.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    }));
  }, [showtimes, screenFilter]);

  const hasFilters =
    Boolean(selectedTheaterId) || Boolean(selectedMovieId) || screenFilter !== 'ALL';

  const resetFilters = () => {
    setSelectedTheaterId('');
    setSelectedMovieId('');
    setScreenFilter('ALL');
    syncQuery(selectedDate, '', '');
  };

  const formatDDMMYYYY = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="pt-6 xl:pt-10 pb-14 px-4 sm:px-6">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {/* 1. Centered NCC Red Dot + "Phim đang chiếu" Title */}
        <div className="flex items-center justify-center gap-2.5">
          <span
            aria-hidden="true"
            className="rounded-full bg-red-500 w-4 h-4 shadow-[0_0_12px_rgba(239,68,68,0.85)]"
          />
          <h1 className="font-bold text-xl sm:text-2xl text-white">
            Phim đang chiếu
          </h1>
        </div>

        {/* 2. Centered NCC Date Tabs (DD-MM-YYYY) */}
        <div
          role="tablist"
          aria-label="Chọn ngày chiếu"
          className="flex items-center justify-center gap-2 xl:gap-3 flex-wrap"
        >
          {dates.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedDate(dateStr);
                  syncQuery(dateStr, selectedTheaterId, selectedMovieId);
                }}
                className={`h-9 rounded-md px-3.5 text-sm font-mono font-medium cursor-pointer ${isSelected ? 'btn-ncc-primary font-semibold' : 'btn-ncc-outline'
                  }`}
              >
                {formatDDMMYYYY(dateStr)}
              </button>
            );
          })}
        </div>

        {/* Warning Notice (NCC Style) */}
        <p className="text-center text-xs sm:text-sm text-amber-400 font-medium">
          Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h00 và dưới 16 tuổi kết thúc trước 23h00.
        </p>

        {/* Compact Multi-Theater & Format Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <div className="relative">

            <select
              value={selectedTheaterId}
              aria-label="Chọn cụm rạp"
              onChange={(e) => {
                setSelectedTheaterId(e.target.value);
                syncQuery(selectedDate, e.target.value, selectedMovieId);
              }}
              className="h-9 pl-8 pr-4 rounded-md bg-[#1A1D23] border border-white/15 text-xs font-semibold text-white cursor-pointer"
            >
              <option value="">Tất cả cụm rạp CineCore</option>
              {theaters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          {(['ALL', '2D', '3D', 'IMAX'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setScreenFilter(fmt)}
              className={`h-9 px-3 rounded-md text-xs font-semibold cursor-pointer ${screenFilter === fmt ? 'btn-ncc-primary' : 'btn-ncc-outline'
                }`}
            >
              {fmt === 'ALL' ? 'Mọi định dạng' : fmt}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-3 rounded-md border border-red-500/40 bg-red-500/15 text-red-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>

        {/* 3. Exact NCC 2-Column Horizontal Showtime Movie Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ShowtimeCardSkeleton key={i} />
            ))}
          </div>
        ) : movieCards.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-[#141923] p-12 text-center space-y-4 max-w-2xl mx-auto">
            <Ticket className="w-9 h-9 text-[#8B9BB4] mx-auto" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="font-bold text-base text-white">
                Chưa có suất chiếu phù hợp trong ngày {formatDDMMYYYY(selectedDate)}
              </h2>
              <p className="text-xs sm:text-sm text-[#8B9BB4]">
                Quý khán giả vui lòng chọn ngày chiếu khác trên thanh lịch hoặc xóa bộ lọc định dạng.
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn-ncc-primary h-9 px-5 rounded-md text-xs font-semibold cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-6 pt-2">
            {movieCards.map(({ movie, slots }) => {
              const primaryFormat = slots[0]?.room?.screenType?.includes('IMAX')
                ? 'IMAX'
                : slots[0]?.room?.screenType?.includes('3D')
                  ? '3D'
                  : '2D';

              const fullMovieMeta = [
                ...DEFAULT_LANDING_DATA.nowShowing,
                ...DEFAULT_LANDING_DATA.comingSoon,
              ].find((m) => m.id === movie.id);

              const genreStr =
                movie.genres?.map((g) => g.genre.name).join(', ') ||
                fullMovieMeta?.genres?.map((g) => g.genre.name).join(', ') ||
                'Phim chiếu rạp';

              const releaseStr = (movie.releaseDate || fullMovieMeta?.releaseDate)
                ? new Date(
                  (movie.releaseDate || fullMovieMeta?.releaseDate)!,
                ).toLocaleDateString('vi-VN')
                : '2026';

              const rating = movie.ageRating || fullMovieMeta?.ageRating || 'P';

              return (
                <article
                  key={movie.id}
                  className="rounded-2xl w-full border border-white/12 hover:border-white/25 bg-[#121722] flex flex-col sm:flex-row overflow-hidden transition-colors"
                >
                  {/* Top/Left Poster */}
                  <div className="flex flex-row sm:contents">
                    <Link
                      to={`/movies/${movie.id}`}
                      className="relative w-[104px] sm:w-[170px] xl:w-[210px] min-h-[152px] sm:min-h-[260px] shrink-0 overflow-hidden"
                    >
                      <img
                        src={
                          movie.posterUrl ||
                          'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </Link>

                    {/* Mobile Compact Header Next to Poster */}
                    <div className="p-3.5 flex-1 min-w-0 sm:hidden flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#8B9BB4] truncate">
                            {genreStr}
                          </span>
                          <span className="shrink-0 border border-white/20 rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {primaryFormat}
                          </span>
                        </div>
                        <Link
                          to={`/movies/${movie.id}`}
                          className="block text-sm font-bold uppercase text-white line-clamp-2 leading-snug"
                        >
                          {movie.title} - {rating}
                        </Link>
                        {movie.duration && (
                          <p className="text-[11px] font-mono text-white/70">
                            {movie.duration} phút • {releaseStr}
                          </p>
                        )}
                      </div>
                      <p className="line-clamp-2 text-[11px] text-[#FF7A63] pt-1">
                        {getCensorshipText(rating)}
                      </p>
                    </div>
                  </div>

                  {/* Right Details & Showtime Buttons */}
                  <div className="px-3.5 pb-3.5 pt-2 sm:p-5 xl:p-6 flex-1 relative flex flex-col justify-between min-w-0 border-t border-white/10 sm:border-t-0">
                    <div className="hidden sm:block">
                      <div className="text-gray-200 absolute top-4 right-4 border border-gray-600 rounded-md px-2 py-0.5 text-xs font-semibold">
                        {primaryFormat}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#8B9BB4] text-xs sm:text-sm pr-12">
                        <p className="truncate">{genreStr}</p>
                        {movie.duration && <p>{movie.duration} phút</p>}
                      </div>

                      <Link
                        to={`/movies/${movie.id}`}
                        className="mt-2 block text-sm sm:text-base font-bold uppercase text-white hover:text-[#FF575F] transition-colors pr-10"
                      >
                        {movie.title} - {rating}
                      </Link>

                      <p className="mt-1 text-xs sm:text-sm text-white/85">
                        Đạo diễn: {movie.director || fullMovieMeta?.director || 'Đang cập nhật'}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm text-white/80">
                        Khởi chiếu: {releaseStr}
                      </p>

                      <p className="line-clamp-2 mt-1.5 text-xs sm:text-[13px] text-[#FF575F]">
                        {getCensorshipText(rating)}
                      </p>
                    </div>

                    {/* Showtime Buttons */}
                    <div className="sm:mt-3.5">
                      <p className="text-xs sm:text-sm font-semibold text-white mb-2">
                        Lịch chiếu
                      </p>
                      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                        {slots.slice(0, 8).map((st) => (
                          <Link
                            key={st.id}
                            to={`/booking/select-seat/${st.id}`}
                            title={`${st.room?.theater?.name || 'CineCore'} • ${st.room?.name || ''} • ${Number(st.price).toLocaleString('vi-VN')}đ`}
                            className="btn-ncc-outline h-9 rounded-lg px-2.5 sm:px-3.5 border-white/25 font-mono text-xs sm:text-sm font-semibold inline-flex items-center justify-center"
                          >
                            {new Date(st.startTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
