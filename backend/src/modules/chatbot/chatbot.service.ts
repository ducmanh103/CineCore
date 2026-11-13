import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MovieStatus } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly geminiApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  async processMessage(message: string, userId?: number) {
    const cleanMsg = message.trim().toLowerCase();

    // 1. Lấy dữ liệu phim và suất chiếu hiện hành (có fault-tolerant fallback)
    let nowShowingMovies: any[] = [];
    if (this.prisma.isConnected()) {
      try {
        nowShowingMovies = await this.prisma.movie.findMany({
          where: { status: MovieStatus.NOW_SHOWING },
          take: 6,
        });
      } catch {
        nowShowingMovies = [];
      }
    }

    if (!nowShowingMovies.length) {
      nowShowingMovies = [
        { id: 1, title: 'Kung Fu Panda 4', duration: 94, ageRating: 'P' },
        { id: 2, title: 'Dune: Phần 2', duration: 166, ageRating: 'T16' },
        { id: 3, title: 'Mai', duration: 131, ageRating: 'T18' },
        { id: 4, title: 'Quật Mộ Trùng Ma', duration: 134, ageRating: 'T18' },
      ];
    }

    let suggestedMovies: any[] = [];
    let suggestedShowtimes: any[] = [];
    let userBookings: any[] = [];

    // Nếu người dùng đã đăng nhập, lấy vé gần đây
    if (userId && this.prisma.isConnected()) {
      try {
        userBookings = await this.prisma.ticket.findMany({
          where: { userId },
          include: {
            showtime: { include: { movie: true, room: { include: { theater: true } } } },
            seat: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        });
      } catch {
        userBookings = [];
      }
    }

    // 2. Tìm kiếm phim khớp trong tin nhắn
    for (const movie of nowShowingMovies) {
      if (cleanMsg.includes(movie.title.toLowerCase())) {
        suggestedMovies.push(movie);
      }
    }

    if (!suggestedMovies.length && (cleanMsg.includes('phim') || cleanMsg.includes('xem gì') || cleanMsg.includes('chiếu'))) {
      suggestedMovies = nowShowingMovies.slice(0, 3);
    }

    // 3. Nếu có Gemini API Key thì gọi Gemini, nếu không thì fallback offline thông minh
    if (this.geminiApiKey) {
      try {
        const reply = await this.callGeminiApi(message, nowShowingMovies);
        return {
          reply,
          movies: suggestedMovies,
          showtimes: suggestedShowtimes,
          userBookings,
        };
      } catch (err) {
        this.logger.warn(`Gemini API gặp sự cố, chuyển sang Offline Fallback: ${err.message}`);
      }
    }

    // Offline Smart Fallback (Tiếng Việt thân thiện)
    let reply = 'Chào bạn! Mình là Trợ lý ảo CineCore. Mình có thể giúp bạn tra cứu phim đang chiếu, suất chiếu tại các rạp và quản lý vé đã đặt.';

    if (cleanMsg.includes('giá vé') || cleanMsg.includes('bao nhiêu')) {
      reply = 'Giá vé tiêu chuẩn tại CineCore từ 90.000đ - 120.000đ tùy khung giờ và cụm rạp. Ghế VIP có phụ thu 15.000đ/vé bạn nhé!';
    } else if (cleanMsg.includes('rạp') || cleanMsg.includes('địa chỉ')) {
      reply = 'CineCore hiện có 5 cụm rạp hiện đại: Vincom Bà Triệu, Royal City (Hà Nội), Landmark 81, Thảo Điền (TP.HCM) và Dragon City (Đà Nẵng).';
    } else if (suggestedMovies.length > 0) {
      reply = `Dưới đây là một số phim đang chiếu rất được yêu thích tại rạp, bạn có thể bấm xem chi tiết hoặc đặt vé ngay nhé:`;
    } else if (cleanMsg.includes('vé của tôi') || cleanMsg.includes('lịch sử')) {
      reply = userId
        ? 'Dưới đây là các vé gần nhất của bạn. Bạn có thể mở mục "Vé của tôi" để xem mã QR vào phòng chiếu nhé!'
        : 'Bạn vui lòng đăng nhập tài khoản để mình hiển thị vé xem phim của bạn nhé!';
    }

    return {
      reply,
      movies: suggestedMovies,
      showtimes: suggestedShowtimes,
      userBookings,
    };
  }

  private async callGeminiApi(userMessage: string, movies: any[]): Promise<string> {
    const context = movies.map((m) => `- ${m.title} (${m.duration} phút, ${m.ageRating})`).join('\n');
    const prompt = `Bạn là Trợ lý AI Concierge thông minh và lịch sự của hệ thống rạp chiếu phim CineCore Việt Nam.
Danh sách phim đang chiếu tại hệ thống:
${context}

Khách hàng hỏi: "${userMessage}"
Hãy trả lời ngắn gọn, lịch sự, thân thiện bằng tiếng Việt (dưới 100 từ).`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'CineCore luôn sẵn sàng phục vụ bạn!';
  }
}

