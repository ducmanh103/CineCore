import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Movie } from '../../types';
import { Film, Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, Movie[]>('/movies')
      .then((res) => setMovies(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Phim Chiếu Rạp</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách {movies.length} bộ phim trong hệ thống</p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Thêm Phim Mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Poster</th>
                <th className="py-3 px-4">Tên Phim</th>
                <th className="py-3 px-4">Thời Lượng</th>
                <th className="py-3 px-4">Độ Tuổi</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movies.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'}
                      alt={m.title}
                      className="w-10 h-14 object-cover rounded-md border border-slate-200"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{m.title}</td>
                  <td className="py-3 px-4">{m.duration} phút</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {m.ageRating}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        m.status === 'NOW_SHOWING'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'COMING_SOON'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status === 'NOW_SHOWING' ? 'Đang Chiếu' : m.status === 'COMING_SOON' ? 'Sắp Chiếu' : 'Kết Thúc'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

