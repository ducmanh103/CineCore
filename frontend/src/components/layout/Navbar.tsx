import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Clapperboard,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/uiStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (y / docHeight) * 100)));
      } else {
        setScrollProgress(0);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.info(
      'Đã đăng xuất tài khoản',
      'Hẹn gặp lại quý khách tại rạp chiếu phim CineCore!',
    );
    navigate('/');
  };

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Lịch chiếu', path: '/showtimes' },
    { label: 'Phim', path: '/movies' },
    { label: 'Vé của tôi', path: '/booking/my-tickets' },
    { label: 'Khuyến mãi', path: '/promotions' },
  ];

  const isPathActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full text-white transition-all duration-300 ${scrolled
        ? 'glass-header shadow-[0_12px_32px_rgba(0,0,0,0.6)]'
        : 'bg-[#080B11]/90 backdrop-blur-2xl border-b border-white/[0.06]'
        }`}
    >
      {/* Top Scroll Progress Bar */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.04] overflow-hidden"
      >
        <div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-gradient-to-r from-[#FF385C] via-amber-400 to-[#FF7A63] transition-[width] duration-100 ease-out"
        />
      </div>

      <div className="mx-auto max-w-[1440px]">
        <div className="flex h-[60px] xl:h-20 items-center justify-between gap-3 px-4 xl:px-6">
          {/* 1. Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 xl:w-11 xl:h-11 rounded-xl xl:rounded-2xl btn-ncc-primary flex items-center justify-center shrink-0">
              <Clapperboard
                className="w-4 h-4 xl:w-5 xl:h-5 text-white stroke-[2.2]"
                aria-hidden="true"
              />
            </div>
            <div className="leading-tight whitespace-nowrap">
              <span className="block font-display text-sm sm:text-base xl:text-lg font-black tracking-tight text-white">
                CINE<span className="text-[#FF385C]">CORE</span>
              </span>
              <span className="hidden sm:block text-[10px] xl:text-[11px] font-medium text-white/60">
                Hệ thống Rạp chiếu phim
              </span>
            </div>
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="hidden xl:flex items-center justify-center shrink-0"
          >
            <div className="flex items-center">
              {navLinks.map((item, index) => {
                const active = isPathActive(item.path);
                return (
                  <React.Fragment key={item.path}>
                    <Link
                      to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={`relative px-4 xl:px-5 py-2 text-sm font-semibold transition-colors duration-200 whitespace-nowrap group ${active
                        ? 'text-[#FF385C] font-bold'
                        : 'text-white/80 hover:text-[#FF385C]'
                        }`}
                    >
                      <span>{item.label}</span>


                    </Link>
                  </React.Fragment>
                );
              })}
            </div>
          </nav>

          {/* 3. Right Account Controls */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold border border-white/15 transition-colors whitespace-nowrap shrink-0"
                    >
                      <LayoutDashboard
                        className="w-3.5 h-3.5 text-[#FF575F] shrink-0"
                        aria-hidden="true"
                      />
                      <span>Quản lý</span>
                    </Link>
                  )}

                  <div className="flex items-center gap-2 pl-1.5 pr-1.5 py-1 rounded-full bg-[#121722] border border-white/15 shrink-0">
                    <div className="w-7 h-7 rounded-full btn-ncc-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(user.fullName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-white hidden md:inline max-w-[120px] truncate whitespace-nowrap">
                      {user.fullName || user.username}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Đăng xuất"
                      aria-label="Đăng xuất tài khoản"
                      className="p-1.5 rounded-full text-white/60 hover:text-[#FF575F] hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Compact Avatar on Small Mobile Header */}
                <Link
                  to="/booking/my-tickets"
                  aria-label="Vé của tôi"
                  className="sm:hidden w-9 h-9 rounded-full btn-ncc-primary text-white font-bold text-xs flex items-center justify-center shrink-0"
                >
                  {(user.fullName || user.username).charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                  <Link
                    to="/auth/register"
                    className="btn-ncc-outline h-10 px-5 rounded-full text-sm font-medium inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Đăng ký
                  </Link>
                  <Link
                    to="/auth/login"
                    className="btn-ncc-primary h-10 px-5 rounded-full text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Đăng nhập
                  </Link>
                </div>

                {/* Compact Login Pill on Small Mobile Header */}
                <Link
                  to="/auth/login"
                  className="sm:hidden btn-ncc-primary h-9 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Đăng nhập</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              className="xl:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Spacious Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#080B11]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-float animate-fade-up">
          <nav aria-label="Menu di động" className="space-y-1">
            {navLinks.map((item) => {
              const active = isPathActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-semibold transition-colors ${active
                    ? 'bg-[#FF385C]/15 text-[#FF7A63] border border-[#FF385C]/35'
                    : 'text-white/85 hover:bg-white/[0.06] hover:text-white'
                    }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/10">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full btn-ncc-primary text-white font-bold text-xs flex items-center justify-center">
                      {(user.fullName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-[#8B9BB4]">Hội viên CineCore</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-500/15 text-red-300 text-xs font-semibold cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>

                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <Link
                    to="/admin"
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-bold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#FF575F]" aria-hidden="true" />
                    <span>Vào trang quản lý rạp</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/auth/register"
                  className="btn-ncc-outline h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/auth/login"
                  className="btn-ncc-primary h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
