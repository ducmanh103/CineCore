import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Showtime } from '../../types';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Film, Ticket } from 'lucide-react';

export const ShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate 7 upcoming days
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState(dates[0]);

  useEffect(() => {
    setLoading(true);
    api
      .get<any, Showtime[]>(`/showtimes?date=${selectedDate}`)
      .then((res) => setShowtimes(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Hệ Thống Lịch Chiếu Toàn Quốc</span>
        </div>
        <h1 className="font-display text-3xl font-black text-slate-900">Lịch Chiếu Phim CineCore</h1>
        <p className="text-xs text-slate-500 mt-1">Chọn ngày chiếu để xem các suất chiếu tại tất cả các cụm rạp</p>
      </div>

      {/* Date Capsule Scroller */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 p-1.5 rounded-3xl bg-slate-100/80 border border-slate-200/80">
        {dates.map((dateStr) => {
          const d = new Date(dateStr);
          const isSelected = selectedDate === dateStr;
          const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' });
          const dayNum = d.getDate();
          const monthNum = d.getMonth() + 1;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center min-w-[80px] py-3 px-4 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-rose-500 text-white border-transparent shadow-luminous font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-extrabold">{dayName}</span>
              <span className="text-xl font-display font-black mt-0.5">{dayNum}</span>
              <span className="text-[10px] opacity-80 font-medium">Thg {monthNum}</span>
            </button>
          );
        })}
      </div>

      {/* Showtimes List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Đang tải danh sách suất chiếu...</div>
      ) : showtimes.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200">
          Không có suất chiếu nào được lên lịch trong ngày đã chọn.
        </div>
      ) : (
        <div className="space-y-4">
          {showtimes.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {st.movie?.posterUrl && (
                  <img
                    src={st.movie.posterUrl}
                    alt={st.movie.title}
                    className="w-16 h-22 object-cover rounded-2xl border border-slate-200 shadow-sm shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">{st.movie?.title}</h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-bold text-indigo-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {st.room?.theater?.name}
                    </span>
                    <span>•</span>
                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      {st.room?.name} ({st.room?.screenType})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="font-display font-black text-xl text-slate-900">
                    {new Date(st.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-amber-600 font-extrabold">
                    {Number(st.price).toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <Link
                  to={`/booking/select-seat/${st.id}`}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-luminous hover:opacity-95 transition-opacity"
                >
                  Chọn Ghế
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
