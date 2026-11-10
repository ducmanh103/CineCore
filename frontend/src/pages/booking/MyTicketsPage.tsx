import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Ticket as TicketType } from '../../types';
import { Ticket, QrCode, Calendar, MapPin, CheckCircle2, Clock, Clapperboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, TicketType[]>('/bookings/my-tickets')
      .then((res) => setTickets(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Ticket className="w-4 h-4" />
          <span>Ví Điện Tử CineCore Pass</span>
        </div>
        <h1 className="font-display text-3xl font-black text-slate-900 flex items-center gap-2.5">
          <span>Vé Xem Phim Của Tôi</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Xuất trình mã vé hoặc quét mã QR trực tiếp tại quầy soát vé phòng chiếu
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Đang tải danh sách vé...</div>
      ) : tickets.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-card text-center text-slate-500 text-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Bạn chưa có vé xem phim nào</h3>
            <p className="text-xs text-slate-500">Hãy chọn ngay một bộ phim yêu thích để trải nghiệm CineCore nhé!</p>
          </div>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-luminous"
          >
            Khám phá phim ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => {
            const isBooked = t.status === 'BOOKED';
            const isPending = t.status === 'PENDING';

            return (
              <div
                key={t.id}
                className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                {/* Header Card */}
                <div className="p-6 border-b border-dashed border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono font-bold">
                        PASS #{t.bookingCode}
                      </span>
                      <h3 className="font-display font-extrabold text-lg text-slate-900 mt-1">
                        {t.showtime?.movie?.title}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        isBooked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isBooked ? 'ĐÃ XÁC NHẬN' : isPending ? 'CHỜ THANH TOÁN' : t.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cụm rạp:</span>
                      <span className="font-bold text-indigo-600">
                        {t.showtime?.room?.theater?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Phòng chiếu:</span>
                      <span className="font-bold text-slate-800">
                        {t.showtime?.room?.name} ({t.showtime?.room?.screenType})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated Notches */}
                <div className="relative flex items-center justify-between px-3 -my-3 z-10">
                  <div className="w-6 h-6 -ml-6 rounded-full bg-[#FAFAFD] border-r border-slate-200/90 shadow-inner"></div>
                  <div className="flex-1 border-b border-dashed border-slate-200"></div>
                  <div className="w-6 h-6 -mr-6 rounded-full bg-[#FAFAFD] border-l border-slate-200/90 shadow-inner"></div>
                </div>

                {/* Body Card */}
                <div className="p-6 flex items-center justify-between bg-slate-50/50">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {t.showtime?.startTime &&
                          new Date(t.showtime.startTime).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500 font-bold">Số ghế:</span>
                      <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-500 text-white text-xs font-black shadow-sm">
                        {t.seat?.seatRow}{t.seat?.seatNumber}
                      </span>
                      <span className="text-xs font-extrabold text-amber-700 ml-2">
                        {Number(t.price).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="w-18 h-18 rounded-2xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
