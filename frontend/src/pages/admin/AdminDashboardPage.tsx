import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Film,
  Calendar,
  Ticket,
  DollarSign,
  Plus,
  BarChart3,
  Search,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    totalMovies: number;
    todayShowtimes: number;
    totalTickets: number;
    totalRevenue: number;
    recentTickets: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuery, setTicketQuery] = useState('');

  useEffect(() => {
    api
      .get<any, any>('/admin/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRecent = useMemo(() => {
    if (!data?.recentTickets) return [];
    const q = ticketQuery.trim().toLowerCase();
    if (!q) return data.recentTickets;
    return data.recentTickets.filter(
      (t) =>
        t.bookingCode?.toLowerCase().includes(q) ||
        t.user?.fullName?.toLowerCase().includes(q) ||
        t.user?.username?.toLowerCase().includes(q) ||
        t.showtime?.movie?.title?.toLowerCase().includes(q),
    );
  }, [data?.recentTickets, ticketQuery]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Tổng Phim Hệ Thống',
      value: data.totalMovies.toLocaleString('vi-VN'),
      sub: 'Danh mục đang khai thác',
      icon: Film,
      accent: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
      link: '/admin/movies',
    },
    {
      label: 'Suất Chiếu Hôm Nay',
      value: data.todayShowtimes.toLocaleString('vi-VN'),
      sub: 'Trên 5 cụm rạp toàn quốc',
      icon: Calendar,
      accent: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      link: '/admin/showtimes',
    },
    {
      label: 'Tổng Vé Đã Xuất',
      value: data.totalTickets.toLocaleString('vi-VN'),
      sub: 'Trạng thái BOOKED hợp lệ',
      icon: Ticket,
      accent: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
      link: '/admin/showtimes',
    },
    {
      label: 'Tổng Doanh Thu Lũy Kế',
      value: `${data.totalRevenue.toLocaleString('vi-VN')} đ`,
      sub: 'VNPay & Quầy trực tiếp',
      icon: DollarSign,
      accent: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      link: '/admin/revenue',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header + Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
            Tổng Quan Hoạt Động Cụm Rạp
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi số lượng vé phát hành, lịch chiếu trong ngày và doanh thu toàn hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/movies"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 border border-white/10 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            <span>Quản lý phim</span>
          </Link>
          <Link
            to="/admin/revenue"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-luminous hover:opacity-95 transition-opacity"
          >
            <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Phân tích doanh thu</span>
          </Link>
        </div>
      </div>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link
              key={k.label}
              to={k.link}
              className="group cinema-card rounded-3xl p-5 flex flex-col justify-between gap-4 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${k.accent}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <ArrowUpRight
                  className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block">
                  {k.label}
                </span>
                <div className="font-mono text-2xl font-black text-slate-50 mt-1 tracking-tight">
                  {k.value}
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  {k.sub}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Bookings Data Table */}
      <div className="cinema-card rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-base text-slate-50">
                Giao Dịch Đặt Vé Gần Nhất
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              10 giao dịch đặt vé thành công mới nhất trên toàn hệ thống
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              placeholder="Lọc mã vé, tên khách, phim..."
              aria-label="Lọc giao dịch gần nhất"
              className="w-full pl-9 pr-3 py-2 rounded-xl cinema-input text-xs font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F1A] text-slate-400 uppercase text-[11px] font-bold border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Mã Vé</th>
                <th className="py-3.5 px-5">Khách Hàng</th>
                <th className="py-3.5 px-5">Bộ Phim</th>
                <th className="py-3.5 px-5">Phòng & Ghế</th>
                <th className="py-3.5 px-5">Giá Vé</th>
                <th className="py-3.5 px-5">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredRecent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chưa có giao dịch đặt vé nào khớp điều kiện hiển thị.
                  </td>
                </tr>
              ) : (
                filteredRecent.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-rose-400">
                      #{t.bookingCode}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-100">
                      {t.user?.fullName || t.user?.username}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-200">
                      {t.showtime?.movie?.title}
                    </td>
                    <td className="py-3.5 px-5">
                      <span>{t.showtime?.room?.name}</span>{' '}
                      <span className="ml-1 px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-slate-100">
                        {t.seat?.seatRow}
                        {t.seat?.seatNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-300">
                      {Number(t.price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      {new Date(t.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
