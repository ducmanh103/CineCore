import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { Ticket as TicketType } from '../../types';
import { QrCodeSvg } from '../../components/ui/QrCodeSvg';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../store/uiStore';
import {
  Ticket,
  Calendar,
  Copy,
  CreditCard,
  Maximize2,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type PassTab = 'ALL' | 'BOOKED' | 'PENDING';

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PassTab>('ALL');
  const [payingCode, setPayingCode] = useState<string | null>(null);
  const [zoomTicket, setZoomTicket] = useState<TicketType | null>(null);

  useEffect(() => {
    api
      .get<any, TicketType[]>('/bookings/my-tickets')
      .then((res) => setTickets(Array.isArray(res) ? res : []))
      .catch((err) => toast.error('Không thể tải ví vé', err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredTickets = useMemo(() => {
    if (activeTab === 'ALL') return tickets;
    return tickets.filter((t) => t.status === activeTab);
  }, [tickets, activeTab]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success('Đã sao chép mã vé', `#${code}`);
  };

  const handleResumeVnpay = async (bookingCode: string) => {
    setPayingCode(bookingCode);
    try {
      const res = await api.post<any, any>('/payments/create-vnpay-url', {
        bookingCode,
      });
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      toast.error('Không thể tạo liên kết thanh toán', err.message);
    } finally {
      setPayingCode(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF575F]">
              Lịch sử giao dịch & Vé điện tử
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Vé đã đặt của tôi
          </h1>
          <p className="text-xs sm:text-sm text-[#8B9BB4] mt-1">
            Vui lòng đưa mã QR trên vé điện tử cho nhân viên soát vé trước khi vào phòng chiếu
          </p>
        </div>

        {tickets.length > 0 && (
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
            {(
              [
                { id: 'ALL', label: `Tất cả (${tickets.length})` },
                {
                  id: 'BOOKED',
                  label: `Đã xác nhận (${tickets.filter((t) => t.status === 'BOOKED').length})`,
                },
                {
                  id: 'PENDING',
                  label: `Chờ thanh toán (${tickets.filter((t) => t.status === 'PENDING').length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-gradient text-white shadow-luminous'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="cinema-card rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-400/30 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-base">
              {tickets.length === 0
                ? 'Bạn chưa có vé xem phim nào'
                : 'Không có vé nào ở mục này'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8B9BB4]">
              Khám phá lịch chiếu hôm nay và chọn ngay bộ phim yêu thích của bạn!
            </p>
          </div>
          <Link
            to="/showtimes"
            className="btn-ncc-primary inline-flex items-center gap-2 h-10 px-6 rounded-full text-xs sm:text-sm font-semibold"
          >
            <span>Xem lịch chiếu ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((t) => {
            const isBooked = t.status === 'BOOKED';
            const isPending = t.status === 'PENDING';

            return (
              <article
                key={t.id}
                className="relative cinema-card rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                {/* Top Boarding Pass Section */}
                <div className="p-6 flex items-start gap-4">
                  {t.showtime?.movie?.posterUrl && (
                    <img
                      src={t.showtime.movie.posterUrl}
                      alt={t.showtime.movie.title}
                      className="w-16 aspect-[2/3] rounded-xl object-cover border border-white/15 shadow-md shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(t.bookingCode)}
                        title="Sao chép mã đặt vé"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 font-mono font-bold cursor-pointer"
                      >
                        <span>#{t.bookingCode}</span>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                      </button>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          isBooked
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35'
                            : isPending
                            ? 'bg-amber-500/15 text-amber-300 border-amber-400/35 animate-pulse'
                            : 'bg-white/[0.06] text-slate-400 border-white/10'
                        }`}
                      >
                        {isBooked ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>Đã xác nhận</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span>Chờ thanh toán</span>
                          </>
                        ) : (
                          <span>{t.status}</span>
                        )}
                      </span>
                    </div>

                    <h2 className="font-display font-extrabold text-lg text-slate-50 leading-snug truncate">
                      {t.showtime?.movie?.title}
                    </h2>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Cụm rạp
                        </span>
                        <span className="font-bold text-indigo-300 truncate block">
                          {t.showtime?.room?.theater?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Phòng chiếu
                        </span>
                        <span className="font-semibold text-slate-200 truncate block">
                          {t.showtime?.room?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perforated Cinema Tear Line matching #10141B canvas */}
                <div className="relative flex items-center justify-between px-3 -my-3 z-10 pointer-events-none">
                  <div className="w-6 h-6 -ml-6 rounded-full bg-[#10141B] border-r border-white/10" />
                  <div className="flex-1 border-b border-dashed border-white/15" />
                  <div className="w-6 h-6 -mr-6 rounded-full bg-[#10141B] border-l border-white/10" />
                </div>

                {/* Bottom Stub & High-Contrast White Quiet-Zone QR */}
                <div className="p-6 pt-5 bg-[#0A0E19]/90 flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
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

                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-xl bg-brand-gradient text-white font-mono text-xs font-bold shadow-luminous">
                        Ghế {t.seat?.seatRow}
                        {t.seat?.seatNumber}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {Number(t.price).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {isPending && (
                      <button
                        type="button"
                        disabled={payingCode === t.bookingCode}
                        onClick={() => handleResumeVnpay(t.bookingCode)}
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {payingCode === t.bookingCode
                            ? 'Đang kết nối...'
                            : 'Hoàn tất thanh toán VNPay'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Interactive Vector QR on Pure White Quiet-Zone Pad */}
                  <button
                    type="button"
                    onClick={() => setZoomTicket(t)}
                    aria-label={`Phóng to mã QR vé ${t.bookingCode}`}
                    className="group relative p-2 rounded-2xl bg-white shadow-md hover:ring-2 hover:ring-rose-500 transition-all shrink-0 cursor-pointer"
                  >
                    <QrCodeSvg value={`${t.bookingCode}-${t.id}`} size={68} />
                    <span className="absolute inset-0 rounded-2xl bg-slate-950/65 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* High-Brightness Gate-Scan QR Modal */}
      {zoomTicket && (
        <div
          className="fixed inset-0 z-[108] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setZoomTicket(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Mã soát vé ${zoomTicket.bookingCode}`}
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-sm rounded-3xl action-panel p-6 text-center space-y-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FF575F]">
                VÉ ĐIỆN TỬ CINECORE
              </span>
              <button
                type="button"
                onClick={() => setZoomTicket(null)}
                aria-label="Đóng cửa sổ QR"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Pure White Optical Scan Pad */}
            <div className="p-4 rounded-3xl bg-white shadow-2xl inline-block mx-auto">
              <QrCodeSvg
                value={`${zoomTicket.bookingCode}-${zoomTicket.id}`}
                size={210}
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-lg text-slate-50">
                {zoomTicket.showtime?.movie?.title}
              </h3>
              <p className="text-xs text-slate-400">
                {zoomTicket.showtime?.room?.theater?.name} • {zoomTicket.showtime?.room?.name}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-brand-gradient text-white font-mono text-xs font-bold shadow-luminous">
                  Ghế {zoomTicket.seat?.seatRow}
                  {zoomTicket.seat?.seatNumber}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-100 font-mono text-xs font-bold">
                  #{zoomTicket.bookingCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
