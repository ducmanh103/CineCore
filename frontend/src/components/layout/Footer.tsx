import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, CheckCircle2, Globe, Youtube, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const footerLinks = [
    { label: 'Chính sách', path: '/ticket-price' },
    { label: 'Lịch chiếu', path: '/showtimes' },
    { label: 'Tin tức & Khuyến mãi', path: '/promotions' },
    { label: 'Giá vé', path: '/ticket-price' },
    { label: 'Hệ thống rạp', path: '/theaters' },
    { label: 'Vé của tôi', path: '/booking/my-tickets' },
    { label: 'Thành viên', path: '/auth/login' },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden bg-[#05070B] text-white border-t border-white/[0.06]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(5,7,11,0)_22%,rgba(5,7,11,0.96)_100%)]"
      />

      <div className="relative z-20 mx-auto max-w-[1440px] px-4 py-10 sm:px-8 sm:py-12">
        {/* 1. Centered Horizontal Menu Row */}
        <ul className="flex items-center justify-center flex-wrap gap-x-6 gap-y-3 sm:gap-x-10 mb-8 text-sm md:text-[15px]">
          {footerLinks.map((item, idx) => (
            <li key={`${item.path}-${idx}`}>
              <Link
                to={item.path}
                className="group relative inline-flex items-center py-1 text-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:text-white"
              >
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 2. Social Channels + Store Badges */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3.5">
            <a
              href="#facebook"
              onClick={(e) => e.preventDefault()}
              aria-label="Fanpage Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#60A5FA] transition-transform duration-300 hover:-translate-y-1"
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="#zalo"
              onClick={(e) => e.preventDefault()}
              aria-label="Zalo Official Account"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 transition-transform duration-300 hover:-translate-y-1"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="#youtube"
              onClick={(e) => e.preventDefault()}
              aria-label="Kênh YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 border border-red-400/40 text-red-400 transition-transform duration-300 hover:-translate-y-1"
            >
              <Youtube className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/showtimes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-white/90 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Smartphone className="w-4 h-4 text-[#FF575F]" aria-hidden="true" />
              <span>Tải trên Google Play</span>
            </Link>
            <Link
              to="/showtimes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-white/90 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Smartphone className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>Tải trên App Store</span>
            </Link>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-400/30 text-xs font-semibold text-sky-300">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Đã thông báo Bộ Công Thương</span>
            </span>
          </div>
        </div>

        {/* 3. Centered Cinema Information Block */}
        <div className="text-center space-y-2 text-xs sm:text-sm md:text-[15px] text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">
          <p className="font-semibold text-white">
            CÔNG TY CỔ PHẦN ĐIỆN ẢNH & GIẢI TRÍ CINECORE VIỆT NAM
          </p>
          <p>
            Hệ thống rạp chiếu phim tiêu chuẩn quốc tế tại Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Cần Thơ và Huế.
          </p>
          <p>
            Địa chỉ: Số 87 Láng Hạ, Quận Ba Đình, TP. Hà Nội — Điện thoại hỗ trợ & đặt vé tập thể:{' '}
            <strong className="text-white">024.3514.1791 / 1900 8888</strong> (08:00 – 23:00)
          </p>
        </div>

        <div className="text-center text-xs sm:text-sm text-white/60">
          © {new Date().getFullYear()} Công ty Cổ phần Điện ảnh & Giải trí CineCore Việt Nam. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
};
