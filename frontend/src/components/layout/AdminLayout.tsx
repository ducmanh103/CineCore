import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Calendar,
  BarChart3,
  Users,
  ArrowUpRight,
  Clapperboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/uiStore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const allNavItems = [
    { label: 'Tổng quan rạp', path: '/admin', icon: LayoutDashboard, adminOnly: false },
    { label: 'Quản lý phim', path: '/admin/movies', icon: Film, adminOnly: false },
    { label: 'Quản lý lịch chiếu', path: '/admin/showtimes', icon: Calendar, adminOnly: false },
    { label: 'Báo cáo doanh thu', path: '/admin/revenue', icon: BarChart3, adminOnly: false },
    { label: 'Quản lý tài khoản', path: '/admin/users', icon: Users, adminOnly: true },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN',
  );

  const currentPageLabel =
    navItems.find((i) => i.path === location.pathname)?.label || 'Quản lý hệ thống';

  const handleLogout = async () => {
    await logout();
    toast.info('Đã đăng xuất khỏi trang quản lý');
    navigate('/auth/login');
  };

  const roleDisplayName = user?.role === 'ADMIN' ? 'Ban quản trị' : 'Nhân viên rạp';

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full p-5 bg-[#0B0D13]">
      <div className="space-y-7">
        <div className="flex items-center justify-between px-1">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl btn-ncc-primary flex items-center justify-center text-white">
              <Clapperboard className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display font-black text-base text-white leading-none">
                CINE<span className="text-[#FF575F]">CORE</span>
              </h2>
              <span className="inline-block text-[11px] text-[#8B9BB4] font-semibold mt-1">
                {roleDisplayName}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng thanh bên"
            className="lg:hidden p-1.5 rounded-xl text-white/60 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Điều hướng quản trị" className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#8B9BB4] block mb-2">
            Danh mục quản lý
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'btn-ncc-primary text-white'
                    : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8B9BB4]'}`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/10">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white/90 hover:text-white border border-white/10 transition-colors"
        >
          <span>Về trang đặt vé</span>
          <ArrowUpRight className="w-4 h-4 text-[#FF575F]" aria-hidden="true" />
        </Link>

        {user && (
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full btn-ncc-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user.fullName || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-[11px] text-[#8B9BB4] truncate">
                  {roleDisplayName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="p-2 rounded-xl text-white/60 hover:text-[#FF575F] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#10141B] text-white flex">
      <aside className="hidden lg:block w-68 shrink-0 bg-[#0B0D13] border-r border-white/[0.08] sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-72 h-full bg-[#0B0D13] border-r border-white/10 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 glass-header px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu quản lý"
              className="lg:hidden p-2 rounded-xl bg-white/[0.07] border border-white/10 text-white cursor-pointer"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-[#8B9BB4] font-medium hidden sm:inline">
                Quản lý rạp chiếu
              </span>
              <span className="text-white/30 hidden sm:inline">/</span>
              <span className="font-bold text-white">
                {currentPageLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống bán vé đang hoạt động</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <div key={location.pathname} className="max-w-6xl mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
