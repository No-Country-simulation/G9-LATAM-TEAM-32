"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTransacciones } from "@/lib/transacciones";
import { api, ResultadoAnalisis } from "@/lib/api";

const perfilConfig: Record<string, { label: string; emoji: string; color: string; bgCard: string; descripcion: string; mascot: string }> = {
  "Saludable": { label: "Saludable", emoji: "", color: "bg-green-400", bgCard: "bg-[#2d4a3e]", descripcion: "Tus finanzas estan equilibradas. Buen control de gastos.", mascot: "/tortuga_excelente_left.png" },
  "En observacion": { label: "En observacion", emoji: "", color: "bg-orange-400", bgCard: "bg-amber-800", descripcion: "Tus gastos estan cerca del limite. Modera consumos no esenciales.", mascot: "/tortuga_riesgo_moderado_left.png" },
  "En riesgo": { label: "En riesgo", emoji: "", color: "bg-red-500", bgCard: "bg-red-800", descripcion: "Necesitas tomar accion urgente para mejorar tu situacion financiera.", mascot: "/tortuga_riesgo_alto_left.png" },
};

export default function RecomendacionesPage() {
  const [ingreso, setIngreso] = useState("");
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [totalTrans, setTotalTrans] = useState(0);

  useEffect(() => {
    setTotalTrans(getTransacciones().filter((t) => t.tipo === "gasto").length);
  }, []);

  async function analizar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const gastos = getTransacciones().filter((t) => t.tipo === "gasto");
    if (gastos.length === 0) {
      setError("No tienes transacciones registradas. Agrega gastos en la seccion Transacciones primero.");
      return;
    }

    const trans = gastos.map((t) => ({
      descripcion: t.descripcion,
      valor: t.monto,
      moneda: t.moneda || "ARS",
    }));

    const ingresoNum = parseFloat(ingreso);

    setCargando(true);
    try {
      const data = await api.analisisFinanciero({
        ingreso_mensual: ingresoNum,
        nivel_endeudamiento: 20,
        frecuencia_ahorro: "Media",
        moneda_local_usuario: "ARS",
        transacciones: trans,
      });
      setResultado(data);
    } catch {
      setError("Error al analizar. Verifica que los servicios esten activos.");
    } finally {
      setCargando(false);
    }
  }

  const perfil = resultado ? perfilConfig[resultado.perfil_financiero] || perfilConfig["En observacion"] : null;

  return (
    <div className="flex flex-col px-5 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Recomendaciones IA</h1>
        <p className="text-sm text-[#6b6b6b]">
          Analizamos tus transacciones con inteligencia artificial para darte consejos personalizados
        </p>
      </div>

      {!resultado ? (
        <>
          {/* Info card con Mascota */}
          <div className="rounded-2xl bg-[#2d4a3e] text-white p-5 relative overflow-hidden flex items-center justify-between shadow-md">
            <div className="flex-1 pr-4 z-10 max-w-[70%]">
              <p className="text-sm font-bold mb-2">¿Cómo funciona?</p>
              <ol className="text-xs opacity-85 space-y-1.5 leading-relaxed">
                <li>1. Registra tus gastos en Transacciones.</li>
                <li>2. Ingresa tu ingreso mensual aquí.</li>
                <li>3. Nuestra IA analiza tus patrones y emite recomendaciones.</li>
              </ol>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${totalTrans > 0 ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className="text-xs">
                  {totalTrans > 0
                    ? `${totalTrans} transacciones listas para analizar`
                    : "Sin transacciones registradas"}
                </span>
              </div>
            </div>
            <div className="w-28 h-28 flex-shrink-0 drop-shadow-xl hover:scale-105 transition-transform duration-300 -mr-2">
              <img
                src="/tortuga_estable_left.png"
                alt="Mascota Tortuga Vinnah"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={analizar} className="rounded-2xl border border-[#e0e0e0] bg-white p-5 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-sm">{error}</p>
                {totalTrans === 0 && (
                  <Link href="/transacciones" className="text-xs text-red-500 underline mt-1 inline-block">
                    Ir a Transacciones
                  </Link>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-[#6b6b6b] block mb-1">¿Cuál es tu ingreso mensual estimado? (ARS)</label>
              <input
                type="number"
                value={ingreso}
                onChange={(e) => setIngreso(e.target.value)}
                placeholder="Ej: 1500000"
                required
                className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm outline-none focus:border-[#2d4a3e] text-[#1a1a1a]"
              />
              <p className="text-[10px] text-[#999] mt-1">Solo necesitamos este dato. El resto lo calcula la IA.</p>
            </div>

            <button
              type="submit"
              disabled={cargando || totalTrans === 0}
              className="w-full rounded-full bg-[#2d4a3e] py-3.5 text-white text-sm font-medium hover:bg-[#1e3529] transition-colors disabled:opacity-50"
            >
              {cargando ? "Analizando con IA..." : "Analizar mis finanzas"}
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Perfil financiero con Mascota Adaptativa */}
          <div className={`rounded-2xl ${perfil!.bgCard} text-white p-5 relative overflow-hidden flex items-center justify-between shadow-md`}>
            <div className="flex-1 pr-4 z-10 max-w-[65%]">
              <p className="text-xs opacity-80 mb-1">Tu estado financiero</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold">{perfil!.label}</span>
                <span className={`h-3.5 w-3.5 rounded-full ${perfil!.color}`} />
              </div>
              <p className="text-xs opacity-80 mb-4">{perfil!.descripcion}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] opacity-70 uppercase">Gastos / Ingreso</p>
                  <p className="text-lg font-bold">{resultado.ratio_gasto_ingreso_pct.toFixed(0)}%</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] opacity-70 uppercase">Total gastado</p>
                  <p className="text-lg font-bold">${resultado.total_gastado_local.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="w-32 h-32 flex-shrink-0 drop-shadow-2xl hover:scale-105 transition-transform duration-300 -mr-2">
              <img
                src={perfil!.mascot}
                alt={perfil!.label}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Gastos por categoria */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Distribución de gastos</h3>
            <div className="space-y-3">
              {Object.entries(resultado.resumen_gastos_por_categoria)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, monto]) => {
                  const pct = resultado.total_gastado_local > 0 ? (monto / resultado.total_gastado_local) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#1a1a1a] capitalize font-medium">{cat}</span>
                        <span className="text-[#6b6b6b]">${monto.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2.5 bg-[#e8e5de] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2d4a3e] rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Recomendaciones */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">Consejos personalizados de la Mascota Vinnah</h3>
            <div className="space-y-3">
              {resultado.recomendaciones.map((rec, i) => (
                <div key={i} className="rounded-2xl border border-[#e0e0e0] bg-white p-4 flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-sm text-[#1a1a1a] leading-relaxed flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Volver */}
          <button
            onClick={() => setResultado(null)}
            className="w-full rounded-full border-2 border-[#2d4a3e] py-3 text-[#2d4a3e] text-sm font-medium hover:bg-[#2d4a3e] hover:text-white transition-colors"
          >
            Nuevo análisis
          </button>
        </>
      )}
    </div>
  );
}
