import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Calendar,
  DollarSign,
  Users,
  ArrowLeft,
  Clapperboard,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = [
    { label: 'Tổng Quan (Dashboard)', path: '/admin', icon: LayoutDashboard },
    { label: 'Quản Lý Phim', path: '/admin/movies', icon: Film },
    { label: 'Quản Lý Suất Chiếu', path: '/admin/showtimes', icon: Calendar },
    { label: 'Báo Cáo Doanh Thu', path: '/admin/revenue', icon: DollarSign },
    { label: 'Quản Lý Người Dùng', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Clapperboard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-900 leading-none">
                Cine<span className="text-indigo-600">Core</span>
              </h2>
              <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider block mt-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {user?.role} Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Xem Phim</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
