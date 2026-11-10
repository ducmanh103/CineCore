import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { CheckCircle2, XCircle, ArrowRight, Ticket, Clapperboard } from 'lucide-react';

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
          message: err.message || 'Lỗi khi xác minh giao dịch.',
          bookingCode: queryObj['vnp_TxnRef'] || '',
        });
      });
  }, [searchParams]);

  if (status.loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500 text-sm">
        Đang đối soát giao dịch thanh toán CineCore cùng VNPay...
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          {status.isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200 shadow-sm animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border-2 border-rose-200 shadow-sm animate-in zoom-in-50 duration-300">
              <XCircle className="w-12 h-12 stroke-[2.5]" />
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            {status.isSuccess ? 'Thanh Toán Thành Công!' : 'Giao Dịch Thất Bại'}
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">{status.message}</p>
          {status.bookingCode && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
              Mã giao dịch CineCore: <b>#{status.bookingCode}</b>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            to="/booking/my-tickets"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-luminous flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span>Mở Ví Vé CineCore Pass</span>
          </Link>

          <Link
            to="/"
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Quay Lại Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
