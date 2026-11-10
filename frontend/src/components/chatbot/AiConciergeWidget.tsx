import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Clapperboard, ArrowRight } from 'lucide-react';
import { api } from '../../api/axios';
import { Link } from 'react-router-dom';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  movies?: any[];
}

export const AiConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Mình là CineCore AI. Bạn cần tìm phim gì, xem lịch chiếu rạp hay muốn hỏi về giá vé?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await api.post<any, any>('/chatbot/message', { message: userText });
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
          text: 'Xin lỗi bạn, trợ lý CineCore AI đang bận xử lý. Bạn có thể xem lịch chiếu ở trang chủ nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white shadow-luminous hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
          <span className="font-extrabold text-xs tracking-wider uppercase">CineCore AI Concierge</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[530px] rounded-3xl bg-white border border-slate-200/90 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm leading-none">
                  CineCore AI Assistant
                </h3>
                <span className="text-[10px] text-emerald-200 flex items-center gap-1 font-semibold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Trợ lý thông minh sẵn sàng
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-rose-500 text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>

                {/* Movie suggestions card */}
                {m.movies && m.movies.length > 0 && (
                  <div className="mt-2.5 space-y-2 w-full">
                    {m.movies.map((mv) => (
                      <Link
                        key={mv.id}
                        to={`/movies/${mv.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/80 transition-colors shadow-sm group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clapperboard className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {mv.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs italic bg-white px-3 py-2 rounded-xl w-fit border border-slate-200/60 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-300"></span>
                <span className="font-medium ml-1">CineCore AI đang tra cứu...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về phim Mai, giá vé, suất chiếu..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-500 text-white hover:opacity-95 disabled:opacity-40 transition-opacity shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
