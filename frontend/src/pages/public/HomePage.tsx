import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { HeroCarousel } from '../../components/movies/HeroCarousel';
import { MovieCard } from '../../components/movies/MovieCard';
import { DEFAULT_LANDING_DATA } from '../../constants/defaultLandingData';
import { Showtime } from '../../types';
import {
  Ticket,
  Calendar,
  Film,
  Building2,
  Clock,
  BadgePercent,
  MapPin,
  ArrowRight,
  Phone,
  Armchair,
  Popcorn,
  Gift,
} from 'lucide-react';

const COMBO_DEALS = [
  {
    id: 'combo-solo',
    badge: 'TIẾT KIỆM 20%',
    name: 'Combo Solo Điện Ảnh',
    items: '01 Bắp Rang Bơ Lớn (Ngọt/Mặn) + 01 Nước Ngọt Cỡ Lớn 32oz',
    price: '79.000đ',
    oldPrice: '99.000đ',
    accent: 'from-amber-500/20 via-orange-500/5 to-transparent',
    borderAccent: 'border-amber-400/30',
    highlight: 'Phù hợp 1 người',
  },
  {
    id: 'combo-couple',
    badge: 'BÁN CHẠY NHẤT',
    name: 'Combo Couple Ngọt Ngào',
    items: '01 Bắp Caramel Phô Mai Lớn + 02 Nước Ngọt Cỡ Lớn 32oz',
    price: '109.000đ',
    oldPrice: '145.000đ',
    accent: 'from-[#FF385C]/20 via-rose-500/5 to-transparent',
    borderAccent: 'border-[#FF385C]/40',
    highlight: 'Dành cho 2 người',
  },
  {
    id: 'combo-family',
    badge: 'TIẾT KIỆM 30%',
    name: 'Combo VIP Gia Đình & Nhóm Bạn',
    items: '02 Bắp Lớn Mix 2 Vị + 04 Nước Ngọt 32oz + 01 Phần Snack Khoai Tây',
    price: '189.000đ',
    oldPrice: '270.000đ',
    accent: 'from-indigo-500/20 via-sky-500/5 to-transparent',
    borderAccent: 'border-indigo-400/30',
    highlight: 'Nhóm 3–4 người',
  },
];

const PROMO_CARDS = [
  {
    id: 'u22',
    tag: 'ƯU ĐÃI HỌC SINH • SINH VIÊN',
    headline: '55.000Đ',
    subHeadline: '/ VÉ 2D',
    title: 'Thẻ thành viên U22 đồng giá 55.000đ từ Thứ 2 đến Thứ 6',
    desc: 'Áp dụng cho khán giả từ 22 tuổi trở xuống khi đặt vé trực tuyến hoặc mua tại quầy.',
    gradient: 'from-[#9F1239] via-[#E11D48] to-[#FB7185]',
    link: '/ticket-price',
  },
  {
    id: 'vnpay',
    tag: 'THANH TOÁN QR 1 CHẠM',
    headline: '-20.000Đ',
    subHeadline: 'MỖI ĐƠN VÉ',
    title: 'Giảm ngay 20.000đ khi quét mã VNPay-QR trên ứng dụng ngân hàng',
    desc: 'Áp dụng cho hóa đơn đặt vé trực tuyến từ 150.000đ trên toàn hệ thống rạp.',
    gradient: 'from-[#1E3A8A] via-[#2563EB] to-[#38BDF8]',
    link: '/promotions',
  },
  {
    id: 'wednesday',
    tag: 'THỨ 4 VUI VẺ HÀNG TUẦN',
    headline: '50.000Đ',
    subHeadline: 'MỌI SUẤT 2D',
    title: 'Ngày hội điện ảnh Thứ Tư — Đồng giá vé ghế thường & ghế VIP',
    desc: 'Thưởng thức tất cả các bộ phim đang chiếu với mức giá ưu đãi đặc biệt mỗi Thứ Tư.',
    gradient: 'from-[#581C87] via-[#7C3AED] to-[#C084FC]',
    link: '/promotions',
  },
  {
    id: 'combo-online',
    tag: 'ĐẶT KÈM BẮP NƯỚC ONLINE',
    headline: '-30%',
    subHeadline: 'COMBO BẮP NƯỚC',
    title: 'Ưu đãi giảm tới 30% khi đặt trước Combo Bắp Nước cùng vé xem phim',
    desc: 'Nhận bắp rang mới nổ và nước mát tại quầy ưu tiên riêng mà không cần chờ đợi.',
    gradient: 'from-[#92400E] via-[#D97706] to-[#FBBF24]',
    link: '/promotions',
  },
];

export const HomePage: React.FC = () => {
  const [data, setData] = useState(DEFAULT_LANDING_DATA);
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [catalogMode, setCatalogMode] = useState<'NOW_SHOWING' | 'COMING_SOON'>(
    'NOW_SHOWING',
  );
  const [activeTheaterIdx, setActiveTheaterIdx] = useState(0);

  // 4-Step Realistic Quick Booking State (Phim -> Rạp -> Ngày -> Suất chiếu)
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>('');
  const upcomingDates = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0]);
  const [theaterShowtimes, setTheaterShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<any, any>('/movies/landing')
      .then((res) => {
        if (res && res.nowShowing && res.nowShowing.length > 0) {
          setData({
            ...res,
            heroMovies:
              Array.isArray(res.heroMovies) && res.heroMovies.length > 0
                ? res.heroMovies
                : res.nowShowing,
          });
          setSelectedMovieId(String(res.nowShowing[0].id));
        } else if (DEFAULT_LANDING_DATA.nowShowing.length > 0) {
          setSelectedMovieId(String(DEFAULT_LANDING_DATA.nowShowing[0].id));
        }
      })
      .catch(() => {
        if (DEFAULT_LANDING_DATA.nowShowing.length > 0) {
          setSelectedMovieId(String(DEFAULT_LANDING_DATA.nowShowing[0].id));
        }
      });
  }, []);

  useEffect(() => {
    setSelectedShowtimeId('');
    if (!selectedTheaterId || !selectedDate) {
      setTheaterShowtimes([]);
      return;
    }

    const q = new URLSearchParams();
    q.set('date', selectedDate);
    q.set('theaterId', selectedTheaterId);
    if (selectedMovieId) q.set('movieId', selectedMovieId);

    api
      .get<any, Showtime[]>(`/showtimes?${q.toString()}`)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setTheaterShowtimes(list);
        if (list.length > 0) {
          setSelectedShowtimeId(String(list[0].id));
        }
      })
      .catch(() => setTheaterShowtimes([]));
  }, [selectedMovieId, selectedTheaterId, selectedDate]);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShowtimeId) {
      navigate(`/booking/select-seat/${selectedShowtimeId}`);
      return;
    }
    if (selectedMovieId && !selectedTheaterId) {
      navigate(`/movies/${selectedMovieId}`);
      return;
    }
    const params = new URLSearchParams();
    if (selectedMovieId) params.set('movieId', selectedMovieId);
    if (selectedTheaterId) params.set('theaterId', selectedTheaterId);
    if (selectedDate) params.set('date', selectedDate);
    navigate(`/showtimes?${params.toString()}`);
  };

  const availableGenres = useMemo(() => {
    const map = new Map<string, string>();
    data.nowShowing.forEach((m) => {
      m.genres?.forEach((g) => map.set(g.genre.slug, g.genre.name));
    });
    return Array.from(map.entries());
  }, [data.nowShowing]);

  const filteredNowShowing = useMemo(() => {
    if (selectedGenre === 'ALL') return data.nowShowing;
    return data.nowShowing.filter((m) =>
      m.genres?.some((g) => g.genre.slug === selectedGenre),
    );
  }, [data.nowShowing, selectedGenre]);

  const spotlightTheater =
    data.theaters[activeTheaterIdx] || data.theaters[0];

  const activeMovies =
    catalogMode === 'NOW_SHOWING' ? filteredNowShowing : data.comingSoon;

  return (
    <div className="bg-[#080B11] relative overflow-hidden">
      {/* 1. Hero Banner Showcase */}
      <HeroCarousel movies={data.heroMovies} />

      {/* 2. Quick Ticket Booking Bar (Compact 2x2 Grid on Mobile, 5-Col Row on Desktop) */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 pt-5 sm:pt-8">
        <section
          aria-label="Đặt vé nhanh trực tuyến"
          className="holo-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3.5 sm:space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">

              <span>Đặt Vé Nhanh Trực Tuyến</span>
            </div>

          </div>

          <form
            onSubmit={handleQuickBook}
            className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5 items-end"
          >

            <div>
              <label
                htmlFor="quick-movie"
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#8B9BB4] mb-1"
              >
                <span>1. Chọn Phim</span>
              </label>
              <select
                id="quick-movie"
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                className="w-full h-10 sm:h-[42px] px-2.5 sm:px-3.5 rounded-xl cinema-input text-xs sm:text-sm font-semibold text-white cursor-pointer"
              >
                <option value="">Chọn bộ phim</option>
                {data.nowShowing.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.ageRating})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quick-theater"
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#8B9BB4] mb-1"
              >
                <span>2. Chọn Rạp</span>
              </label>
              <select
                id="quick-theater"
                value={selectedTheaterId}
                onChange={(e) => setSelectedTheaterId(e.target.value)}
                className="w-full h-10 sm:h-[42px] px-2.5 sm:px-3.5 rounded-xl cinema-input text-xs sm:text-sm font-semibold text-white cursor-pointer"
              >
                <option value="">Chọn rạp chiếu</option>
                {data.theaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Chọn Ngày */}
            <div>
              <label
                htmlFor="quick-date"
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#8B9BB4] mb-1"
              >
                <span>3. Chọn Ngày</span>
              </label>
              <select
                id="quick-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-10 sm:h-[42px] px-2.5 sm:px-3.5 rounded-xl cinema-input text-xs sm:text-sm font-semibold text-white cursor-pointer"
              >
                {upcomingDates.map((dStr, idx) => {
                  const formatted = new Date(dStr).toLocaleDateString('vi-VN');
                  return (
                    <option key={dStr} value={dStr}>
                      {idx === 0
                        ? `Hôm nay (${formatted})`
                        : idx === 1
                          ? `Ngày mai (${formatted})`
                          : formatted}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step 4: Chọn Suất */}
            <div>
              <label
                htmlFor="quick-slot"
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#8B9BB4] mb-1"
              >
                <span>4. Chọn Suất</span>
              </label>
              <select
                id="quick-slot"
                value={selectedShowtimeId}
                disabled={!selectedTheaterId}
                onChange={(e) => setSelectedShowtimeId(e.target.value)}
                className="w-full h-10 sm:h-[42px] px-2.5 sm:px-3.5 rounded-xl cinema-input text-xs sm:text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {!selectedTheaterId ? (
                  <option value="">Chọn rạp trước</option>
                ) : theaterShowtimes.length === 0 ? (
                  <option value="">Xem lịch chiếu</option>
                ) : (
                  theaterShowtimes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {new Date(st.startTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      — {st.room?.name || 'Phòng chiếu'}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Submit Button (Full-width on mobile) */}
            <button
              type="submit"
              className="col-span-2 lg:col-span-1 btn-ncc-primary h-11 sm:h-[42px] px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Ticket className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{selectedShowtimeId ? 'Chọn ghế ngay' : 'Xem lịch chiếu'}</span>
            </button>
          </form>
        </section>
      </div>

      {/* 3. Curated Movie Showcase (Per-Card Gradual Scroll Reveal) */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 pt-10 sm:pt-14 space-y-12 sm:space-y-14">
        <section aria-label="Phim đang chiếu" className="space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5">
            <div className="flex items-center justify-between sm:block">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-[#FF385C] shadow-[0_0_14px_#FF385C]"
                  />
                  <h2 className="text-lg sm:text-2xl xl:text-3xl font-black uppercase tracking-tight text-white">
                    {catalogMode === 'NOW_SHOWING' ? 'Phim đang chiếu' : 'Phim sắp chiếu'}
                  </h2>
                </div>

              </div>

              <Link
                to="/showtimes"
                className="sm:hidden inline-flex items-center gap-1 text-xs font-semibold text-[#FF7A63]"
              >
                <span>Tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto items-center p-1 rounded-full bg-[#0E131D] border border-white/10">
                <button
                  type="button"
                  onClick={() => setCatalogMode('NOW_SHOWING')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${catalogMode === 'NOW_SHOWING'
                    ? 'btn-ncc-primary'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Phim đang chiếu
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogMode('COMING_SOON')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${catalogMode === 'COMING_SOON'
                    ? 'btn-ncc-primary'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Phim sắp chiếu
                </button>
              </div>

              <Link
                to="/showtimes"
                className="hidden sm:inline-flex group items-center gap-2 text-sm font-semibold text-white/85 hover:text-[#FF575F] transition-colors whitespace-nowrap"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Genre Filter Pills */}
          {catalogMode === 'NOW_SHOWING' && availableGenres.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => setSelectedGenre('ALL')}
                className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${selectedGenre === 'ALL'
                  ? 'btn-ncc-primary'
                  : 'btn-ncc-outline text-white/80'
                  }`}
              >
                Tất cả thể loại
              </button>
              {availableGenres.map(([slug, name]) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelectedGenre(slug)}
                  className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${selectedGenre === slug
                    ? 'btn-ncc-primary'
                    : 'btn-ncc-outline text-white/80'
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Clean 2-col Mobile / 4-col Desktop Grid with Staggered Gradual Scroll Reveal */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {activeMovies.map((movie, idx) => (
              <MovieCard
                key={`${catalogMode}-${movie.id}`}
                movie={movie}
                revealIndex={idx}
                badgeType={
                  catalogMode === 'NOW_SHOWING'
                    ? idx === 0
                      ? 'SNEAKSHOW'
                      : idx < 3
                        ? 'HOT'
                        : null
                    : 'SNEAKSHOW'
                }
              />
            ))}
          </div>
        </section>

        <div aria-hidden="true" className="laser-line" />

        {/* Coming Soon Section */}
        <section aria-label="Phim sắp khởi chiếu" className="space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.85)]"
                />
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                  Phim sắp khởi chiếu
                </h2>
              </div>

            </div>

            <Link
              to="/movies?status=COMING_SOON"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/85 hover:text-amber-300 transition-colors whitespace-nowrap"
            >
              <span>Xem thêm</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {data.comingSoon.map((movie, idx) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                revealIndex={idx}
                badgeType="SNEAKSHOW"
              />
            ))}
          </div>
        </section>
      </div>

      {/* 4. Promotions Section (Horizontal Swipe Carousel on Mobile, 4-Col Grid on Desktop) */}
      <section
        aria-label="Khuyến mãi và Ưu đãi"
        className="mx-auto max-w-[1440px] px-4 md:px-6 pt-14 sm:pt-20 space-y-6 sm:space-y-8"
      >
        <div className="reveal-on-scroll flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-[#FF385C] shadow-[0_0_14px_#FF385C]"
              />
              <h2 className="text-lg sm:text-2xl xl:text-3xl font-black uppercase tracking-tight text-white">
                Khuyến mãi & Ưu đãi
              </h2>
            </div>

          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/ticket-price"
              className="hidden sm:inline text-sm font-bold text-amber-300 hover:underline"
            >
              Bảng giá vé chi tiết →
            </Link>
            <Link
              to="/promotions"
              className="btn-ncc-outline h-8 sm:h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="reveal-on-scroll flex overflow-x-auto snap-x snap-mandatory gap-3.5 -mx-4 px-4 pb-2 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:mx-0 md:px-0 md:pb-0">
          {PROMO_CARDS.map((promo) => (
            <Link
              key={promo.id}
              to={promo.link}
              className="group holo-card rounded-2xl overflow-hidden flex flex-col justify-between w-[82vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <div
                className={`relative h-36 sm:h-40 w-full bg-gradient-to-br ${promo.gradient} p-4 sm:p-5 flex flex-col justify-between overflow-hidden`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl"
                />
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/35 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white uppercase tracking-wider">
                    <BadgePercent className="w-3 h-3" aria-hidden="true" />
                    {promo.tag}
                  </span>
                </div>

                <div className="relative z-10">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {promo.headline}
                  </span>
                  <span className="ml-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white/90">
                    {promo.subHeadline}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-2.5">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#FF7A63] transition-colors">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-[#8B9BB4] leading-relaxed line-clamp-2">
                    {promo.desc}
                  </p>
                </div>
                <span className="text-xs font-semibold text-white/75 group-hover:text-white inline-flex items-center gap-1 pt-1">
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Featured Popcorn & Drink Combos (Horizontal Swipe on Mobile, 3-Col Grid on Desktop) */}
      <section
        aria-label="Combo Bắp Nước nổi bật"
        className="mx-auto max-w-[1440px] px-4 md:px-6 pt-14 sm:pt-20 space-y-6 sm:space-y-8"
      >
        <div className="reveal-on-scroll flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.85)]"
              />
              <h2 className="text-lg sm:text-2xl xl:text-3xl font-black uppercase tracking-tight text-white">
                Combo Bắp Nước Nổi Bật
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#8B9BB4]">
            Bắp rang caramel mới nổ mỗi ngày • Đặt kèm vé nhận ngay tại quầy ưu tiên
          </p>
        </div>

        <div className="reveal-on-scroll flex overflow-x-auto snap-x snap-mandatory gap-3.5 -mx-4 px-4 pb-2 no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:mx-0 md:px-0 md:pb-0">
          {COMBO_DEALS.map((combo) => (
            <div
              key={combo.id}
              className={`holo-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border ${combo.borderAccent} flex flex-col justify-between gap-5 w-[82vw] max-w-[310px] shrink-0 snap-start md:w-auto md:max-w-none`}
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${combo.accent}`}
              />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-[10px] sm:text-[11px] font-extrabold text-amber-300 uppercase">
                    <Gift className="w-3 h-3" aria-hidden="true" />
                    {combo.badge}
                  </span>
                  <span className="text-[11px] font-medium text-white/65">
                    {combo.highlight}
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0">
                    <Popcorn className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-white">
                      {combo.name}
                    </h3>
                    <p className="text-xs text-white/75 mt-1 leading-relaxed">
                      {combo.items}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-white/45 line-through font-mono block">
                    Giá lẻ: {combo.oldPrice}
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-black text-amber-300">
                    {combo.price}
                  </span>
                </div>

                <Link
                  to="/showtimes"
                  className="btn-ncc-outline h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Ticket className="w-3.5 h-3.5 text-[#FF575F]" aria-hidden="true" />
                  <span>Đặt kèm vé</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Real Cinema Auditoriums & 5 National Theaters Showcase */}
      <section
        aria-label="Không gian phòng chiếu và hệ thống rạp"
        className="mx-auto max-w-[1440px] px-4 md:px-6 pt-14 sm:pt-20 space-y-8 sm:space-y-10"
      >
        <div className="reveal-on-scroll text-center max-w-4xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF385C]/15 border border-[#FF385C]/40 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FF7A63]">
            Trải Nghiệm Rạp Chiếu Tiêu Chuẩn Quốc Tế
          </span>
          <h2 className="font-display text-xl sm:text-3xl xl:text-4xl font-black uppercase tracking-tight text-white">
            Không Gian Điện Ảnh & Phòng Chiếu Đẳng Cấp
          </h2>
          <p className="text-xs sm:text-sm text-[#8B9BB4] max-w-2xl mx-auto">
            Hệ thống phòng chiếu màn hình cong cực đại, ghế da ngả lưng êm ái và 5 cụm rạp tọa lạc tại trung tâm các thành phố lớn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Card 1: Real Auditorium Photo (5 Cols) */}
          <div className="reveal-on-scroll lg:col-span-5 holo-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between">
            <div className="aspect-[16/10] w-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200"
                alt="Không gian phòng chiếu và ghế ngồi cao cấp tại rạp CineCore"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/30 to-transparent p-4 sm:p-5 flex items-end">
                <span className="px-3 py-1 rounded-full bg-black/70 border border-white/20 text-[11px] sm:text-xs font-bold text-amber-300">
                  Phòng chiếu IMAX® Laser & Gold Class VIP
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-2.5 sm:space-y-3">
              <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">
                Ghế Da Công Thái Học & Màn Hình Tràn Viền
              </h3>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                Tất cả phòng chiếu được thiết kế độ dốc chuẩn giúp tầm nhìn không bị che khuất, trang bị ghế da êm ái rộng rãi cùng hàng ghế đôi Sweetbox dành riêng cho các cặp đôi.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-semibold text-white/90">
                  Màn hình cong IMAX
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-semibold text-amber-300">
                  Ghế VIP & Ghế đôi
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-semibold text-sky-300">
                  Âm thanh vòm đa chiều
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive 5 National Theaters Selector (7 Cols) */}
          <div className="reveal-on-scroll lg:col-span-7 holo-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between gap-5 sm:gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FF7A63]">
                  Hệ thống rạp trên toàn quốc
                </span>
                <h3 className="font-display text-lg sm:text-2xl font-extrabold text-white mt-0.5">
                  5 Cụm Rạp Trung Tâm CineCore
                </h3>
              </div>

              {/* Single-row Horizontal Scrollable City Tabs on Mobile */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {data.theaters.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTheaterIdx(idx)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${activeTheaterIdx === idx
                      ? 'btn-ncc-primary'
                      : 'bg-white/[0.06] text-white/75 hover:text-white border border-white/10'
                      }`}
                  >
                    {t.city}
                  </button>
                ))}
              </div>
            </div>

            {spotlightTheater && (
              <div className="p-4 sm:p-6 rounded-2xl bg-[#070A10]/90 border border-white/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FF385C]/20 border border-[#FF385C]/40 text-xs font-bold text-[#FF7A63]">
                      {spotlightTheater.city}
                    </span>
                    <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>5 Phòng chiếu • 240 ghế</span>
                    </span>
                  </div>
                  <h4 className="font-display text-base sm:text-xl font-black text-white">
                    {spotlightTheater.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/80 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#FF575F] shrink-0 mt-0.5" />
                    <span>{spotlightTheater.address}</span>
                  </p>
                  {spotlightTheater.phone && (
                    <p className="text-xs sm:text-sm text-white/75 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>Hotline: {spotlightTheater.phone}</span>
                    </p>
                  )}
                </div>

                <Link
                  to={`/showtimes?theaterId=${spotlightTheater.id}`}
                  className="btn-ncc-primary w-full sm:w-auto h-11 px-5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Xem lịch chiếu rạp này</span>
                </Link>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8B9BB4]">
              <span>Mở cửa từ 08:00 đến 24:00 tất cả các ngày trong tuần</span>
              <Link
                to="/theaters"
                className="font-bold text-white hover:text-[#FF575F] inline-flex items-center gap-1"
              >
                <span>Xem thông tin tất cả cụm rạp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};
