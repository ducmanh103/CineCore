import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { HeroCarousel } from '../../components/movies/HeroCarousel';
import { MovieCard } from '../../components/movies/MovieCard';
import { DEFAULT_LANDING_DATA } from '../../constants/defaultLandingData';
import {
  Flame,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  MonitorPlay,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [data, setData] = useState(DEFAULT_LANDING_DATA);
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<any, any>('/movies/landing')
      .then((res) => {
        if (res && res.nowShowing && res.nowShowing.length > 0) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn('API landing data is currently offline. Using preloaded CineCore catalogue.', err);
      });
  }, []);

  const handleQuickBook = () => {
    if (selectedMovieId) {
      navigate(`/movies/${selectedMovieId}`);
    } else {
      navigate('/showtimes');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* 1. Hero Showcase Carousel */}
      <section>
        <HeroCarousel movies={data.heroMovies} />
      </section>

      {/* 2. Interactive Quick Booking Bar */}
      <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
        <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-wider text-indigo-600">
          <Ticket className="w-4 h-4" />
          <span>Đặt Vé Nhanh Tại CineCore</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">1. Chọn Phim</label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="">-- Tất cả phim đang chiếu --</option>
              {data.nowShowing.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.ageRating})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">2. Chọn Cụm Rạp</label>
            <select
              value={selectedTheaterId}
              onChange={(e) => setSelectedTheaterId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="">-- Tất cả các cụm rạp --</option>
              {data.theaters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:self-end">
            <button
              onClick={handleQuickBook}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-luminous hover:opacity-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <span>Tìm Suất Chiếu Phù Hợp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Movies Catalog Tabs */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit">
            <button
              onClick={() => setActiveTab('NOW_SHOWING')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'NOW_SHOWING'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Phim Đang Chiếu Hot</span>
            </button>

            <button
              onClick={() => setActiveTab('COMING_SOON')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'COMING_SOON'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Phim Sắp Khởi Chiếu</span>
            </button>
          </div>

          <Link
            to="/movies"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5"
          >
            <span>Khám phá toàn bộ phim</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Movie Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {(activeTab === 'NOW_SHOWING' ? data.nowShowing : data.comingSoon).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 4. Why Choose CineCore Features */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-rose-50/50 border border-indigo-100 shadow-card">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
            Trải Nghiệm Điện Ảnh Thế Hệ Mới
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Tại Sao Hơn 100.000 Khách Hàng Chọn CineCore?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Zero Overbooking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khóa ghế phân tán nguyên tử bằng Redis 7. Chống hoàn toàn tình trạng đặt trùng ghế chỉ trong 1 mili-giây.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">IMAX Laser & Dolby</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Màn hình cong IMAX góc nhìn cực đại cùng âm thanh vòm Dolby Atmos tái hiện chân thực từng khung hình điện ảnh.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Bảo Mật Dữ Liệu PDPD</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mã hóa dữ liệu cá nhân AES-256-GCM tuân thủ chặt chẽ Nghị định 13/2023/NĐ-CP và bảo vệ danh tính tối đa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">CineCore AI Concierge</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trợ lý ảo AI thông minh hiểu tiếng Việt, gợi ý suất chiếu và quản lý vé đặt tức thời 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Cụm Rạp Chiếu CineCore */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-slate-900">5 Cụm Rạp Hiện Đại Toàn Quốc</h2>
            <p className="text-xs text-slate-500 mt-1">
              Trải nghiệm phòng chiếu đẳng cấp tại TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ và Huế
            </p>
          </div>
          <Link to="/theaters" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            Xem bản đồ rạp &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.theaters.map((theater, idx) => (
            <div
              key={theater.id}
              className={`p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-indigo-200 transition-all ${
                idx === 0 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                <MapPin className="w-4 h-4" />
                <span>{theater.city}</span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-slate-900 mt-2">{theater.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{theater.address}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700">
                  5 Phòng Chiếu
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                  IMAX Laser 4K
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] font-bold text-rose-700 border border-rose-100">
                  Gold Class VIP
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
