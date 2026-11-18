import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Tag, BadgeDollarSign, Ticket } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AiConciergeWidget } from '../chatbot/AiConciergeWidget';

export const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isSeatSelection = pathname.startsWith('/booking/select-seat');

  // Global Scroll-Triggered Reveal Engine
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal-on-scroll'),
    );
    if (!elements.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const mobileTabs = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Lịch chiếu', path: '/showtimes', icon: Calendar, highlight: true },
    { label: 'Khuyến mãi', path: '/promotions', icon: Tag },
    { label: 'Giá vé', path: '/ticket-price', icon: BadgeDollarSign },
    { label: 'Vé của tôi', path: '/booking/my-tickets', icon: Ticket },
  ];

  const isPathActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#080B11] text-white relative selection:bg-[#FF385C] selection:text-white ${
        !isSeatSelection ? 'pb-16 md:pb-0' : ''
      }`}
    >
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[130] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#FF385C] focus:text-white focus:text-xs focus:font-bold shadow-float"
      >
        Chuyển tới nội dung chính
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 relative z-10">
        <Outlet />
      </main>

      {!isSeatSelection && <Footer />}

      {/* Mobile Quick Navigation Bar */}
      {!isSeatSelection && (
        <nav
          aria-label="Điều hướng nhanh trên di động"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-dock px-2 py-1.5"
        >
          <div className="grid grid-cols-5 items-center gap-1">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isPathActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
                    tab.highlight
                      ? active
                        ? 'btn-ncc-primary text-white'
                        : 'bg-[#FF385C]/15 text-[#FF7A63] border border-[#FF385C]/35'
                      : active
                      ? 'text-[#FF575F] bg-white/[0.08]'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="text-[10px] font-semibold mt-0.5 leading-none whitespace-nowrap">
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Floating CineCore Support Widget */}
      <AiConciergeWidget />
    </div>
  );
};
