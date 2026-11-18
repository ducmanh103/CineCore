import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Clapperboard, ArrowRight, MessageCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { Link, useLocation } from 'react-router-dom';
import { AgeBadge } from '../ui/AgeBadge';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  movies?: any[];
}

const QUICK_PROMPTS = [
  'Phim đang chiếu nổi bật?',
  'Lịch chiếu hôm nay',
  'Giá vé ghế VIP?',
];

export const AiConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Xin chào quý khách! Tư vấn viên trực tuyến CineCore có thể giúp bạn gợi ý phim hay, tra cứu giờ chiếu hoặc kiểm tra giá vé hôm nay.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const isSeatSelection = pathname.startsWith('/booking/select-seat');
  const positionClass = isSeatSelection
    ? 'bottom-24 left-3.5 lg:bottom-6 lg:left-6'
    : 'bottom-[74px] right-3.5 md:bottom-6 md:right-6';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const sendQuery = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setIsLoading(true);

    try {
      const res = await api.post<any, any>('/chatbot/message', { message: trimmed });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply,
          movies: res.movies,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Hiện kênh tư vấn đang bận trong giây lát. Quý khách có thể xem trực tiếp tại mục Lịch chiếu hoặc Giá vé trên thanh menu nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className={`fixed ${positionClass} z-40 transition-all`}>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở cửa sổ hỗ trợ đặt vé trực tuyến"
          className="group flex items-center justify-center sm:gap-2.5 w-11 h-11 sm:w-auto sm:h-auto sm:pl-3 sm:pr-4 sm:py-2.5 rounded-full bg-[#1A1D23]/95 backdrop-blur-2xl border border-white/15 text-white shadow-float hover:border-[#FF575F]/60 transition-all cursor-pointer"
        >
          <span className="w-8 h-8 sm:w-7 sm:h-7 rounded-full btn-ncc-primary text-white flex items-center justify-center">
            <MessageCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline font-display font-semibold text-xs">
            Hỗ trợ đặt vé
          </span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Tư vấn đặt vé trực tuyến"
          className="animate-scale-in w-[calc(100vw-2rem)] sm:w-[385px] h-[510px] max-h-[75vh] rounded-2xl action-panel flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 bg-[#141923] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl btn-ncc-primary text-white flex items-center justify-center">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-none">
                  Hỗ trợ đặt vé CineCore
                </h3>
                <span className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-medium mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Trực tuyến (08:00 – 23:00)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng cửa sổ hỗ trợ"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#10141B]"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'btn-ncc-primary text-white rounded-br-sm font-medium'
                      : 'bg-[#1A1D23] text-white/95 rounded-bl-sm border border-white/10'
                  }`}
                >
                  {m.text}
                </div>

                {m.movies && m.movies.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full max-w-[90%]">
                    {m.movies.map((mv) => (
                      <Link
                        key={mv.id}
                        to={`/movies/${mv.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#1A1D23] hover:bg-[#232832] border border-white/10 hover:border-[#FF575F]/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {mv.posterUrl ? (
                            <img
                              src={mv.posterUrl}
                              alt={mv.title}
                              className="w-8 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 rounded-lg bg-[#FF414D]/15 text-[#FF575F] flex items-center justify-center shrink-0">
                              <Clapperboard className="w-4 h-4" aria-hidden="true" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white group-hover:text-[#FF575F] transition-colors truncate">
                              {mv.title}
                            </p>
                            {mv.ageRating && (
                              <div className="mt-0.5">
                                <AgeBadge rating={mv.ageRating} size="sm" />
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight
                          className="w-3.5 h-3.5 text-white/50 group-hover:text-[#FF575F] group-hover:translate-x-0.5 transition-all shrink-0 mr-1"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1.5 text-white/80 text-xs bg-[#1A1D23] px-3.5 py-2.5 rounded-2xl w-fit border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF414D] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A63] animate-bounce [animation-delay:300ms]" />
                <span className="font-medium ml-1">Đang tìm thông tin...</span>
              </div>
            )}
          </div>

          <div className="px-3.5 pt-2.5 pb-1 bg-[#141923] border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => sendQuery(prompt)}
                className="shrink-0 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-[#FF414D]/20 hover:text-white border border-white/10 text-[11px] font-medium text-white/80 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-[#141923] flex items-center gap-2"
          >
            <input
              type="text"
              name="chatMessage"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập nội dung cần hỗ trợ..."
              aria-label="Nhập nội dung cần hỗ trợ"
              className="flex-1 px-3.5 py-2.5 rounded-xl cinema-input text-xs font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi tin nhắn"
              className="p-2.5 rounded-xl btn-ncc-primary text-white disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
