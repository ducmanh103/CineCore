import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Showtime, Movie, Theater } from '../../types';
import { Calendar, Plus, Trash2, X } from 'lucide-react';

export const AdminShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    movieId: 1,
    roomId: 1,
    startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    price: 95000,
  });

  const fetchShowtimes = () => {
    setLoading(true);
    api
      .get<any, Showtime[]>('/showtimes')
      .then((res) => setShowtimes(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShowtimes();
    api.get<any, Movie[]>('/movies').then(setMovies).catch(() => {});
    api.get<any, Theater[]>('/theaters').then(setTheaters).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/showtimes', {
        movieId: Number(formData.movieId),
        roomId: Number(formData.roomId),
        startTime: new Date(formData.startTime).toISOString(),
        price: Number(formData.price),
      });
      setShowModal(false);
      fetchShowtimes();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo suất chiếu (kiểm tra trùng khung giờ phòng chiếu).');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) return;
    try {
      await api.delete(`/showtimes/${id}`);
      fetchShowtimes();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa suất chiếu.');
    }
  };

  const allRooms = theaters.flatMap((t) =>
    (t.rooms || []).map((r) => ({ ...r, theaterName: t.name })),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Suất Chiếu</h1>
          <p className="text-xs text-slate-500 mt-1">Điều phối lịch chiếu và chống trùng giờ phòng chiếu</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
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
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {showtimes.slice(0, 30).map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{st.movie?.title}</td>
                  <td className="py-3 px-4 text-slate-700">{st.room?.theater?.name}</td>
                  <td className="py-3 px-4 font-medium">{st.room?.name} ({st.room?.screenType})</td>
                  <td className="py-3 px-4 font-mono">{new Date(st.startTime).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4 font-mono">{new Date(st.endTime).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    {Number(st.price).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      title="Xóa suất chiếu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Tạo Suất Chiếu Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Phim</label>
                <select
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng Chiếu</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  {allRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.theaterName} - {r.name} ({r.screenType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời Gian Bắt Đầu</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giá Vé Tiêu Chuẩn (VNĐ)</label>
                <input
                  type="number"
                  required
                  step={5000}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Lên Lịch Chiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


