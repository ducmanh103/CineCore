import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Film, Calendar, Ticket, DollarSign, TrendingUp } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    totalMovies: number;
    todayShowtimes: number;
    totalTickets: number;
    totalRevenue: number;
    recentTickets: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, any>('/admin/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-slate-500 text-sm">Đang tải chỉ số quản trị...</div>;
  }

  const kpis = [
    { label: 'Tổng Số Phim', value: data.totalMovies, icon: Film, color: 'text-blue-600 bg-blue-50' },
    { label: 'Suất Chiếu Hôm Nay', value: data.todayShowtimes, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
    { label: 'Tổng Vé Đã Bán', value: data.totalTickets, icon: Ticket, color: 'text-purple-600 bg-purple-50' },
    {
      label: 'Tổng Doanh Thu',
      value: `${data.totalRevenue.toLocaleString('vi-VN')} đ`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng Điều Khiển Tổng Quan CineCore</h1>
        <p className="text-xs text-slate-500 mt-1">Giám sát các chỉ số vận hành rạp chiếu thời gian thực</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">{k.label}</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{k.value}</div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${k.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Giao Dịch Đặt Vé Mới Nhất</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã Vé</th>
                <th className="py-3 px-4">Khách Hàng (PDPD)</th>
                <th className="py-3 px-4">Phim</th>
                <th className="py-3 px-4">Phòng & Ghế</th>
                <th className="py-3 px-4">Giá Vé</th>
                <th className="py-3 px-4">Thời Gian Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">#{t.bookingCode}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{t.user?.fullName || t.user?.username}</td>
                  <td className="py-3 px-4 font-medium">{t.showtime?.movie?.title}</td>
                  <td className="py-3 px-4">
                    {t.showtime?.room?.name} - <b>{t.seat?.seatRow}{t.seat?.seatNumber}</b>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    {Number(t.price).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(t.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

