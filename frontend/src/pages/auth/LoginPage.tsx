import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/uiStore';
import {
  Clapperboard,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Ticket,
  Award,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<any, any>('/auth/login', { username, password });

      if (res.requiresMfa) {
        const q = new URLSearchParams({ challengeId: res.challengeId });
        if (redirectTo) q.set('redirect', redirectTo);
        toast.info('Xác nhận đăng nhập', 'Vui lòng nhập mã xác thực gồm 6 chữ số đã được gửi tới bạn.');
        navigate(`/auth/verify-mfa?${q.toString()}`);
        return;
      }

      setUser(res.user);
      toast.success(
        `Xin chào, ${res.user.fullName || res.user.username}!`,
        'Chúc quý khách có những giây phút thưởng thức điện ảnh tuyệt vời.',
      );

      if (redirectTo && redirectTo.startsWith('/')) {
        navigate(redirectTo);
      } else if (res.user.role === 'ADMIN' || res.user.role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-11 rounded-[28px] overflow-hidden action-panel">
        {/* Left Cinema Membership Showcase */}
        <div className="hidden lg:flex lg:col-span-5 p-10 relative overflow-hidden bg-[#141923] border-r border-white/10 flex-col justify-between">
          <img
            src="/img/movies/dune2-banner.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#10141B]/85 via-[#10141B]/80 to-[#10141B]/95"
          />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl btn-ncc-primary flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-black text-xl text-white">
                CINE<span className="text-[#FF575F]">CORE</span>
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-[11px] font-semibold text-amber-300">
                <Award className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hội viên Điện ảnh CineCore</span>
              </span>
              <h1 className="font-display text-2xl font-extrabold text-white leading-snug">
                Đặt vé trực tuyến dễ dàng, chọn trước vị trí ghế đẹp nhất.
              </h1>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                Lưu trữ vé điện tử tiện lợi ngay trên tài khoản, vào thẳng phòng chiếu bằng mã QR không cần xếp hàng chờ đợi tại quầy.
              </p>
            </div>
          </div>

          <div className="relative z-10 p-4 rounded-2xl bg-white/[0.06] border border-white/10 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#FF7A63]">
              <Ticket className="w-4 h-4" aria-hidden="true" />
              <span>Đặc quyền thành viên & Thẻ U22</span>
            </div>
            <p className="text-[11px] text-white/75 leading-relaxed">
              Đồng giá vé 2D chỉ từ 55.000đ từ Thứ 2 đến Thứ 6 cùng nhiều ưu đãi combo bắp nước hàng tuần.
            </p>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Đăng nhập
            </h2>
            <p className="text-xs sm:text-sm text-[#8B9BB4]">
              Đăng nhập tài khoản thành viên để tiếp tục đặt vé và xem lịch sử vé đã mua
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-500/15 border border-red-400/35 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs sm:text-sm font-semibold text-white/90 mb-1.5"
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản"
                  className="w-full pl-10 pr-4 py-3 rounded-xl cinema-input text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs sm:text-sm font-semibold text-white/90 mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-3 rounded-xl cinema-input text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B9BB4] hover:text-white cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ncc-primary w-full h-11 rounded-full font-semibold text-sm sm:text-base disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs sm:text-sm text-[#8B9BB4]">
            Bạn chưa có tài khoản?{' '}
            <Link to="/auth/register" className="text-[#FF575F] font-semibold hover:underline">
              Đăng ký thành viên ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
