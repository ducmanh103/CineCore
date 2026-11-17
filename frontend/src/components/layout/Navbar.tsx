import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Clapperboard, Search, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/movies?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Trang Chủ', path: '/' },
    { label: 'Khám Phá', path: '/movies' },
    { label: 'Lịch Chiếu', path: '/showtimes' },
    { label: 'Vé Của Tôi', path: '/booking/my-tickets' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 lg:gap-8">

        {/* 1. Bên trái: Logo + Thanh Search liền kề (Bố cục như RoPhim) */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Logo CineCore */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Clapperboard className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-tight text-white leading-tight">
                Cine<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400">Core</span>
              </span>

            </div>
          </Link>

          {/* Ô tìm kiếm bo tròn ngay cạnh Logo */}
          <form onSubmit={handleSearch} className="relative hidden sm:block w-44 md:w-56 lg:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm phim, diễn viên..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 focus:border-rose-500 text-slate-100 placeholder-slate-400 text-xs focus:outline-none transition-all shadow-inner"
            />
          </form>
        </div>

        {/* 2. Ở giữa: Menu điều hướng - Di chuột đổi màu mượt mà */}
        <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8 text-sm font-semibold">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-2 transition-colors duration-200 cursor-pointer ${isActive
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-300 hover:text-rose-400'
                  }`}
              >
                <span>{item.label}</span>

              </Link>
            );
          })}
        </nav>

        {/* 3. Bên phải: Nút Thành viên bo tròn dạng Pill (như [👤 Thành viên] trong ảnh) */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30 transition-colors shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden lg:inline">Admin CMS</span>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {(user.fullName || user.username).charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[120px] truncate">
                  {user.fullName || user.username}
                </span>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-md hover:scale-105"
            >
              <User className="w-4 h-4 text-slate-800" />
              <span>Thành viên</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
