"use client";

import { useState } from "react";

const alertas = [
  {
    prioridad: "Alta prioridad",
    prioridadColor: "bg-red-100 text-red-600",
    dotColor: "bg-red-500",
    titulo: "Has superado tu presupuesto de comida en S/ 85.",
    detalle: "Lleva 128% de lo presupuestado esta semana.",
  },
  {
    prioridad: "Media prioridad",
    prioridadColor: "bg-yellow-100 text-yellow-700",
    dotColor: "bg-yellow-500",
    titulo: "Tus compras impulsivas aumentaron 35%.",
    detalle: "Intenta planificar mejor tus compras esta semana.",
  },
];

const recomendaciones = [
  {
    titulo: "Ahorra en delivery esta semana",
    detalle: "Si reduces tus pedidos por delivery, puedes ahorrar hasta S/ 90.",
    accion: "Aplicar",
  },
  {
    titulo: "Define un limite diario de gastos",
    detalle: "Establece un limite de S/ 25 diarios para mantener el control.",
    accion: "Configurar",
  },
  {
    titulo: "Estas cerca de tu meta mensual",
    detalle: "Te faltan S/ 180 para completar tu meta de ahorro.",
    accion: "Ver mi meta",
  },
];

export default function RecomendacionesPage() {
  const [showConsejo, setShowConsejo] = useState(true);

  return (
    <div className="flex flex-col px-5 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Recomendaciones</h1>
        <p className="text-sm text-[#6b6b6b]">
          Analisis de tus datos para ayudarte a tomar mejores decisiones
        </p>
      </div>

      {/* Estado financiero */}
      <div className="rounded-2xl bg-[#2d4a3e] text-white p-4">
        <p className="text-xs opacity-80 mb-1">Tu estado financiero</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold">Estable</span>
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <p className="text-xs opacity-70 mb-3">Vas bien, pero hay oportunidades por mejorar</p>
        <div className="flex gap-3">
          {[
            { label: "Riesgo alto", color: "bg-red-500" },
            { label: "Riesgo moderado", color: "bg-orange-400" },
            { label: "Estable", color: "bg-green-400", active: true },
            { label: "Excelente", color: "bg-[#1a7a3a]" },
          ].map(({ label, color, active }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className={`h-4 w-4 rounded-full ${color} ${active ? "ring-2 ring-white" : "opacity-60"}`} />
              <span className="text-[9px] opacity-70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consejo del dia */}
      {showConsejo && (
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 relative">
          <button
            onClick={() => setShowConsejo(false)}
            className="absolute top-3 right-3 text-[#999] hover:text-[#1a1a1a] text-lg"
          >
            x
          </button>
          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-3 py-1 mb-3">
            Consejo del dia
          </span>
          <p className="text-base font-bold text-[#1a1a1a] mb-2">
            Has gastado 28% mas en restaurantes esta semana
          </p>
          <p className="text-sm text-[#6b6b6b]">
            Si reduces tu gasto de comida fuera de casa podrias ahorrar aproximadamente $30
          </p>
        </div>
      )}

      {/* Alertas inteligentes */}
      <div>
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">Alertas inteligentes</h3>
        <div className="grid grid-cols-2 gap-3">
          {alertas.map((a, i) => (
            <div key={i} className="rounded-2xl border border-[#e0e0e0] bg-white p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className={`h-3 w-3 rounded-full ${a.dotColor}`} />
                <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${a.prioridadColor}`}>
                  {a.prioridad}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1a1a1a] mb-1">{a.titulo}</p>
              <p className="text-[11px] text-[#6b6b6b] mb-3 flex-1">{a.detalle}</p>
              <button className="rounded-full border border-[#2d4a3e] text-[#2d4a3e] text-xs py-1.5 hover:bg-[#2d4a3e] hover:text-white transition-colors">
                Ver recomendacion
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones personalizadas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Recomendaciones personalizadas</h3>
          <button className="text-xs text-[#6b6b6b] hover:text-[#2d4a3e]">Ver todas &gt;</button>
        </div>
        <div className="space-y-3">
          {recomendaciones.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#e0e0e0] bg-white p-4">
              <span className="h-3 w-3 rounded-full bg-[#2d4a3e] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a]">{r.titulo}</p>
                <p className="text-[11px] text-[#6b6b6b]">{r.detalle}</p>
              </div>
              <button className="flex-shrink-0 rounded-full border border-[#2d4a3e] text-[#2d4a3e] text-xs px-3 py-1.5 hover:bg-[#2d4a3e] hover:text-white transition-colors">
                {r.accion}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer motivacional */}
      <div className="rounded-2xl bg-[#e8e5de] p-5">
        <p className="text-sm font-bold text-[#2d4a3e]">Pequenas decisiones hoy, grandes resultados manana.</p>
      </div>
    </div>
  );
}
