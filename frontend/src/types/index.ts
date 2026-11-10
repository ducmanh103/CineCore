export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  avatarUrl?: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Movie {
  id: number;
  title: string;
  slug: string;
  description: string;
  duration: number;
  releaseDate: string;
  trailerUrl?: string;
  posterUrl?: string;
  bannerUrl?: string;
  ageRating: string;
  director?: string;
  cast?: string;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  genres?: { genre: Genre }[];
  showtimes?: Showtime[];
}

export interface Theater {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone?: string;
  rooms?: Room[];
}

export interface Room {
  id: number;
  name: string;
  screenType: string;
  totalSeats: number;
  theater?: Theater;
  seats?: Seat[];
}

export interface Seat {
  id: number;
  roomId: number;
  seatRow: string;
  seatNumber: number;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE';
  status?: 'AVAILABLE' | 'PENDING' | 'MY_PENDING' | 'BOOKED' | 'SELECTED';
}

export interface Showtime {
  id: number;
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  price: number;
  movie?: Movie;
  room?: Room;
}

export interface Ticket {
  id: number;
  showtimeId: number;
  seatId: number;
  bookingCode: string;
  price: number;
  status: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'EXPIRED';
  heldUntil?: string;
  seat: Seat;
  showtime: Showtime;
  createdAt: string;
}

