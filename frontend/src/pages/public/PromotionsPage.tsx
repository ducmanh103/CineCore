import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, X, Tag, Newspaper, BadgePercent } from 'lucide-react';

interface PromoItem {
  id: string;
  category: 'KHUYẾN MÃI' | 'TIN TỨC & SỰ KIỆN';
  date: string;
  headline: string;
  subHeadline: string;
  gradient: string;
  title: string;
  summary: string;
  details: string;
}

const ITEMS: PromoItem[] = [
  {
    id: 'p1',
    category: 'KHUYẾN MÃI',
    date: '18/11/2026',
    headline: '55.000Đ',
    subHeadline: '/ VÉ 2D U22',
    gradient: 'from-[#9F1239] via-[#E11D48] to-[#FB7185]',
    title: 'ĐỒNG GIÁ 55.000Đ/VÉ 2D DÀNH CHO THÀNH VIÊN U22 TỪ THỨ 2 ĐẾN THỨ 6',
    summary:
      'Ưu đãi đặc quyền dành cho học sinh, sinh viên và khán giả từ 22 tuổi trở xuống tại toàn bộ hệ thống phòng chiếu.',
    details:
      'Chương trình áp dụng đồng giá 55.000đ/vé 2D cho các suất chiếu từ Thứ Hai đến Thứ Sáu hàng tuần đối với khán giả từ 22 tuổi trở xuống sở hữu thẻ thành viên U22. Quý khách vui lòng xuất trình thẻ HSSV hoặc CCCD khi mua vé và kiểm soát vé vào phòng chiếu.',
  },
  {
    id: 'p2',
    category: 'KHUYẾN MÃI',
    date: '16/11/2026',
    headline: '-20.000Đ',
    subHeadline: 'VNPAY-QR',
    gradient: 'from-[#1E3A8A] via-[#2563EB] to-[#38BDF8]',
    title: 'ƯU ĐÃI VNPAY-QR: GIẢM NGAY 20.000Đ CHO ĐƠN ĐẶT VÉ TRỰC TUYẾN TỪ 150.000Đ',
    summary:
      'Thanh toán vé xem phim nhanh chóng qua ứng dụng ngân hàng và ví VNPay nhận ưu đãi giảm trực tiếp.',
    details:
      'Khách hàng đặt vé trực tuyến trên website CineCore và lựa chọn hình thức thanh toán qua cổng VNPay-QR sẽ nhận ưu đãi giảm trực tiếp 20.000đ cho hóa đơn từ 150.000đ trở lên. Vé điện tử kèm mã QR sẽ được gửi ngay vào mục Vé của tôi sau khi thanh toán hoàn tất.',
  },
  {
    id: 'p3',
    category: 'KHUYẾN MÃI',
    date: '15/11/2026',
    headline: '50.000Đ',
    subHeadline: 'THỨ 4 VUI VẺ',
    gradient: 'from-[#581C87] via-[#7C3AED] to-[#C084FC]',
    title: 'THỨ TƯ VUI VẺ HÀNG TUẦN — ĐỒNG GIÁ VÉ XEM PHIM 2D CHỈ 50.000Đ',
    summary:
      'Tận hưởng trọn vẹn mọi siêu phẩm điện ảnh vào ngày Thứ Tư hàng tuần với mức giá đồng nhất trên toàn hệ thống.',
    details:
      'Chương trình Thứ Tư Vui Vẻ áp dụng mức giá ưu đãi 50.000đ/vé 2D ghế thường và ghế VIP tại tất cả 5 cụm rạp CineCore trên toàn quốc. Áp dụng cho cả hình thức đặt vé online và mua trực tiếp tại quầy.',
  },
  {
    id: 'p4',
    category: 'KHUYẾN MÃI',
    date: '12/11/2026',
    headline: '-30%',
    subHeadline: 'COMBO BẮP NƯỚC',
    gradient: 'from-[#92400E] via-[#D97706] to-[#FBBF24]',
    title: 'COMBO BẮP NƯỚC ĐÔI TIẾT KIỆM 30% KHI ĐẶT KÈM VÉ XEM PHIM',
    summary:
      'Thưởng thức trọn vẹn cảm xúc điện ảnh với bắp rang caramel thơm giòn và 2 ly nước ngọt cỡ lớn giá ưu đãi.',
    details:
      'Áp dụng tại toàn bộ quầy Bắp nước của hệ thống rạp CineCore trên toàn quốc khi quý khán giả đặt trước trực tuyến hoặc mua kèm vé xem phim trong ngày.',
  },
  {
    id: 'p5',
    category: 'TIN TỨC & SỰ KIỆN',
    date: '10/11/2026',
    headline: 'IMAX®',
    subHeadline: 'TUẦN PHIM BOM TẤN',
    gradient: 'from-[#0F172A] via-[#0284C7] to-[#38BDF8]',
    title: 'TUẦN LỄ PHIM BOM TẤN IMAX LASER & ÂM THANH VÒM ĐA CHIỀU',
    summary:
      'Trở lại màn ảnh rộng với các siêu phẩm điện ảnh đoạt giải Oscar trong không gian phòng chiếu chuẩn quốc tế.',
    details:
      'Chào đón mùa lễ hội cuối năm, hệ thống rạp CineCore tổ chức Tuần lễ Phim Bom tấn IMAX với sự góp mặt của Dune: Hành Tinh Cát Phần Hai, Avatar cùng nhiều tác phẩm điện ảnh đặc sắc.',
  },
  {
    id: 'p6',
    category: 'TIN TỨC & SỰ KIỆN',
    date: '05/11/2026',
    headline: 'CINETOUR',
    subHeadline: 'GIAO LƯU ĐOÀN PHIM',
    gradient: 'from-[#881337] via-[#BE123C] to-[#F43F5E]',
    title: 'SUẤT CHIẾU SỚM ĐẶC BIỆT & GIAO LƯU CÙNG ĐOÀN LÀM PHIM VIỆT NAM',
    summary:
      'Cơ hội gặp gỡ trực tiếp đạo diễn và dàn diễn viên chính trong các suất chiếu sớm tối Thứ Sáu hàng tuần.',
    details:
      'Khán giả tham dự các suất chiếu sớm đặc biệt tại rạp sẽ có cơ hội giao lưu, chụp ảnh lưu niệm và nhận quà tặng poster có chữ ký từ đoàn làm phim.',
  },
];

export const PromotionsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'KHUYẾN MÃI' | 'TIN TỨC & SỰ KIỆN'>('ALL');
  const [selectedItem, setSelectedItem] = useState<PromoItem | null>(null);

  const visibleItems =
    filter === 'ALL' ? ITEMS : ITEMS.filter((i) => i.category === filter);

  return (
    <div className="pt-8 xl:pt-12 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2.5">
            <span className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white">
              Khuyến mãi & Tin tức điện ảnh
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {(
              [
                { id: 'ALL', label: 'Tất cả' },
                { id: 'KHUYẾN MÃI', label: 'Khuyến mãi' },
                { id: 'TIN TỨC & SỰ KIỆN', label: 'Tin tức & Sự kiện' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
                  filter === t.id ? 'btn-ncc-primary' : 'btn-ncc-outline'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group holo-card rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
            >
              <div>
                {/* Clean Graphic Banner Header */}
                <div
                  className={`h-44 w-full bg-gradient-to-br ${item.gradient} p-5 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500"
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/35 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase text-white">
                      {item.category === 'KHUYẾN MÃI' ? (
                        <Tag className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <Newspaper className="w-3 h-3" aria-hidden="true" />
                      )}
                      {item.category}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                      {item.headline}
                    </span>
                    <span className="ml-2 text-xs font-extrabold uppercase tracking-wider text-white/90">
                      {item.subHeadline}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <p className="text-xs font-mono text-[#8B9BB4] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF575F]" aria-hidden="true" />
                    <span>{item.date}</span>
                  </p>
                  <h2 className="font-bold text-sm sm:text-base text-white group-hover:text-[#FF575F] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8B9BB4] line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <span className="text-xs font-semibold text-white/80 group-hover:text-white inline-flex items-center gap-1">
                  <span>Xem chi tiết chương trình</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-xl rounded-2xl bg-[#121722] border border-white/15 overflow-hidden shadow-float"
          >
            <div
              className={`h-44 w-full bg-gradient-to-br ${selectedItem.gradient} p-6 flex flex-col justify-between relative`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/35 border border-white/20 text-xs font-bold text-white">
                  <BadgePercent className="w-3.5 h-3.5" aria-hidden="true" />
                  {selectedItem.category}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  aria-label="Đóng"
                  className="h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div>
                <span className="font-mono text-4xl font-black text-white">
                  {selectedItem.headline}
                </span>
                <span className="ml-2 text-sm font-extrabold uppercase text-white/90">
                  {selectedItem.subHeadline}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8B9BB4]">
                <span>Ngày áp dụng: {selectedItem.date}</span>
              </div>
              <h3 className="font-bold text-lg text-white leading-snug">
                {selectedItem.title}
              </h3>
              <p className="text-sm text-white/85 leading-relaxed">
                {selectedItem.details}
              </p>
              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="btn-ncc-outline h-10 px-5 rounded-full text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <Link
                  to="/showtimes"
                  onClick={() => setSelectedItem(null)}
                  className="btn-ncc-primary h-10 px-6 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mua vé ngay</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
