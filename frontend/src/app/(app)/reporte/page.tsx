"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getResumen, getTransacciones } from "@/lib/transacciones";

export default function ReportePage() {
  const [resumen, setResumen] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0, gastosPorCategoria: {} as Record<string, number> });
  const [totalTrans, setTotalTrans] = useState(0);

  useEffect(() => {
    setResumen(getResumen());
    setTotalTrans(getTransacciones().length);
  }, []);

  const ahorro = resumen.totalIngresos - resumen.totalGastos;
  const score = resumen.totalIngresos > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (resumen.totalGastos / resumen.totalIngresos) * 100 + 20)))
    : 0;

  const categoriasOrdenadas = Object.entries(resumen.gastosPorCategoria)
    .sort(([, a], [, b]) => b - a);

  const maxValor = categoriasOrdenadas.length > 0 ? categoriasOrdenadas[0][1] : 1;

  const perfilLabel = score >= 70 ? "Saludable" : score >= 40 ? "En observacion" : "En riesgo";
  const perfilDesc = score >= 70
    ? "Tus finanzas estan en buen estado."
    : score >= 40
      ? "Hay margen de mejora en tus habitos."
      : "Necesitas ajustar tus gastos.";

  return (
    <div className="flex flex-col px-5 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Reporte financiero</h1>

      {totalTrans === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c4c4c4] bg-white p-8 text-center">
          <div className="text-4xl mb-3 opacity-30">$</div>
          <p className="text-[#1a1a1a] font-medium mb-1">Sin datos para reportar</p>
          <p className="text-xs text-[#6b6b6b] mb-4">Agrega transacciones para ver tu reporte financiero</p>
          <Link href="/transacciones" className="text-sm text-[#2d4a3e] font-medium underline">
            Ir a Transacciones
          </Link>
        </div>
      ) : (
        <>
          {/* Salud financiera */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Salud financiera</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-3">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e8e5de" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={score >= 70 ? "#2d4a3e" : score >= 40 ? "#ca8a04" : "#ef4444"}
                    strokeWidth="10"
                    strokeDasharray={`${score * 3.14} ${100 * 3.14}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#2d4a3e]">{score}</span>
                  <span className="text-sm text-[#6b6b6b]">/100</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-[#1a1a1a]">{perfilLabel}</p>
              <p className="text-xs text-[#6b6b6b]">{perfilDesc}</p>
            </div>
          </div>

          {/* Tarjetas Ingresos / Gastos / Ahorro */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Ingresos", valor: resumen.totalIngresos, color: "bg-[#2d4a3e]", textColor: "text-green-600" },
              { label: "Gastos", valor: resumen.totalGastos, color: "bg-red-400", textColor: "text-red-500" },
              { label: "Ahorro", valor: ahorro, color: ahorro >= 0 ? "bg-[#2d4a3e]" : "bg-red-400", textColor: ahorro >= 0 ? "text-[#2d4a3e]" : "text-red-500" },
            ].map(({ label, valor, color, textColor }) => (
              <div key={label} className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-center">
                <p className="text-xs text-[#6b6b6b]">{label}</p>
                <p className={`text-sm font-bold mt-0.5 ${textColor}`}>${valor.toLocaleString()}</p>
                <span className={`inline-block mt-1 h-2 w-6 rounded-full ${color}`} />
              </div>
            ))}
          </div>

          {/* Gastos por categoria */}
          {categoriasOrdenadas.length > 0 && (
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Gastos por categoria</h3>
              <div className="space-y-3">
                {categoriasOrdenadas.map(([cat, monto]) => {
                  const pct = resumen.totalGastos > 0 ? (monto / resumen.totalGastos) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#1a1a1a] font-medium">{cat}</span>
                        <span className="text-[#6b6b6b]">${monto.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2.5 bg-[#e8e5de] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2d4a3e] rounded-full" style={{ width: `${(monto / maxValor) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/recomendaciones"
            className="block w-full rounded-full bg-[#2d4a3e] py-4 text-center text-white font-medium hover:bg-[#1e3529] transition-colors"
          >
            Ver recomendaciones IA
          </Link>
        </>
      )}
    </div>
  );
}
