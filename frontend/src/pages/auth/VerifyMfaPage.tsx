import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export const VerifyMfaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challengeId') || '';
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
        otp,
      });

      setUser(res.user);
      if (res.user.role === 'ADMIN' || res.user.role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Mã MFA không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 items-center justify-center border border-amber-200 shadow-sm mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Xác Thực 2 Lớp (MFA)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Tài khoản Quản trị viên yêu cầu nhập mã OTP bảo mật gửi qua Telegram Bot
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Telegram OTP Notice */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-indigo-700">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Mã OTP đã được gửi đến Telegram Bot</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Vui lòng kiểm tra tin nhắn từ <b>Telegram Bot</b> của hệ thống để lấy mã 6 chữ số (Mã cũng được in tại Terminal Backend phục vụ kiểm thử).
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 text-center uppercase tracking-wider">
              Mã xác thực 2FA OTP (6 số)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="••••••"
              className="w-full py-3.5 text-center tracking-widest font-mono text-2xl rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-luminous-amber hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Đang kiểm tra...' : 'Xác Nhận Đăng Nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
