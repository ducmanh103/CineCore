import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { CurvedScreen } from '../../components/booking/CurvedScreen';
import { SeatMatrix } from '../../components/booking/SeatMatrix';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { Showtime, Seat } from '../../types';
import { ArrowLeft, CreditCard, ShieldCheck, Clock, MapPin, Zap } from 'lucide-react';

export const SelectSeatPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [showtime, setShowtimeState] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedSeats, totalPrice, setShowtime, clearSelection } = useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!showtimeId) return;
    setLoading(true);

    api
      .get<any, { showtime: Showtime; seats: Seat[] }>(`/showtimes/${showtimeId}/seats`)
      .then((res) => {
        setShowtimeState(res.showtime);
        setSeats(res.seats);
        setShowtime(res.showtime);
      })
      .catch((err) => {
        alert(err.message || 'Không thể tải phòng chiếu.');
        navigate(-1);
      })
      .finally(() => setLoading(false));

    return () => {
      clearSelection();
    };
  }, [showtimeId, navigate, setShowtime, clearSelection]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để tiến hành đặt vé.');
      navigate('/auth/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Tạo đơn đặt vé (Khóa ghế phân tán trên Redis + PostgreSQL PENDING)
      const booking = await api.post<any, any>('/bookings', {
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats.map((s) => s.id),
        paymentMethod: 'VNPAY',
      });

      // 2. Tạo link VNPay Sandbox
      const paymentRes = await api.post<any, any>('/payments/create-vnpay-url', {
        bookingCode: booking.bookingCode,
      });

      // 3. Chuyển hướng tới cổng VNPay Sandbox
      if (paymentRes.paymentUrl) {
        window.location.href = paymentRes.paymentUrl;
      } else {
        navigate('/booking/my-tickets');
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi giữ chỗ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !showtime) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500 text-sm">
        Đang đồng bộ trạng thái ghế thời gian thực cùng CineCore...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-36">
      {/* Header Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại lịch chiếu</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">{showtime.movie?.title}</h1>
          <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{showtime.room?.theater?.name} • {showtime.room?.name} ({showtime.room?.screenType})</span>
          </p>
        </div>

        <div className="text-left sm:text-right p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Khung Giờ Chiếu</span>
          <div className="font-display font-black text-xl text-slate-900 mt-0.5">
            {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <span className="text-xs text-slate-500">
            Ngày {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Screen & Seat Matrix */}
      <div className="py-4">
        <CurvedScreen />
        <SeatMatrix seats={seats} />
      </div>

      {/* Sticky Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl p-4 sm:p-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Ghế Đang Chọn:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedSeats.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Nhấp vào ghế trống ở trên để chọn</span>
                ) : (
                  selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black shadow-sm"
                    >
                      {s.seatRow}{s.seatNumber}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Tổng Giá Vé</span>
              <span className="font-display font-black text-2xl text-rose-600">
                {totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || selectedSeats.length === 0}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-luminous hover:opacity-95 transition-opacity disabled:opacity-40 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Khóa Ghế...' : 'Thanh Toán VNPay'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
