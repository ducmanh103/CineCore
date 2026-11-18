import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/uiStore';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export const VerifyMfaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challengeId') || '';
  const redirectTo = searchParams.get('redirect') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<any, any>('/auth/verify-mfa', {
        challengeId,
        otp: otp.trim(),
      });

      setUser(res.user);
      toast.success('Xác thực thành công', 'Chào mừng bạn quay trở lại hệ thống.');

      if (redirectTo && redirectTo.startsWith('/')) {
        navigate(redirectTo);
      } else if (res.user.role === 'ADMIN' || res.user.role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[76vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-[28px] action-panel space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#FF414D]/15 text-[#FF575F] items-center justify-center border border-[#FF414D]/35 mb-1">
            <ShieldCheck className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            Xác thực đăng nhập
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9BB4] leading-relaxed">
            Vui lòng nhập mã bảo mật gồm 6 chữ số vừa được gửi tới ứng dụng nhận mã liên kết với tài khoản của bạn.
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

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label
              htmlFor="mfa-otp-input"
              className="block text-xs font-semibold text-white/85 mb-2 text-center uppercase tracking-wider"
            >
              Mã xác nhận 6 số
            </label>
            <input
              id="mfa-otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full py-3.5 text-center tracking-[0.5em] font-mono font-bold text-2xl rounded-xl cinema-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-ncc-primary w-full h-11 rounded-full font-semibold text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang kiểm tra...' : 'Xác nhận'}
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#8B9BB4] hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Quay lại trang đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
