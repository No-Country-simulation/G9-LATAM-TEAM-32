"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const gastosCategoria = [
  { categoria: "Alimentación", valor: 95 },
  { categoria: "Obligaciones", valor: 80 },
  { categoria: "Ocio", valor: 55 },
  { categoria: "Servicios", valor: 45 },
  { categoria: "Salud", valor: 25 },
  { categoria: "Transporte", valor: 20 },
  { categoria: "Educación", valor: 15 },
  { categoria: "Vivienda", valor: 12 },
];

const tabs = ["Pasado", "Actual", "Nuevo"] as const;
type Tab = (typeof tabs)[number];

const patrones = [
  { color: "bg-[#2d4a3e]", texto: "Tus Gastos en fin de semana bajaron 15% este mes" },
  { color: "bg-red-400", texto: "Tus Gastos en fin de semana subieron 25% este mes" },
  { color: "bg-[#2d4a3e]", texto: "Tus Gastos en fin de semana subieron 25% este mes" },
];

export default function ReportePage() {
  const [tab, setTab] = useState<Tab>("Actual");

  return (
    <div className="flex flex-col px-5 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Reporte financiero</h1>

      {/* Tabs */}
      <div className="flex items-center rounded-full border border-[#e0e0e0] bg-white overflow-hidden">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[#2d4a3e] text-white rounded-full"
                : "text-[#1a1a1a]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Salud financiera */}
      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Salud financiera</h3>
        <div className="flex flex-col items-center">
          {/* Donut */}
          <div className="relative w-32 h-32 mb-3">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e8e5de" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#2d4a3e"
                strokeWidth="10"
                strokeDasharray={`${78 * 3.14} ${100 * 3.14}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#2d4a3e]">78</span>
              <span className="text-sm text-[#6b6b6b]">/100</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-[#1a1a1a]">Saludable</p>
          <p className="text-xs text-[#6b6b6b]">Tus finanzas están en buen estado.</p>
        </div>
      </div>

      {/* Tarjetas Ingresos / Gastos / Ahorro */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ingresos", valor: "$12,000", color: "bg-[#2d4a3e]" },
          { label: "Gastos", valor: "$376.31", color: "bg-red-400" },
          { label: "Ahorro", valor: "$376.31", color: "bg-[#2d4a3e]" },
        ].map(({ label, valor, color }) => (
          <div key={label} className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-center">
            <p className="text-xs text-[#6b6b6b]">{label}</p>
            <p className="text-sm font-bold text-[#1a1a1a] mt-0.5">{valor}</p>
            <span className={`inline-block mt-1 h-2 w-6 rounded-full ${color}`} />
          </div>
        ))}
      </div>

      {/* Gastos por categoría */}
      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Gastos por categoría</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gastosCategoria} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="categoria"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#1a1a1a" }}
                width={85}
              />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={14}>
                {gastosCategoria.map((_, i) => (
                  <Cell key={i} fill={i < 2 ? "#2d4a3e" : "#5a8a6e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patrones detectados */}
      <div>
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Patrones detectados</h3>
        <div className="grid grid-cols-3 gap-3">
          {patrones.map((p, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <span className={`h-5 w-5 rounded-full ${p.color}`} />
              <p className="text-[11px] text-[#6b6b6b] leading-tight">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/recomendaciones"
        className="block w-full rounded-full bg-[#2d4a3e] py-4 text-center text-white font-medium hover:bg-[#1e3529] transition-colors"
      >
        Ver recomendaciones
      </Link>
    </div>
  );
}
