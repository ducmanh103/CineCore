import React from 'react';
import { Clapperboard, ShieldCheck, Heart, Phone } from 'lucide-react';
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
              Cine<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500">Core</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ sinh thái đặt vé xem phim công nghệ cao với trải nghiệm giao diện sáng sủa, mượt mà .
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Khám Phá Phim</h4>
          <ul className="space-y-2.5 text-xs text-slate-500">
            <li><Link to="/movies" className="hover:text-indigo-600 transition-colors"> Phim Đang Chiếu</Link></li>
            <li><Link to="/showtimes" className="hover:text-indigo-600 transition-colors">Lịch Chiếu Trong Tuần</Link></li>
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
          </ul>
        </div>

        {/* Security Badge */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Thông tin liên hệ </h4>

          <ul className="space-y-2.5 text-xs text-slate-500">

            <li> Hotline: 1900 8888 (8:00 - 23:00)</li>
            <li>Email:emyeudienluc@epu.edu.vn</li>
            <li>Địa chỉ :235 Hoàng Quốc việt</li>
          </ul>
        </div>
      </div>


    </footer>
  );
};
