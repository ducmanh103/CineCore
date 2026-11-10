import React from 'react';
import { Clapperboard, ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-white py-14 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Col */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-md">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl text-slate-900">
              Cine<span className="text-indigo-600">Core</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ sinh thái đặt vé xem phim công nghệ cao với trải nghiệm giao diện sáng sủa, mượt mà và cơ chế khóa ghế phân tán tức thì Zero Overbooking.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hotline: 1900 8888 (8:00 - 23:00)</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Khám Phá Phim</h4>
          <ul className="space-y-2.5 text-xs text-slate-500">
            <li><Link to="/movies" className="hover:text-indigo-600 transition-colors">Phim Đang Chiếu Hot</Link></li>
            <li><Link to="/movies" className="hover:text-indigo-600 transition-colors">Phim Sắp Khởi Chiếu</Link></li>
            <li><Link to="/showtimes" className="hover:text-indigo-600 transition-colors">Lịch Chiếu 7 Ngày Tới</Link></li>
            <li><Link to="/theaters" className="hover:text-indigo-600 transition-colors">5 Cụm Rạp IMAX Laser</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Chính Sách & Quy Định</h4>
          <ul className="space-y-2.5 text-xs text-slate-500">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Điều Khoản Sử Dụng CineCore</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Bảo Vệ Dữ Liệu Cá Nhân (PDPD)</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Quy Định Đổi / Hủy Vé</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cổng Thanh Toán VNPay Sandbox</a></li>
          </ul>
        </div>

        {/* Security Badge */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">An Toàn & Bảo Mật</h4>
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Nghị định 13/2023/NĐ-CP</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Thông tin email và họ tên được mã hóa chuẩn AES-256-GCM. Không lưu số thẻ hoặc thông tin thanh toán nhạy cảm.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
        <p>© 2026 CineCore Platform. Bản quyền thuộc về CineCore Vietnam.</p>
        <p className="flex items-center gap-1.5 text-slate-600">
          Xây dựng với <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> trên nền tảng NestJS 11 & React 19 Vite
        </p>
      </div>
    </footer>
  );
};
