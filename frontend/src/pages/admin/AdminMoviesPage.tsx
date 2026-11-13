import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Movie } from '../../types';
import { Film, Plus, Edit2, Trash2, X } from 'lucide-react';

export const AdminMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 120,
    releaseDate: '2026-11-20',
    ageRating: 'P',
    director: '',
    cast: '',
    posterUrl: '/img/movies/kungfupanda4.jpg',
    status: 'NOW_SHOWING',
  });

  const fetchMovies = () => {
    setLoading(true);
    api
      .get<any, Movie[]>('/movies')
      .then((res) => setMovies(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      duration: 120,
      releaseDate: new Date().toISOString().split('T')[0],
      ageRating: 'P',
      director: '',
      cast: '',
      posterUrl: '/img/movies/kungfupanda4.jpg',
      status: 'NOW_SHOWING',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: Movie) => {
    setEditingMovie(m);
    setFormData({
      title: m.title,
      description: m.description,
      duration: m.duration,
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '2026-11-20',
      ageRating: m.ageRating,
      director: m.director || '',
      cast: m.cast || '',
      posterUrl: m.posterUrl || '/img/movies/kungfupanda4.jpg',
      status: m.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, formData);
      } else {
        await api.post('/movies', formData);
      }
      setShowModal(false);
      fetchMovies();
    } catch (err: any) {
      alert(err.message || 'Không thể lưu thông tin phim.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hoặc ngừng chiếu bộ phim này?')) return;
    try {
      await api.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa phim.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Phim Chiếu Rạp</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách {movies.length} bộ phim trong hệ thống</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
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
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Chỉnh sửa phim"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      title="Xóa phim"
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingMovie ? 'Cập Nhật Phim Chiếu Rạp' : 'Thêm Bộ Phim Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Phim</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Độ tuổi</label>
                  <select
                    value={formData.ageRating}
                    onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="P">P</option>
                    <option value="T13">T13</option>
                    <option value="T16">T16</option>
                    <option value="T18">T18</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="NOW_SHOWING">Đang Chiếu</option>
                    <option value="COMING_SOON">Sắp Chiếu</option>
                    <option value="ENDED">Kết Thúc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả nội dung</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
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
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


