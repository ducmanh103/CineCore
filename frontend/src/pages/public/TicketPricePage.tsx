import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Award,
  AlertTriangle,
  Users,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { AgeBadge } from '../../components/ui/AgeBadge';

export const TicketPricePage: React.FC = () => {
  const [tab, setTab] = useState<'2D' | '3D_IMAX'>('2D');

  const pricing2D = [
    {
      timeSlot: 'Trước 12:00 (Suất sáng)',
      weekdayStd: '55.000đ',
      weekdayVip: '65.000đ',
      weekdayCouple: '140.000đ',
      weekendStd: '70.000đ',
      weekendVip: '80.000đ',
      weekendCouple: '170.000đ',
    },
    {
      timeSlot: 'Từ 12:00 đến trước 17:00',
      weekdayStd: '70.000đ',
      weekdayVip: '75.000đ',
      weekdayCouple: '160.000đ',
      weekendStd: '80.000đ',
      weekendVip: '85.000đ',
      weekendCouple: '180.000đ',
    },
    {
      timeSlot: 'Từ 17:00 đến trước 23:00 (Giờ vàng)',
      weekdayStd: '80.000đ',
      weekdayVip: '85.000đ',
      weekdayCouple: '180.000đ',
      weekendStd: '90.000đ',
      weekendVip: '95.000đ',
      weekendCouple: '200.000đ',
    },
    {
      timeSlot: 'Từ 23:00 trở đi (Suất khuya)',
      weekdayStd: '65.000đ',
      weekdayVip: '70.000đ',
      weekdayCouple: '150.000đ',
      weekendStd: '75.000đ',
      weekendVip: '80.000đ',
      weekendCouple: '170.000đ',
    },
  ];

  const pricing3D = [
    {
      timeSlot: 'Trước 12:00 (3D / IMAX Laser)',
      weekdayStd: '85.000đ',
      weekdayVip: '100.000đ',
      weekdayCouple: '210.000đ',
      weekendStd: '110.000đ',
      weekendVip: '125.000đ',
      weekendCouple: '260.000đ',
    },
    {
      timeSlot: 'Từ 12:00 đến trước 17:00',
      weekdayStd: '100.000đ',
      weekdayVip: '115.000đ',
      weekdayCouple: '240.000đ',
      weekendStd: '130.000đ',
      weekendVip: '145.000đ',
      weekendCouple: '300.000đ',
    },
    {
      timeSlot: 'Từ 17:00 đến trước 23:00 (Giờ vàng)',
      weekdayStd: '120.000đ',
      weekdayVip: '135.000đ',
      weekdayCouple: '280.000đ',
      weekendStd: '145.000đ',
      weekendVip: '160.000đ',
      weekendCouple: '330.000đ',
    },
  ];

  const activeRows = tab === '2D' ? pricing2D : pricing3D;

  return (
    <div className="pt-8 xl:pt-12 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-[1200px] space-y-10">
        {/* NCC Centered Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white">
            Giá vé xem phim
          </h1>
          <p className="text-sm text-[#8B9BB4]">
            Áp dụng thống nhất trên hệ thống phòng chiếu tiêu chuẩn Quốc gia CineCore
          </p>

          {/* 2D vs 3D / IMAX Switcher */}
          <div className="pt-3 inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('2D')}
              className={`h-10 px-6 rounded-full text-sm font-semibold cursor-pointer ${
                tab === '2D' ? 'btn-ncc-primary' : 'btn-ncc-outline'
              }`}
            >
              Bảng giá vé 2D Digital
            </button>
            <button
              type="button"
              onClick={() => setTab('3D_IMAX')}
              className={`h-10 px-6 rounded-full text-sm font-semibold cursor-pointer ${
                tab === '3D_IMAX' ? 'btn-ncc-primary' : 'btn-ncc-outline'
              }`}
            >
              Bảng giá vé 3D & IMAX Laser
            </button>
          </div>
        </div>

        {/* Interactive Pricing Matrix Table */}
        <div className="rounded-2xl border border-white/12 bg-[#141923] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#1A1D23] border-b border-white/12 text-white">
                  <th rowSpan={2} className="p-4 font-bold border-r border-white/10 min-w-[190px]">
                    Thời gian chiếu
                  </th>
                  <th
                    colSpan={3}
                    className="p-3 text-center font-bold border-b border-r border-white/10 text-sky-300"
                  >
                    Từ Thứ 2 đến Thứ 5
                  </th>
                  <th
                    colSpan={3}
                    className="p-3 text-center font-bold border-b border-white/10 text-[#FF7A63]"
                  >
                    Thứ 6, Thứ 7, Chủ Nhật & Ngày Lễ
                  </th>
                </tr>
                <tr className="bg-[#1A1D23]/80 border-b border-white/12 text-xs text-[#8B9BB4]">
                  <th className="py-2.5 px-3 text-center font-semibold">Ghế thường</th>
                  <th className="py-2.5 px-3 text-center font-semibold text-amber-300">
                    Ghế VIP
                  </th>
                  <th className="py-2.5 px-3 text-center font-semibold text-pink-300 border-r border-white/10">
                    Ghế đôi
                  </th>
                  <th className="py-2.5 px-3 text-center font-semibold">Ghế thường</th>
                  <th className="py-2.5 px-3 text-center font-semibold text-amber-300">
                    Ghế VIP
                  </th>
                  <th className="py-2.5 px-3 text-center font-semibold text-pink-300">
                    Ghế đôi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {activeRows.map((row) => (
                  <tr key={row.timeSlot} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-semibold text-white border-r border-white/10">
                      {row.timeSlot}
                    </td>
                    <td className="p-3.5 text-center font-mono text-white/90">
                      {row.weekdayStd}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-amber-300">
                      {row.weekdayVip}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-pink-300 border-r border-white/10">
                      {row.weekdayCouple}
                    </td>
                    <td className="p-3.5 text-center font-mono text-white/90">
                      {row.weekendStd}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-amber-300">
                      {row.weekendVip}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-pink-300">
                      {row.weekendCouple}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3.5 bg-[#1A1D23] border-t border-white/10 text-xs sm:text-sm font-semibold text-amber-300">
            * Đối với phim có thời lượng từ 150 phút trở lên: phụ thu 10.000 VNĐ / vé.
          </div>
        </div>

        {/* U22 & Priority Audience Cards (Exact NCC Policies) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#141923] p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#FF414D]/15 text-[#FF575F] border border-[#FF414D]/30">
                <Award className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 className="font-bold text-lg text-white">
                Ưu đãi thẻ thành viên U22 (Từ 22 tuổi trở xuống)
              </h2>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              Đồng giá <strong className="text-[#FF575F] font-mono text-base">55.000đ / vé 2D</strong>{' '}
              cho tất cả các suất chiếu từ <strong>Thứ 2 đến Thứ 6</strong> dành cho học sinh, sinh viên và công dân từ 22 tuổi trở xuống.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#8B9BB4]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Đăng ký tài khoản online trên CineCore và xuất trình CCCD / Thẻ HSSV để kích hoạt.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Áp dụng cho ghế thường & ghế VIP (không áp dụng ghế đôi, ngày Lễ/Tết và suất chiếu sớm).</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141923] p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30">
                <Users className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 className="font-bold text-lg text-white">
                Chính sách vé đối tượng khán giả ưu tiên
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/85 leading-relaxed">
              <li>
                • <strong className="text-amber-300">Giảm 20% giá vé:</strong> Trẻ em (dưới 16 tuổi), người cao tuổi (từ đủ 60 tuổi trở lên), người có công với cách mạng, người có hoàn cảnh đặc biệt khó khăn.
              </li>
              <li>
                • <strong className="text-amber-300">Giảm 50% giá vé:</strong> Người khuyết tật nặng.
              </li>
              <li>
                • <strong className="text-emerald-300">Miễn phí 100%:</strong> Người khuyết tật đặc biệt nặng và trẻ em dưới 0.7m đi kèm người lớn.
              </li>
            </ul>
          </div>
        </div>

        {/* Age Classification Regulations (P, K, T13, T16, T18) */}
        <div className="rounded-2xl border border-white/10 bg-[#141923] p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
            <AlertTriangle className="w-5 h-5 text-[#FF575F]" aria-hidden="true" />
            <h2>Quy định độ tuổi xem phim tại rạp</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {(
              [
                { r: 'P', desc: 'Phổ biến đến người xem ở mọi độ tuổi.' },
                { r: 'K', desc: 'Dưới 13 tuổi cần đi cùng cha, mẹ hoặc người giám hộ.' },
                { r: 'T13', desc: 'Phổ biến đến khán giả từ đủ 13 tuổi trở lên (13+).' },
                { r: 'T16', desc: 'Phổ biến đến khán giả từ đủ 16 tuổi trở lên (16+).' },
                { r: 'T18', desc: 'Phổ biến đến khán giả từ đủ 18 tuổi trở lên (18+).' },
              ] as const
            ).map((item) => (
              <div
                key={item.r}
                className="p-3.5 rounded-xl bg-[#1A1D23] border border-white/10 space-y-2"
              >
                <AgeBadge rating={item.r} />
                <p className="text-[#8B9BB4] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#8B9BB4]">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#FF575F]" aria-hidden="true" />
              <span>Liên hệ đặt vé tập thể & thuê phòng chiếu: <strong className="text-white">(024) 3514.8647 — 1900 8888</strong></span>
            </span>

            <Link
              to="/showtimes"
              className="btn-ncc-primary h-10 px-6 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0"
            >
              <Ticket className="w-4 h-4" aria-hidden="true" />
              <span>Chọn suất chiếu & Mua vé ngay</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
