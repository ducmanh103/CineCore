import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/uiStore';
import {
  Clapperboard,
  User,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<any, any>('/auth/register', formData);
      if (res?.user) {
        setUser(res.user);
        toast.success(
          'Đăng ký tài khoản thành công!',
          `Chào mừng ${res.user.fullName || res.user.username} đến với rạp chiếu phim CineCore.`,
        );
        navigate('/');
      } else {
        toast.success('Đăng ký thành công!', 'Vui lòng đăng nhập để bắt đầu đặt vé.');
        navigate('/auth/login');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng ký chưa thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl p-7 sm:p-10 rounded-[28px] action-panel space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl btn-ncc-primary items-center justify-center mb-1">
            <Clapperboard className="w-6 h-6 text-white stroke-[2.2]" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Đăng ký tài khoản thành viên
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9BB4]">
            Trở thành hội viên CineCore để đặt vé trực tuyến nhanh chóng và nhận nhiều ưu đãi tại rạp
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-xs sm:text-sm font-semibold text-white/90 mb-1.5"
              >
                Họ và tên
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                autoComplete="name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 rounded-xl cinema-input text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="reg-username"
                className="block text-xs sm:text-sm font-semibold text-white/90 mb-1.5"
              >
                Tên tài khoản
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="reg-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl cinema-input text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs sm:text-sm font-semibold text-white/90 mb-1.5"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Số điện thoại liên hệ"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl cinema-input text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs sm:text-sm font-semibold text-white/90 mb-1.5"
              >
                Email nhận vé điện tử
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9BB4] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl cinema-input text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
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
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl cinema-input text-sm"
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
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs sm:text-sm text-[#8B9BB4]">
          Bạn đã có tài khoản?{' '}
          <Link to="/auth/login" className="text-[#FF575F] font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
