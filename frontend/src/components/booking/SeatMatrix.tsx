import React from 'react';
import { Seat } from '../../types';
import { useBookingStore } from '../../store/bookingStore';

interface SeatMatrixProps {
  seats: Seat[];
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({ seats }) => {
  const { selectedSeats, toggleSeat } = useBookingStore();

  // Gom nhóm ghế theo Hàng (Row)
  const rowsMap: Record<string, Seat[]> = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.seatRow]) {
      rowsMap[seat.seatRow] = [];
    }
    rowsMap[seat.seatRow].push(seat);
  });

  const sortedRows = Object.keys(rowsMap).sort();

  return (
    <div className="flex flex-col items-center">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 text-xs text-slate-700 bg-white px-6 py-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-white border-2 border-slate-300"></div>
          <span className="font-medium">Ghế Thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-50 border-2 border-amber-400"></div>
          <span className="font-semibold text-amber-800">Ghế VIP (+15k)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-indigo-600 to-rose-500 shadow-sm"></div>
          <span className="font-bold text-indigo-700">Đang Chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-500 animate-pulse"></div>
          <span className="font-medium text-amber-600">Đang Giữ (15p)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-slate-200 opacity-60"></div>
          <span className="font-medium text-slate-400">Đã Bán</span>
        </div>
      </div>

      {/* Seat Rows Matrix */}
      <div className="space-y-3 overflow-x-auto max-w-full pb-4 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        {sortedRows.map((rowName) => {
          const rowSeats = rowsMap[rowName].sort((a, b) => a.seatNumber - b.seatNumber);
          return (
            <div key={rowName} className="flex items-center gap-3">
              <span className="w-6 text-center font-black text-xs text-slate-400">
                {rowName}
              </span>

              <div className="flex items-center gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);
                  const isBooked = seat.status === 'BOOKED';
                  const isPending = seat.status === 'PENDING';
                  const isVip = seat.seatType === 'VIP';

                  let seatClass = 'bg-white hover:bg-indigo-50 border-2 border-slate-200 text-slate-700 cursor-pointer hover:border-indigo-400';

                  if (isVip) {
                    seatClass = 'bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 text-amber-900 cursor-pointer font-bold';
                  }

                  if (isSelected) {
                    seatClass = 'bg-gradient-to-r from-indigo-600 to-rose-500 text-white shadow-luminous scale-105 border-transparent cursor-pointer font-extrabold';
                  } else if (isBooked) {
                    seatClass = 'bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed opacity-50 line-through';
                  } else if (isPending) {
                    seatClass = 'bg-amber-500 text-white border-transparent cursor-not-allowed animate-pulse font-bold';
                  }

                  return (
                    <button
                      key={seat.id}
                      disabled={isBooked || isPending}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.seatRow}${seat.seatNumber} - ${isVip ? 'VIP (+15k)' : 'Thường'}`}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] transition-all duration-200 select-none shadow-sm ${seatClass}`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>

              <span className="w-6 text-center font-black text-xs text-slate-400">
                {rowName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
