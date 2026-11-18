import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { Theater } from '../../types';
import { DEFAULT_LANDING_DATA } from '../../constants/defaultLandingData';
import { Skeleton } from '../../components/ui/Skeleton';
import { MapPin, Phone, Calendar, Armchair } from 'lucide-react';

export const TheatersPage: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  useEffect(() => {
    api
      .get<any, Theater[]>('/theaters')
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setTheaters(res);
        } else {
          setTheaters(DEFAULT_LANDING_DATA.theaters);
        }
      })
      .catch(() => setTheaters(DEFAULT_LANDING_DATA.theaters))
      .finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    theaters.forEach((t) => {
      if (t.city) set.add(t.city);
    });
    return Array.from(set);
  }, [theaters]);

  const filteredTheaters = useMemo(() => {
    if (selectedCity === 'ALL') return theaters;
    return theaters.filter((t) => t.city === selectedCity);
  }, [theaters, selectedCity]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 xl:py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase text-white">
              Giới thiệu hệ thống 5 cụm rạp CineCore
            </h1>
          </div>
          <div className="mt-2 ml-6 h-[3px] w-14 rounded-full bg-ncc-underline" />
        </div>

        {cities.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCity('ALL')}
              className={`shrink-0 h-9 px-4 rounded-md text-xs font-semibold cursor-pointer ${
                selectedCity === 'ALL' ? 'btn-ncc-primary' : 'btn-ncc-outline'
              }`}
            >
              Toàn quốc ({theaters.length})
            </button>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 h-9 px-4 rounded-md text-xs font-semibold cursor-pointer ${
                  selectedCity === city ? 'btn-ncc-primary' : 'btn-ncc-outline'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTheaters.map((t) => {
            const totalCapacity =
              t.rooms?.reduce((sum, r) => sum + (r.totalSeats || 48), 0) || 240;

            return (
              <article
                key={t.id}
                className="rounded-2xl border border-white/12 bg-[#141923] p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-card hover:border-white/25 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FF414D]/15 text-[#FF7A63] border border-[#FF414D]/30 text-xs font-bold">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {t.city}
                      </span>
                      <h2 className="font-bold text-xl text-white mt-2">
                        {t.name}
                      </h2>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-[#1A1D23] border border-white/10 text-right">
                      <span className="block text-[10px] uppercase text-[#8B9BB4] font-semibold">
                        Sức chứa
                      </span>
                      <span className="font-mono font-bold text-xs text-white inline-flex items-center gap-1">
                        <Armchair className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                        {totalCapacity} ghế
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-white/85">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#FF575F] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{t.address}</span>
                    </p>
                    {t.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                        <span>Điện thoại đặt vé đoàn: {t.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    {t.rooms && t.rooms.length > 0 ? (
                      t.rooms.map((r) => (
                        <span
                          key={r.id}
                          className="px-3 py-1 rounded-md bg-[#1A1D23] border border-white/10 text-xs font-medium text-white/90"
                        >
                          {r.name} • <strong className="text-[#FF7A63]">{r.screenType}</strong>
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-md bg-[#1A1D23] border border-white/10 text-xs font-semibold text-white">
                          Phòng 2D / 3D Digital
                        </span>
                        <span className="px-3 py-1 rounded-md bg-[#1A1D23] border border-white/10 text-xs font-semibold text-amber-300">
                          Phòng chiếu IMAX Laser & VIP
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Link
                    to={`/showtimes?theaterId=${t.id}`}
                    className="btn-ncc-primary w-full h-11 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <span>Xem lịch chiếu tại {t.name}</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
