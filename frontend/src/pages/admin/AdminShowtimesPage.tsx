import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Showtime } from '../../types';
import { Calendar, Plus, MapPin } from 'lucide-react';

export const AdminShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, Showtime[]>('/showtimes')
      .then((res) => setShowtimes(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Suất Chiếu</h1>
          <p className="text-xs text-slate-500 mt-1">Điều phối lịch chiếu và chống trùng giờ phòng chiếu</p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Thêm Suất Chiếu Mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Phim</th>
                <th className="py-3 px-4">Cụm Rạp</th>
                <th className="py-3 px-4">Phòng Chiếu</th>
                <th className="py-3 px-4">Bắt Đầu</th>
                <th className="py-3 px-4">Kết Thúc</th>
                <th className="py-3 px-4">Giá Vé Chuẩn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {showtimes.slice(0, 20).map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{st.movie?.title}</td>
                  <td className="py-3 px-4 text-slate-700">{st.room?.theater?.name}</td>
                  <td className="py-3 px-4 font-medium">{st.room?.name} ({st.room?.screenType})</td>
                  <td className="py-3 px-4 font-mono">{new Date(st.startTime).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4 font-mono">{new Date(st.endTime).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    {Number(st.price).toLocaleString('vi-VN')} đ
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

