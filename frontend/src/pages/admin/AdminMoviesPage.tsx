import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { Movie } from '../../types';
import { AgeBadge } from '../../components/ui/AgeBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUiStore, toast } from '../../store/uiStore';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Upload,
  Link2,
  Play,
  Loader2,
} from 'lucide-react';

export const AdminMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'posterUrl' | 'bannerUrl' | null>(
    null,
  );
  const [remotePosterInput, setRemotePosterInput] = useState('');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const { confirm, openTrailer } = useUiStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    ageRating: 'P',
    director: '',
    cast: '',
    posterUrl: '/img/movies/kungfupanda4.jpg',
    bannerUrl: '/img/movies/kungfupanda4-banner.jpg',
    trailerUrl: '',
    status: 'NOW_SHOWING',
  });

  const fetchMovies = () => {
    setLoading(true);
    api
      .get<any, Movie[]>('/movies')
      .then((res) => setMovies(Array.isArray(res) ? res : []))
      .catch((err) => toast.error('Không thể tải danh sách phim', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          (m.director || '').toLowerCase().includes(q) ||
          (m.cast || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [movies, statusFilter, search]);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setRemotePosterInput('');
    setFormData({
      title: '',
      description: '',
      duration: 120,
      releaseDate: new Date().toISOString().split('T')[0],
      ageRating: 'P',
      director: '',
      cast: '',
      posterUrl: '/img/movies/kungfupanda4.jpg',
      bannerUrl: '/img/movies/kungfupanda4-banner.jpg',
      trailerUrl: '',
      status: 'NOW_SHOWING',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: Movie) => {
    setEditingMovie(m);
    setRemotePosterInput('');
    setFormData({
      title: m.title,
      description: m.description || '',
      duration: m.duration,
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '2026-11-20',
      ageRating: m.ageRating || 'P',
      director: m.director || '',
      cast: m.cast || '',
      posterUrl: m.posterUrl || '/img/movies/kungfupanda4.jpg',
      bannerUrl: m.bannerUrl || '',
      trailerUrl: m.trailerUrl || '',
      status: m.status,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'posterUrl' | 'bannerUrl',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(targetField);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<any, { url: string }>('/storage/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res?.url) {
        setFormData((prev) => ({ ...prev, [targetField]: res.url }));
        toast.success(
          'Tải ảnh lên thành công',
          'Hình ảnh đã được cập nhật cho bộ phim.',
        );
      }
    } catch (err: any) {
      toast.error('Không thể tải ảnh lên', err.message);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleRemoteImport = async () => {
    const trimmed = remotePosterInput.trim();
    if (!trimmed) return;
    setUploadingField('posterUrl');
    try {
      const res = await api.post<any, { url: string }>('/storage/remote', {
        url: trimmed,
      });
      if (res?.url) {
        setFormData((prev) => ({ ...prev, posterUrl: res.url }));
        setRemotePosterInput('');
        toast.success('Đã lưu ảnh từ liên kết', 'Poster bộ phim đã được cập nhật.');
      }
    } catch (err: any) {
      toast.error('Tải ảnh từ URL thất bại', err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, formData);
        toast.success('Đã cập nhật phim', formData.title);
      } else {
        await api.post('/movies', formData);
        toast.success('Đã thêm phim mới', formData.title);
      }
      setShowModal(false);
      fetchMovies();
    } catch (err: any) {
      toast.error('Không thể lưu thông tin phim', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: Movie) => {
    const ok = await confirm({
      title: 'Xác nhận ngừng chiếu / xóa phim?',
      message: `Bạn có chắc chắn muốn xóa hoặc ngừng khai thác bộ phim "${m.title}" khỏi hệ thống?`,
      confirmText: 'Xác nhận xóa',
      cancelText: 'Giữ lại',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.delete(`/movies/${m.id}`);
      toast.success('Đã xóa / ngừng chiếu phim', m.title);
      fetchMovies();
    } catch (err: any) {
      toast.error('Không thể xóa phim', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
            Quản Lý Kho Phim Chiếu Rạp
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Biên tập thông tin phim, trailer, phân loại độ tuổi và lưu trữ poster chuẩn bảo mật
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-brand-gradient text-white text-xs font-bold shadow-luminous hover:opacity-95 transition-opacity flex items-center gap-1.5 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm Bộ Phim Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="cinema-card rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-fit overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'ALL', label: `Tất cả (${movies.length})` },
              { id: 'NOW_SHOWING', label: 'Đang chiếu' },
              { id: 'COMING_SOON', label: 'Sắp chiếu' },
              { id: 'ENDED', label: 'Kết thúc' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === t.id
                  ? 'bg-brand-gradient text-white shadow-luminous'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm phim, đạo diễn, diễn viên..."
            aria-label="Tìm kiếm phim trong kho"
            className="w-full pl-9 pr-3 py-2 rounded-xl cinema-input text-xs font-medium"
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="cinema-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F1A] text-slate-400 uppercase text-[11px] font-bold border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-5">Poster</th>
                  <th className="py-3.5 px-5">Bộ Phim & Đạo Diễn</th>
                  <th className="py-3.5 px-5">Thời Lượng</th>
                  <th className="py-3.5 px-5">Phân Loại</th>
                  <th className="py-3.5 px-5">Trạng Thái</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredMovies.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-5">
                      <img
                        src={
                          m.posterUrl ||
                          'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'
                        }
                        alt={m.title}
                        className="w-11 h-16 object-cover rounded-xl border border-white/15 shadow-sm"
                      />
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-display font-bold text-sm text-slate-50">
                        {m.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {m.director ? `Đạo diễn: ${m.director}` : 'Chưa cập nhật đạo diễn'}
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono font-semibold text-slate-200">
                      {m.duration} phút
                    </td>
                    <td className="py-3 px-5">
                      <AgeBadge rating={m.ageRating} size="sm" />
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          m.status === 'NOW_SHOWING'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                            : m.status === 'COMING_SOON'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30'
                            : 'bg-white/[0.06] text-slate-400 border-white/10'
                        }`}
                      >
                        {m.status === 'NOW_SHOWING'
                          ? 'Đang Chiếu'
                          : m.status === 'COMING_SOON'
                          ? 'Sắp Chiếu'
                          : 'Kết Thúc'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                      {m.trailerUrl && (
                        <button
                          type="button"
                          onClick={() => openTrailer(m)}
                          title="Xem thử Trailer"
                          aria-label={`Xem thử trailer ${m.title}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Play className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(m)}
                        title="Chỉnh sửa phim"
                        aria-label={`Chỉnh sửa ${m.title}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        title="Xóa phim"
                        aria-label={`Xóa ${m.title}`}
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

      {/* Studio-Grade Movie Editor Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingMovie ? 'Cập nhật phim chiếu rạp' : 'Thêm bộ phim mới'}
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in action-panel rounded-[28px] w-full max-w-2xl p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display font-extrabold text-lg text-slate-50">
                  {editingMovie ? 'Cập Nhật Thông Tin Phim' : 'Thêm Bộ Phim Mới'}
                </h2>
                <p className="text-xs text-slate-400">
                  Nhập đầy đủ thông tin bộ phim, phân loại độ tuổi, poster và trailer chính thức
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Đóng hộp thoại"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Poster Preview + Upload Row */}
              <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-white/10 flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={
                    formData.posterUrl ||
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'
                  }
                  alt="Poster preview"
                  className="w-20 aspect-[2/3] rounded-xl object-cover border border-white/15 shadow-md shrink-0"
                />
                <div className="flex-1 space-y-2.5 w-full">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Đường dẫn Poster (posterUrl)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.posterUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, posterUrl: e.target.value })
                        }
                        placeholder="/img/movies/... hoặc /uploads/..."
                        className="flex-1 px-3 py-2 rounded-xl cinema-input font-mono text-[11px]"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shrink-0">
                        {uploadingField === 'posterUrl' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Tải tệp</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'posterUrl')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Remote URL Fetcher */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={remotePosterInput}
                      onChange={(e) => setRemotePosterInput(e.target.value)}
                      placeholder="Hoặc dán HTTPS URL ảnh ngoài để tải về Server..."
                      className="flex-1 px-3 py-1.5 rounded-xl cinema-input text-[11px]"
                    />
                    <button
                      type="button"
                      disabled={!remotePosterInput.trim() || uploadingField !== null}
                      onClick={handleRemoteImport}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-[11px] disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Lưu URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-200 mb-1">Tên Bộ Phim *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl cinema-input font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Ngày Khởi Chiếu</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, releaseDate: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl cinema-input font-mono"
                  />
                </div>
              </div>

              {/* Specs Row */}
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 rounded-xl cinema-input font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Phân loại tuổi</label>
                  <select
                    value={formData.ageRating}
                    onChange={(e) =>
                      setFormData({ ...formData, ageRating: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl cinema-input font-bold"
                  >
                    <option value="P" className="bg-[#0E1320]">P (Mọi độ tuổi)</option>
                    <option value="K" className="bg-[#0E1320]">K (Dưới 13t kèm GH)</option>
                    <option value="T13" className="bg-[#0E1320]">T13 (13+)</option>
                    <option value="T16" className="bg-[#0E1320]">T16 (16+)</option>
                    <option value="T18" className="bg-[#0E1320]">T18 (18+)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl cinema-input font-bold"
                  >
                    <option value="NOW_SHOWING" className="bg-[#0E1320]">Đang Chiếu</option>
                    <option value="COMING_SOON" className="bg-[#0E1320]">Sắp Chiếu</option>
                    <option value="ENDED" className="bg-[#0E1320]">Kết Thúc</option>
                  </select>
                </div>
              </div>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Đạo diễn</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) =>
                      setFormData({ ...formData, director: e.target.value })
                    }
                    placeholder="vd: Denis Villeneuve"
                    className="w-full px-3.5 py-2.5 rounded-xl cinema-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Diễn viên chính</label>
                  <input
                    type="text"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    placeholder="vd: Timothée Chalamet, Zendaya"
                    className="w-full px-3.5 py-2.5 rounded-xl cinema-input"
                  />
                </div>
              </div>

              {/* Banner & Trailer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Ảnh Banner ngang (bannerUrl)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.bannerUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, bannerUrl: e.target.value })
                      }
                      placeholder="/img/movies/...-banner.jpg"
                      className="flex-1 px-3 py-2 rounded-xl cinema-input font-mono text-[11px]"
                    />
                    <label className="inline-flex items-center px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-100 font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    YouTube Trailer URL
                  </label>
                  <input
                    type="text"
                    value={formData.trailerUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, trailerUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3.5 py-2 rounded-xl cinema-input font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Tóm tắt nội dung (Synopsis)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl cinema-input leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-bold shadow-luminous disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Đang lưu...' : editingMovie ? 'Lưu Cập Nhật' : 'Tạo Bộ Phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
