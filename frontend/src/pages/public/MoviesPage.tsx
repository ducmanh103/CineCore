import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { MovieCard } from '../../components/movies/MovieCard';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import { DEFAULT_LANDING_DATA } from '../../constants/defaultLandingData';
import { Movie } from '../../types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

type StatusFilter = 'ALL' | 'NOW_SHOWING' | 'COMING_SOON';
type SortOption = 'DEFAULT' | 'DURATION_DESC' | 'TITLE_ASC';

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'ALL';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatus === 'NOW_SHOWING' || initialStatus === 'COMING_SOON'
      ? initialStatus
      : 'ALL',
  );
  const [genreFilter, setGenreFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DEFAULT');

  useEffect(() => {
    const q = searchParams.get('search') || '';
    const st = searchParams.get('status') as StatusFilter;
    setSearchInput(q);
    if (st === 'NOW_SHOWING' || st === 'COMING_SOON') {
      setStatusFilter(st);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch) query.append('search', urlSearch);

    api
      .get<any, Movie[]>(`/movies?${query.toString()}`)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setMovies(res);
        } else if (!urlSearch) {
          setMovies([
            ...DEFAULT_LANDING_DATA.nowShowing,
            ...DEFAULT_LANDING_DATA.comingSoon,
          ]);
        } else {
          setMovies([]);
        }
      })
      .catch(() => {
        const combined = [
          ...DEFAULT_LANDING_DATA.nowShowing,
          ...DEFAULT_LANDING_DATA.comingSoon,
        ];
        if (urlSearch) {
          const lower = urlSearch.toLowerCase();
          setMovies(
            combined.filter(
              (m) =>
                m.title.toLowerCase().includes(lower) ||
                m.director?.toLowerCase().includes(lower) ||
                m.cast?.toLowerCase().includes(lower),
            ),
          );
        } else {
          setMovies(combined);
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setStatusFilter('ALL');
    setGenreFilter('ALL');
    setSortBy('DEFAULT');
    setSearchParams({});
  };

  const genres = useMemo(() => {
    const map = new Map<string, string>();
    movies.forEach((m) => {
      m.genres?.forEach((g) => map.set(g.genre.slug, g.genre.name));
    });
    return Array.from(map.entries());
  }, [movies]);

  const displayedMovies = useMemo(() => {
    let list = [...movies];

    const liveQ = searchInput.trim().toLowerCase();
    if (liveQ) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(liveQ) ||
          (m.director || '').toLowerCase().includes(liveQ) ||
          (m.cast || '').toLowerCase().includes(liveQ),
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((m) => m.status === statusFilter);
    }

    if (genreFilter !== 'ALL') {
      list = list.filter((m) =>
        m.genres?.some((g) => g.genre.slug === genreFilter),
      );
    }

    if (sortBy === 'DURATION_DESC') {
      list.sort((a, b) => b.duration - a.duration);
    } else if (sortBy === 'TITLE_ASC') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    }

    return list;
  }, [movies, searchInput, statusFilter, genreFilter, sortBy]);

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'ALL' ||
    genreFilter !== 'ALL' ||
    sortBy !== 'DEFAULT';

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 xl:py-10 space-y-8">
      {/* NCC Section Header + Live Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase text-white">
              Danh mục phim điện ảnh
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="flex items-center gap-2 w-full lg:w-96"
        >
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4] pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm tên phim, đạo diễn, diễn viên..."
              aria-label="Tìm kiếm phim"
              className="w-full h-10 pl-10 pr-4 rounded-full cinema-input text-xs sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="btn-ncc-primary h-10 px-5 rounded-full text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Status Tabs + Genre Chips */}
      <div className="holo-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { id: 'ALL', label: 'Tất cả phim' },
                { id: 'NOW_SHOWING', label: 'Phim đang chiếu' },
                { id: 'COMING_SOON', label: 'Phim sắp chiếu' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${statusFilter === st.id ? 'btn-ncc-primary' : 'btn-ncc-outline'
                  }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-[#8B9BB4]" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sắp xếp phim"
              className="h-9 px-3 rounded-xl cinema-input text-xs font-semibold text-white cursor-pointer"
            >
              <option value="DEFAULT">Sắp xếp: Mới nhất</option>
              <option value="DURATION_DESC">Thời lượng: Dài nhất</option>
              <option value="TITLE_ASC">Tên phim: A → Z</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-9 px-3 rounded-xl border border-red-500/40 bg-red-500/15 text-red-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {genres.length > 0 && (
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setGenreFilter('ALL')}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold cursor-pointer ${genreFilter === 'ALL' ? 'btn-ncc-primary' : 'btn-ncc-outline'
                }`}
            >
              Mọi thể loại
            </button>
            {genres.map(([slug, name]) => (
              <button
                key={slug}
                type="button"
                onClick={() => setGenreFilter(slug)}
                className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold cursor-pointer ${genreFilter === slug ? 'btn-ncc-primary' : 'btn-ncc-outline'
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Movie Grid (5 cols on 2XL / 4 cols on XL like NCC) */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedMovies.length === 0 ? (
        <div className="rounded-2xl border border-gray-700 bg-[#141923] p-12 text-center space-y-4">
          <p className="font-bold text-base text-white">
            Không tìm thấy bộ phim phù hợp
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="btn-ncc-primary h-10 px-6 rounded-full text-xs font-semibold cursor-pointer"
          >
            Hiển thị tất cả phim
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
          {displayedMovies.map((m, idx) => (
            <MovieCard
              key={m.id}
              movie={m}
              revealIndex={idx}
              badgeType={m.status === 'NOW_SHOWING' && idx < 2 ? 'HOT' : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};
