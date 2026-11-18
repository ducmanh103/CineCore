import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { Showtime, Movie, Theater } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUiStore, toast } from '../../store/uiStore';
import { Plus, Trash2, X, Search, Clock } from 'lucide-react';

const PRICE_PRESETS = [75000, 95000, 115000, 145000];

export const AdminShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const { confirm } = useUiStore();

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
      .then((res) => setShowtimes(Array.isArray(res) ? res : []))
      .catch((err) => toast.error('Không thể tải suất chiếu', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShowtimes();
    api
      .get<any, Movie[]>('/movies')
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setMovies(list);
          setFormData((prev) => ({ ...prev, movieId: list[0].id }));
        }
      })
      .catch(() => {});
    api
      .get<any, Theater[]>('/theaters')
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setTheaters(list);
          const firstRoom = list[0]?.rooms?.[0];
          if (firstRoom) {
            setFormData((prev) => ({ ...prev, roomId: firstRoom.id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const allRooms = useMemo(
    () =>
      theaters.flatMap((t) =>
        (t.rooms || []).map((r) => ({ ...r, theaterName: t.name })),
      ),
    [theaters],
  );

  const selectedMovieObj = useMemo(
    () => movies.find((m) => m.id === Number(formData.movieId)),
    [movies, formData.movieId],
  );

  const estimatedEndStr = useMemo(() => {
    if (!formData.startTime) return '';
    const start = new Date(formData.startTime);
    if (isNaN(start.getTime())) return '';
    const dur = selectedMovieObj?.duration || 120;
    const end = new Date(start.getTime() + (dur + 15) * 60 * 1000);
    return end.toLocaleString('vi-VN');
  }, [formData.startTime, selectedMovieObj]);

  const filteredShowtimes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return showtimes.slice(0, 50);
    return showtimes
      .filter(
        (s) =>
          s.movie?.title?.toLowerCase().includes(q) ||
          s.room?.theater?.name?.toLowerCase().includes(q) ||
          s.room?.name?.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [showtimes, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/showtimes', {
        movieId: Number(formData.movieId),
        roomId: Number(formData.roomId),
        startTime: new Date(formData.startTime).toISOString(),
        price: Number(formData.price),
      });
      toast.success('Đã lên lịch suất chiếu mới');
      setShowModal(false);
      fetchShowtimes();
    } catch (err: any) {
      toast.error('Trùng khung giờ hoặc dữ liệu không hợp lệ', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (st: Showtime) => {
    const ok = await confirm({
      title: 'Xóa suất chiếu khỏi lịch vận hành?',
      message: `Xác nhận hủy suất chiếu phim "${st.movie?.title}" lúc ${new Date(
        st.startTime,
      ).toLocaleString('vi-VN')} tại ${st.room?.theater?.name}?`,
      confirmText: 'Xóa suất chiếu',
      cancelText: 'Giữ lại',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.delete(`/showtimes/${st.id}`);
      toast.success('Đã xóa suất chiếu thành công');
      fetchShowtimes();
    } catch (err: any) {
      toast.error('Không thể xóa suất chiếu', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
            Điều Phối Suất Chiếu & Phòng Chiếu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tự động kiểm tra chống trùng giờ phòng chiếu (+15 phút vệ sinh chuyển ca)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-gradient text-white text-xs font-bold shadow-luminous hover:opacity-95 transition-opacity flex items-center gap-1.5 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Lên Suất Chiếu Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="cinema-card rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400 px-2">
          Đang hiển thị{' '}
          <strong className="font-mono text-slate-100">{filteredShowtimes.length}</strong>{' '}
          suất chiếu sắp tới
        </span>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lọc theo phim, cụm rạp, phòng..."
            aria-label="Tìm suất chiếu"
            className="w-full pl-9 pr-3 py-2 rounded-xl cinema-input text-xs font-medium"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="cinema-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F1A] text-slate-400 uppercase text-[11px] font-bold border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-5">Bộ Phim</th>
                  <th className="py-3.5 px-5">Cụm Rạp</th>
                  <th className="py-3.5 px-5">Phòng Chiếu</th>
                  <th className="py-3.5 px-5">Giờ Bắt Đầu</th>
                  <th className="py-3.5 px-5">Giờ Kết Thúc</th>
                  <th className="py-3.5 px-5">Giá Chuẩn</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredShowtimes.map((st) => (
                  <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-display font-bold text-slate-50">
                      {st.movie?.title}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-indigo-300">
                      {st.room?.theater?.name}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-200">{st.room?.name}</span>{' '}
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold text-slate-300 ml-1">
                        {st.room?.screenType}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-slate-100">
                      {new Date(st.startTime).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      {new Date(st.endTime).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-300">
                      {Number(st.price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(st)}
                        title="Xóa suất chiếu"
                        aria-label={`Xóa suất chiếu ${st.movie?.title}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Showtime Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Lên lịch suất chiếu mới"
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in action-panel rounded-[28px] w-full max-w-md p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h2 className="font-display font-extrabold text-lg text-slate-50">
                Lên Lịch Suất Chiếu Mới
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Đóng hộp thoại"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">Chọn Bộ Phim</label>
                <select
                  value={formData.movieId}
                  onChange={(e) =>
                    setFormData({ ...formData, movieId: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl cinema-input font-semibold"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#0E1320]">
                      {m.title} ({m.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Cụm Rạp & Phòng Chiếu
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl cinema-input font-semibold"
                >
                  {allRooms.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#0E1320]">
                      {r.theaterName} — {r.name} ({r.screenType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Thời Gian Bắt Đầu Chiếu
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl cinema-input font-mono"
                />
                {estimatedEndStr && (
                  <p className="text-[11px] text-indigo-300 font-medium mt-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Dự kiến giải phóng phòng (+15p dọn phòng): {estimatedEndStr}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Giá Vé Ghế Thường (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  min={10000}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl cinema-input font-mono font-bold"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, price: p })}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                        formData.price === p
                          ? 'bg-brand-gradient text-white border-transparent shadow-luminous'
                          : 'bg-white/[0.05] text-slate-300 border-white/10 hover:border-rose-400/40'
                      }`}
                    >
                      {(p / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white font-bold shadow-luminous disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Đang kiểm tra...' : 'Xác Nhận Lên Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
