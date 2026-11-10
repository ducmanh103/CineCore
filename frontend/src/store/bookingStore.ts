import { create } from 'zustand';
import { Seat, Showtime } from '../types';

interface BookingState {
  showtime: Showtime | null;
  selectedSeats: Seat[];
  totalPrice: number;
  setShowtime: (showtime: Showtime | null) => void;
  toggleSeat: (seat: Seat) => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  showtime: null,
  selectedSeats: [],
  totalPrice: 0,

  setShowtime: (showtime) => set({ showtime, selectedSeats: [], totalPrice: 0 }),

  toggleSeat: (seat) =>
    set((state) => {
      const isSelected = state.selectedSeats.some((s) => s.id === seat.id);
      let updated: Seat[];
      if (isSelected) {
        updated = state.selectedSeats.filter((s) => s.id !== seat.id);
      } else {
        // Tối đa 8 ghế một lượt đặt
        if (state.selectedSeats.length >= 8) {
          alert('Bạn chỉ có thể chọn tối đa 8 ghế trong một giao dịch.');
          return state;
        }
        updated = [...state.selectedSeats, seat];
      }

      const base = state.showtime ? Number(state.showtime.price) : 0;
      const total = updated.reduce(
        (sum, s) => sum + base + (s.seatType === 'VIP' ? 15000 : 0),
        0,
      );

      return { selectedSeats: updated, totalPrice: total };
    }),

  clearSelection: () => set({ selectedSeats: [], totalPrice: 0 }),
}));

