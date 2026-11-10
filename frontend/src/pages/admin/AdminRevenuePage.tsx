import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { DollarSign, CreditCard, Banknote } from 'lucide-react';

export const AdminRevenuePage: React.FC = () => {
  const [data, setData] = useState<{
    year: number;
    monthlyRevenue: number[];
    paymentDistribution: { cash: number; vnpay: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any, any>('/admin/revenue')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-slate-500 text-sm">Đang tải báo cáo doanh thu...</div>;
  }

  const months = [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
  ];

  const totalYearRevenue = data.monthlyRevenue.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Báo Cáo Phân Tích Doanh Thu Năm {data.year}</h1>
        <p className="text-xs text-slate-500 mt-1">Chi tiết doanh thu 12 tháng và phân bổ theo kênh thanh toán</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Doanh Thu Năm</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {totalYearRevenue.toLocaleString('vi-VN')} đ
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Cổng VNPay Sandbox</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {data.paymentDistribution.vnpay.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tiền Mặt Tại Quầy</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {data.paymentDistribution.cash.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 12-Month Table Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Doanh Thu 12 Tháng</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {months.map((m, idx) => (
            <div key={m} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-semibold">{m}</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {data.monthlyRevenue[idx].toLocaleString('vi-VN')} đ
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

