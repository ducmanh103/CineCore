import React, { useState } from 'react';
import { Seat } from '../../types';
import { useBookingStore } from '../../store/bookingStore';
import { toast } from '../../store/uiStore';
import { ZoomIn, ZoomOut, X, Armchair } from 'lucide-react';

interface SeatMatrixProps {
  seats: Seat[];
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({ seats }) => {
  const { selectedSeats, toggleSeat, clearSelection } = useBookingStore();
  const [compact, setCompact] = useState(false);

  // Group seats by Row
  const rowsMap: Record<string, Seat[]> = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.seatRow]) {
      rowsMap[seat.seatRow] = [];
    }
    rowsMap[seat.seatRow].push(seat);
  });

  const sortedRows = Object.keys(rowsMap).sort();

  const handlePickSweetSpotPair = () => {
    if (sortedRows.length === 0) return;
    const midRowIdx = Math.floor(sortedRows.length / 2);
    const orderedRows = [...sortedRows].sort(
      (a, b) =>
        Math.abs(sortedRows.indexOf(a) - midRowIdx) -
        Math.abs(sortedRows.indexOf(b) - midRowIdx),
    );

    for (const rName of orderedRows) {
      const rSeats = [...rowsMap[rName]].sort((a, b) => a.seatNumber - b.seatNumber);
      const midCol = (rSeats.length + 1) / 2;
      const candidates: [Seat, Seat, number][] = [];

      for (let i = 0; i < rSeats.length - 1; i++) {
        const s1 = rSeats[i];
        const s2 = rSeats[i + 1];
        if (
          s1.status === 'AVAILABLE' &&
          s2.status === 'AVAILABLE' &&
          s2.seatNumber - s1.seatNumber === 1
        ) {
          const dist = Math.abs((s1.seatNumber + s2.seatNumber) / 2 - midCol);
          candidates.push([s1, s2, dist]);
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a[2] - b[2]);
        const [best1, best2] = candidates[0];
        clearSelection();
        toggleSeat(best1);
        toggleSeat(best2);
        toast.success(
          'Đã gợi ý 2 ghế trung tâm đẹp nhất',
          `Ghế ${best1.seatRow}${best1.seatNumber}, ${best2.seatRow}${best2.seatNumber}`,
        );
        return;
      }
    }

    toast.warning(
      'Chưa tìm thấy cặp ghế liền kề trống',
      'Vui lòng chọn trực tiếp ghế trống trên sơ đồ.',
    );
  };

  const sizeClass = compact
    ? 'w-7 h-7 sm:w-8 sm:h-8 text-[10px]'
    : 'w-8 h-8 sm:w-10 sm:h-9 text-[11px]';

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      {/* Quick Helper Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={handlePickSweetSpotPair}
          className="btn-ncc-outline h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Armchair className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
          <span>Gợi ý 2 ghế trung tâm</span>
        </button>

        <button
          type="button"
          onClick={() => setCompact((c) => !c)}
          aria-label={compact ? 'Phóng to sơ đồ ghế' : 'Thu nhỏ sơ đồ ghế'}
          className="btn-ncc-outline h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          {compact ? (
            <>
              <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Phóng to</span>
            </>
          ) : (
            <>
              <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>

      {/* NCC Auditorium Seat Matrix (Coordinate Labels A1, A2... inside seats) */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-fit mx-auto flex flex-col items-center gap-2 py-2 px-2">
          {sortedRows.map((rowName) => {
            const rowSeats = rowsMap[rowName].sort(
              (a, b) => a.seatNumber - b.seatNumber,
            );
            const aisleAfterIndex =
              rowSeats.length >= 6 ? Math.floor(rowSeats.length / 2) - 1 : -1;

            return (
              <div key={rowName} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-5 text-center font-mono font-bold text-xs text-[#8B9BB4]"
                >
                  {rowName}
                </span>

                <div className="flex items-center gap-1.5">
                  {rowSeats.map((seat, idx) => {
                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    const isBooked = seat.status === 'BOOKED';
                    const isMyPending = seat.status === 'MY_PENDING';
                    const isPending = seat.status === 'PENDING' || isMyPending;
                    const isVip = seat.seatType === 'VIP';
                    const isCouple = seat.seatType === 'COUPLE';
                    const coord = `${seat.seatRow}${seat.seatNumber}`;

                    // Exact NCC Seat Color System:
                    // Standard: #252A34 / #2D3442 | VIP: #FF8413 (Orange) | Couple: #EF4444 (Red) | Selected: #2563EB (Blue) | Booked: dark X
                    let seatClass =
                      'bg-[#2D3442] hover:bg-[#3B4456] border border-white/10 text-white font-semibold cursor-pointer';

                    if (isVip) {
                      seatClass =
                        'bg-[#F97316] hover:bg-[#FB923C] border border-orange-300/40 text-white font-bold cursor-pointer';
                    } else if (isCouple) {
                      seatClass =
                        'bg-[#EF4444] hover:bg-[#F87171] border border-red-300/40 text-white font-bold cursor-pointer';
                    }

                    if (isSelected) {
                      seatClass =
                        'bg-[#2563EB] border-2 border-sky-300 text-white font-extrabold shadow-[0_0_16px_rgba(37,99,235,0.65)] scale-105 cursor-pointer';
                    } else if (isBooked) {
                      seatClass =
                        'bg-[#1E222B] border border-white/[0.06] text-gray-500 cursor-not-allowed';
                    } else if (isPending) {
                      seatClass =
                        'bg-yellow-500 text-slate-950 border border-yellow-300 cursor-not-allowed animate-pulse font-bold';
                    }

                    const statusDesc = isBooked
                      ? 'Đã đặt'
                      : isPending
                      ? 'Đang giữ chỗ'
                      : isSelected
                      ? 'Bạn đang chọn'
                      : 'Còn trống';

                    const tierDesc = isCouple
                      ? 'Ghế đôi (+30.000đ)'
                      : isVip
                      ? 'Ghế VIP (+15.000đ)'
                      : 'Ghế thường';

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          type="button"
                          disabled={isBooked || isPending}
                          aria-pressed={isSelected}
                          aria-label={`Ghế ${coord}, ${tierDesc}, ${statusDesc}`}
                          title={`Ghế ${coord} • ${tierDesc} (${statusDesc})`}
                          onClick={() => toggleSeat(seat)}
                          className={`rounded-md flex items-center justify-center font-mono transition-all duration-150 select-none ${sizeClass} ${seatClass}`}
                        >
                          {isBooked ? (
                            <X className="w-4 h-4 text-gray-500 stroke-[2.5]" aria-hidden="true" />
                          ) : (
                            <span>{coord}</span>
                          )}
                        </button>

                        {idx === aisleAfterIndex && (
                          <span
                            aria-hidden="true"
                            className="w-2.5 sm:w-4 inline-block shrink-0"
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <span
                  aria-hidden="true"
                  className="w-5 text-center font-mono font-bold text-xs text-[#8B9BB4]"
                >
                  {rowName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exact NCC Centered Seat Legend Row */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-white/90">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#1E222B] border border-white/10 inline-flex items-center justify-center text-gray-400 font-bold">
            X
          </span>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#2563EB] border border-sky-300 inline-block shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
          <span>Ghế bạn chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#2D3442] border border-white/10 inline-block" />
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#F97316] inline-block" />
          <span>Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EF4444] inline-block" />
          <span>Ghế đôi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-yellow-500 inline-block" />
          <span>Đang giữ chỗ</span>
        </div>
      </div>
    </div>
  );
};
