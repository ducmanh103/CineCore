import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import {
  CheckCircle2,
  XCircle,
  Ticket,
  Loader2,
  Home,
} from 'lucide-react';

export const VnpayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<{
    loading: boolean;
    isSuccess: boolean;
    message: string;
    bookingCode: string;
  }>({
    loading: true,
    isSuccess: false,
    message: '',
    bookingCode: '',
  });

  useEffect(() => {
    const queryObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });

    const queryString = new URLSearchParams(queryObj).toString();

    api
      .get<any, any>(`/payments/vnpay-return?${queryString}`)
      .then((res) => {
        setStatus({
          loading: false,
          isSuccess: res.isSuccess,
          message: res.message,
          bookingCode: res.bookingCode,
        });
      })
      .catch((err) => {
        setStatus({
          loading: false,
          isSuccess: false,
          message: err.message || 'Giao dịch thanh toán chưa hoàn tất hoặc đã bị hủy.',
          bookingCode: queryObj['vnp_TxnRef'] || '',
        });
      });
  }, [searchParams]);

  if (status.loading) {
    return (
      <div className="min-h-[72vh] flex flex-col items-center justify-center gap-3 text-white/80 text-sm font-medium">
        <Loader2 className="w-8 h-8 text-[#FF414D] animate-spin" aria-hidden="true" />
        <span>Đang kiểm tra kết quả thanh toán, vui lòng đợi trong giây lát...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[76vh] flex items-center justify-center px-4 py-10">
      <div className="animate-scale-in w-full max-w-md p-8 sm:p-10 rounded-[28px] action-panel text-center space-y-6">
        <div className="flex justify-center">
          {status.isSuccess ? (
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-400/35">
              <CheckCircle2 className="w-11 h-11 stroke-[2.2]" aria-hidden="true" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-red-500/15 text-red-300 flex items-center justify-center border border-red-400/35">
              <XCircle className="w-11 h-11 stroke-[2.2]" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            {status.isSuccess ? 'Đặt vé thành công!' : 'Thanh toán chưa hoàn tất'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9BB4] leading-relaxed">
            {status.message}
          </p>

          {status.bookingCode && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#10141B] border border-white/10 text-xs sm:text-sm font-mono text-white/80">
              Mã đặt vé: <strong className="text-white">#{status.bookingCode}</strong>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            to="/booking/my-tickets"
            className="btn-ncc-primary w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" aria-hidden="true" />
            <span>Xem vé của tôi</span>
          </Link>

          <Link
            to="/"
            className="btn-ncc-outline w-full h-11 rounded-full font-medium text-sm flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
