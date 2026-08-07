"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const cashflowData = [
  { month: "Jun", value: 11200 },
  { month: "Jul", value: 12800 },
  { month: "Aug", value: 15388 },
  { month: "Sep", value: 13500 },
  { month: "Oct", value: 14200 },
  { month: "Nov", value: 13800 },
  { month: "Dec", value: 14900 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-[#2d4a3e]">${payload[0].value.toLocaleString()}</p>
      <p className="text-green-600 text-[10px]">▲ 2.5%</p>
      <p className="text-[#999] text-[10px]">{label} 16, 2024</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <main className="flex-1 px-5 py-6 space-y-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h2>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full bg-[#2d4a3e]" />
              <span className="text-xs text-[#6b6b6b]">Total balance</span>
            </div>
            <p className="text-lg font-bold text-[#1a1a1a]">$ 240,000</p>
            <p className="text-xs text-green-600 mt-1">2.5% vs last month</p>
          </div>
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full bg-[#2d4a3e]" />
              <span className="text-xs text-[#6b6b6b]">Monthly Income</span>
            </div>
            <p className="text-lg font-bold text-[#1a1a1a]">$ 10,000</p>
          </div>
        </div>

        {/* Cashflow chart */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1a1a1a]">Cashflow</h3>
            <button className="flex items-center gap-1 text-xs text-[#6b6b6b] border border-[#e0e0e0] rounded-lg px-2 py-1">
              Filter
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 3h10M3 6h6M5 9h2" />
              </svg>
            </button>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2d4a3e" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#2d4a3e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#999" }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2d4a3e"
                  strokeWidth={2}
                  fill="url(#cashflowGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-2 bg-[#f5f3ee]">
        <Link
          href="/transacciones"
          className="block w-full rounded-full bg-[#2d4a3e] py-4 text-center text-white font-medium hover:bg-[#1e3529] transition-colors"
        >
          Quiero realizar una transacción
        </Link>
      </div>
    </div>
  );
}
