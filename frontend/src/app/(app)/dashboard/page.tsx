"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getTransacciones, getResumen, type TransaccionGuardada } from "@/lib/transacciones";

export default function DashboardPage() {
  const [resumen, setResumen] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0, gastosPorCategoria: {} as Record<string, number> });
  const [ultimas, setUltimas] = useState<TransaccionGuardada[]>([]);

  useEffect(() => {
    setResumen(getResumen());
    setUltimas(getTransacciones().slice(-5).reverse());
  }, []);

  const topCategorias = Object.entries(resumen.gastosPorCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxCat = topCategorias.length > 0 ? topCategorias[0][1] : 1;

  return (
    <div className="flex flex-col">
      <main className="flex-1 px-5 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h2>
        </div>

        {/* Mascot Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2d4a3e] to-[#3f6354] p-6 text-white shadow-md flex items-center justify-between min-h-[150px]">
          <div className="z-10 max-w-[60%]">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-2">
              Asistente Vinnah 🐢
            </span>
            <h3 className="text-xl font-bold leading-tight">¡Hola, Ruth!</h3>
            <p className="text-xs text-white/85 mt-1.5 leading-relaxed">
              Tu salud financiera marcha sobre ruedas este mes. ¡Sigue así!
            </p>
          </div>
          <div className="relative -mr-4 -my-8 w-44 h-44 flex-shrink-0 drop-shadow-2xl hover:scale-105 transition-transform duration-300">
            <img
              src="/mascota_tortuga_1_left.png"
              alt="Mascota Tortuga Vinnah"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full bg-[#2d4a3e]" />
              <span className="text-xs text-[#6b6b6b]">Balance</span>
            </div>
            <p className={`text-lg font-bold ${resumen.balance >= 0 ? "text-[#1a1a1a]" : "text-red-500"}`}>
              ${resumen.balance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs text-[#6b6b6b]">Ingresos</span>
            </div>
            <p className="text-lg font-bold text-[#1a1a1a]">${resumen.totalIngresos.toLocaleString()}</p>
          </div>
        </div>

        {/* Gastos */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="text-xs text-[#6b6b6b]">Gastos totales</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a]">${resumen.totalGastos.toLocaleString()}</p>
          {resumen.totalIngresos > 0 && (
            <p className="text-xs text-[#6b6b6b] mt-1">
              {((resumen.totalGastos / resumen.totalIngresos) * 100).toFixed(0)}% de tus ingresos
            </p>
          )}
        </div>

        {/* Top categorias */}
        {topCategorias.length > 0 && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Gastos por categoria</h3>
            <div className="space-y-3">
              {topCategorias.map(([cat, monto]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1a1a1a] font-medium">{cat}</span>
                    <span className="text-[#6b6b6b]">${monto.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[#e8e5de] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2d4a3e] rounded-full"
                      style={{ width: `${(monto / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ultimas transacciones */}
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1a1a1a]">Ultimas transacciones</h3>
            <Link href="/transacciones" className="text-xs text-[#2d4a3e] font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          {ultimas.length === 0 ? (
            <p className="text-xs text-[#999] text-center py-4">
              Aun no tienes transacciones registradas
            </p>
          ) : (
            <div className="space-y-3">
              {ultimas.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{t.descripcion}</p>
                    <p className="text-[11px] text-[#999]">{t.categoria} · {t.fecha}</p>
                  </div>
                  <span className={`text-sm font-bold ml-3 ${t.tipo === "gasto" ? "text-red-500" : "text-green-600"}`}>
                    {t.tipo === "gasto" ? "-" : "+"}${t.monto.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="px-5 pb-24 lg:pb-8 pt-2">
        <Link
          href="/transacciones"
          className="block w-full rounded-full bg-[#2d4a3e] py-4 text-center text-white font-medium hover:bg-[#1e3529] transition-colors"
        >
          Agregar transaccion
        </Link>
      </div>
    </div>
  );
}
