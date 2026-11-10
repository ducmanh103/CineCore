import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Theater } from '../../types';
import { MapPin, Phone, Building2, MonitorPlay } from 'lucide-react';

export const TheatersPage: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, Theater[]>('/theaters')
      .then((res) => setTheaters(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>Hệ Thống Cụm Rạp Chiếu Phim</span>
        </div>
        <h1 className="font-display text-3xl font-black text-slate-900">5 Cụm Rạp Chuẩn Quốc Tế CineCore</h1>
        <p className="text-xs text-slate-500 mt-1">Được trang bị hệ thống phòng chiếu IMAX Laser, 3D Digital và ghế ngồi bọc da cao cấp</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Đang tải danh sách rạp...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theaters.map((t) => (
            <div
              key={t.id}
              className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-indigo-200 transition-all space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-black uppercase tracking-wider">
                    {t.city}
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 mt-2">{t.name}</h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{t.address}</span>
                </p>
                {t.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Hotline hỗ trợ: {t.phone}</span>
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mb-2.5 block uppercase tracking-wider">
                  Các phòng chiếu tại rạp ({t.rooms?.length || 0} phòng):
                </span>
                <div className="flex flex-wrap gap-2">
                  {t.rooms?.map((r) => (
                    <span
                      key={r.id}
                      className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                    >
                      {r.name} - <span className="text-indigo-600 font-bold">{r.screenType}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
