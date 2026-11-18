import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  CreditCard,
  Banknote,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

export const AdminRevenuePage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [data, setData] = useState<{
    year: number;
    monthlyRevenue: number[];
    paymentDistribution: { cash: number; vnpay: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<any, any>(`/admin/revenue?year=${selectedYear}`)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const totalYearRevenue = data.monthlyRevenue.reduce((a, b) => a + b, 0);
  const totalDist =
    data.paymentDistribution.vnpay + data.paymentDistribution.cash || 1;
  const vnpayPct = Math.round(
    (data.paymentDistribution.vnpay / totalDist) * 100,
  );
  const cashPct = 100 - vnpayPct;

  const maxMonthVal = Math.max(...data.monthlyRevenue, 1);

  const barData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: `Doanh thu ${data.year} (VNĐ)`,
        data: data.monthlyRevenue,
        backgroundColor: 'rgba(225, 29, 72, 0.85)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.95)',
        borderRadius: 10,
        maxBarThickness: 36,
      },
    ],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#151C2F',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#FCD34D',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx: any) =>
            ` ${Number(ctx.raw || 0).toLocaleString('vi-VN')} đ`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 11 } },
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (val: any) => {
            const num = Number(val);
            if (num === 0) return '0';
            if (num >= 1_000_000) {
              return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
            }
            if (num >= 1_000) {
              return `${Math.round(num / 1_000)}k`;
            }
            return `${num}`;
          },
        },
      },
    },
  };

  const doughnutData = {
    labels: ['VNPay QR / Thẻ', 'Tiền mặt tại quầy'],
    datasets: [
      {
        data: [data.paymentDistribution.vnpay, data.paymentDistribution.cash],
        backgroundColor: ['#6366F1', '#F59E0B'],
        borderColor: '#0E1320',
        borderWidth: 4,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header + Year Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
            Báo Cáo Phân Tích Doanh Thu Năm {data.year}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Biểu đồ tăng trưởng doanh thu 12 tháng và cơ cấu phương thức thanh toán
          </p>
        </div>

        <div className="inline-flex items-center gap-2 cinema-input rounded-2xl px-3.5 py-2.5 w-fit">
          <Calendar className="w-4 h-4 text-rose-400" aria-hidden="true" />
          <select
            value={selectedYear}
            aria-label="Chọn năm tài chính"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none cursor-pointer"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((yr) => (
              <option key={yr} value={yr} className="bg-[#0E1320]">
                Năm tài chính {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="cinema-card p-6 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">
              Tổng Doanh Thu Năm {data.year}
            </span>
            <div className="font-mono text-2xl font-black text-emerald-300 mt-1">
              {totalYearRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        <div className="cinema-card p-6 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">
              Cổng VNPay ({vnpayPct}%)
            </span>
            <div className="font-mono text-xl font-black text-slate-50 mt-1">
              {data.paymentDistribution.vnpay.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        <div className="cinema-card p-6 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">
              Tiền Mặt Tại Quầy ({cashPct}%)
            </span>
            <div className="font-mono text-xl font-black text-slate-50 mt-1">
              {data.paymentDistribution.cash.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-400/30 flex items-center justify-center">
            <Banknote className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Interactive Chart.js Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 cinema-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-base text-slate-50">
              Biểu Đồ Doanh Thu 12 Tháng
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Đơn vị: VNĐ</span>
          </div>
          <div className="h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="lg:col-span-4 cinema-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-display font-extrabold text-base text-slate-50">
              Tỷ Trọng Kênh Thanh Toán
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân bổ dòng tiền trực tuyến & tại rạp
            </p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#CBD5E1',
                      usePointStyle: true,
                      padding: 16,
                      font: { size: 11 },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Accessible Monthly Breakdown Table */}
      <div className="cinema-card rounded-3xl p-6 space-y-4">
        <h2 className="font-display font-extrabold text-base text-slate-50">
          Bảng Chi Tiết Doanh Thu Từng Tháng
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MONTHS.map((mLabel, idx) => {
            const val = data.monthlyRevenue[idx] || 0;
            const barWidth = Math.round((val / maxMonthVal) * 100);
            return (
              <div
                key={mLabel}
                className="p-3.5 rounded-2xl bg-[#0B0F1A] border border-white/[0.08] space-y-2"
              >
                <span className="text-[11px] font-bold text-slate-400 block">
                  {mLabel}
                </span>
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-100">
                  {val.toLocaleString('vi-VN')} đ
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
