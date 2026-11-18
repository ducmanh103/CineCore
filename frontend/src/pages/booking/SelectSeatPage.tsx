import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { CurvedScreen } from '../../components/booking/CurvedScreen';
import { SeatMatrix } from '../../components/booking/SeatMatrix';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/uiStore';
import { Skeleton } from '../../components/ui/Skeleton';
import { Showtime, Seat } from '../../types';
import {
  CreditCard,
  RefreshCw,
  Banknote,
  ArrowLeft,
} from 'lucide-react';

export const SelectSeatPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [showtime, setShowtimeState] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'CASH'>('VNPAY');
  const [secondsLeft, setSecondsLeft] = useState<number>(600); // 10:00 NCC seat selection timer

  const { selectedSeats, totalPrice, setShowtime, clearSelection } =
    useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // NCC Seat Selection Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadShowtimeSeats = useCallback(
    async (isSilentRefresh = false) => {
      if (!showtimeId) return;
      if (isSilentRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await api.get<any, { showtime: Showtime; seats: Seat[] }>(
          `/showtimes/${showtimeId}/seats`,
        );
        setShowtimeState(res.showtime);
        setSeats(res.seats);
        if (!isSilentRefresh) {
          setShowtime(res.showtime);
        }
        if (isSilentRefresh) {
          toast.info('Đã đồng bộ sơ đồ ghế', 'Cập nhật trạng thái ghế trống mới nhất.');
        }
      } catch (err: any) {
        toast.error('Không thể tải phòng chiếu', err.message || 'Vui lòng thử lại sau.');
        if (!isSilentRefresh) navigate(-1);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showtimeId, navigate, setShowtime],
  );

  useEffect(() => {
    loadShowtimeSeats(false);
    return () => {
      clearSelection();
    };
  }, [loadShowtimeSeats, clearSelection]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.warning(
        'Vui lòng đăng nhập tài khoản',
        'Quý khách cần đăng nhập tài khoản thành viên để tiếp tục đặt vé.',
      );
      navigate(`/auth/login?redirect=${encodeURIComponent(`/booking/select-seat/${showtimeId}`)}`);
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning('Chưa chọn ghế ngồi', 'Vui lòng chọn ít nhất 1 ghế trống trên sơ đồ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await api.post<any, any>('/bookings', {
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats.map((s) => s.id),
        paymentMethod,
      });

      if (paymentMethod === 'VNPAY') {
        const paymentRes = await api.post<any, any>('/payments/create-vnpay-url', {
          bookingCode: booking.bookingCode,
        });

        if (paymentRes.paymentUrl) {
          toast.info('Đang chuyển tới cổng thanh toán VNPay...', `Mã đặt vé: #${booking.bookingCode}`);
          window.location.href = paymentRes.paymentUrl;
          return;
        }
      }

      toast.success(
        'Đặt vé thành công!',
        `Mã đặt vé #${booking.bookingCode} đã được lưu vào mục Vé của tôi.`,
      );
      navigate('/booking/my-tickets');
    } catch (err: any) {
      toast.error(
        'Ghế vừa được khách hàng khác chọn',
        err.message || 'Vui lòng chọn lại ghế trống khác trên sơ đồ.',
      );
      loadShowtimeSeats(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !showtime) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-[460px] rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const startTimeStr = new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-16">
      {/* 1. Exact NCC Auditorium Top Bar: Showtime Left + Countdown Right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ncc-outline h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đổi suất</span>
          </button>
          <span className="text-xs sm:text-sm font-bold text-white">
            Giờ chiếu: <strong className="font-mono text-[#FF7A63]">{startTimeStr}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadShowtimeSeats(true)}
            disabled={refreshing}
            title="Cập nhật lại sơ đồ ghế"
            aria-label="Cập nhật lại sơ đồ ghế"
            className="btn-ncc-outline h-9 w-9 rounded-lg inline-flex items-center justify-center cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#FF575F]' : ''}`}
              aria-hidden="true"
            />
          </button>

          <div className="px-3.5 py-1.5 rounded-lg border border-[#FF414D] bg-[#FF414D]/10 text-xs sm:text-sm font-semibold text-white">
            Thời gian chọn ghế:{' '}
            <strong className="font-mono text-[#FF575F]">
              {mm}:{ss}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Centered NCC Auditorium Stage */}
      <div className="rounded-2xl border border-white/10 bg-[#141923] p-4 sm:p-8 shadow-card">
        <CurvedScreen
          roomName={`${showtime.room?.theater?.name || 'CineCore'} — ${showtime.room?.name || 'Phòng chiếu'}`}
          screenType={showtime.room?.screenType || '2D Digital'}
        />
        <SeatMatrix seats={seats} />
      </div>

      {/* 3. NCC Bottom Summary & Payment Checkout Bar */}
      <div className="rounded-2xl border border-white/12 bg-[#1A1D23] p-5 sm:p-6 shadow-float space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-[#8B9BB4] font-semibold">
              Phim đang đặt vé
            </p>
            <h1 className="font-bold text-base sm:text-lg uppercase text-white">
              {showtime.movie?.title} ({showtime.movie?.ageRating || 'P'})
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Ghế đã chọn:{' '}
              {selectedSeats.length > 0 ? (
                <strong className="font-mono text-sky-400">
                  {selectedSeats.map((s) => `${s.seatRow}${s.seatNumber}`).join(', ')}
                </strong>
              ) : (
                <span className="text-[#8B9BB4]">Chưa chọn ghế</span>
              )}
            </p>
          </div>

          {/* Payment Method Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('VNPAY')}
              className={`h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 border transition-colors cursor-pointer ${
                paymentMethod === 'VNPAY'
                  ? 'bg-blue-600/20 border-blue-400 text-blue-200'
                  : 'bg-[#10141B] border-white/12 text-white/75 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-400" aria-hidden="true" />
              <span>VNPay QR / Thẻ ngân hàng</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 border transition-colors cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-[#10141B] border-white/12 text-white/75 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Thanh toán tại quầy vé</span>
            </button>
          </div>
        </div>

        {/* Bottom Price + Back / Thanh Toán Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-white/80">Tổng tiền:</span>
            <span className="font-mono font-extrabold text-xl sm:text-2xl text-[#FF575F]">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-ncc-outline h-11 px-7 rounded-full text-sm font-medium cursor-pointer"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting || selectedSeats.length === 0}
              className="btn-ncc-primary h-11 px-9 rounded-full text-sm font-semibold disabled:opacity-45 cursor-pointer"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
