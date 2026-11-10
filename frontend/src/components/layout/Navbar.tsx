import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Ticket, ShieldAlert, LogOut, Clapperboard, Compass, Calendar, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Trang Chủ', path: '/', icon: Compass },
    { label: 'Phim Chiếu', path: '/movies', icon: Clapperboard },
    { label: 'Lịch Chiếu', path: '/showtimes', icon: Calendar },
    { label: 'Cụm Rạp', path: '/theaters', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - CineCore */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-luminous group-hover:scale-105 transition-transform duration-300">
            <Clapperboard className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display text-2xl font-black tracking-tight text-slate-900">
                Cine<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500">Core</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 mb-2"></span>
            </div>
            <span className="block text-[10px] tracking-widest uppercase text-slate-600 font-bold -mt-1">
              Next-Gen Cinema
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-sm font-medium">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-indigo-600 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth / Action */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/booking/my-tickets"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold transition-colors border border-indigo-200/60 shadow-sm"
              >
                <Ticket className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Vé Của Tôi</span>
              </Link>

              {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200/60 transition-colors shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Admin CMS</span>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {(user.fullName || user.username).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-800 hidden lg:inline max-w-[120px] truncate">
                  {user.fullName || user.username}
                </span>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/auth/register"
                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 hover:opacity-95 transition-all shadow-luminous hover:-translate-y-0.5"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
