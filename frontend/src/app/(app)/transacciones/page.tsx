"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getCategorias, type Categoria } from "@/lib/categorias";
import { getTransacciones, saveTransaccion, getResumen, type TransaccionGuardada } from "@/lib/transacciones";

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<TransaccionGuardada[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto");
  const [cargando, setCargando] = useState(false);
  const [resumen, setResumen] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0 });

  useEffect(() => {
    setTransacciones(getTransacciones());
    setCategorias(getCategorias());
    const r = getResumen();
    setResumen({ totalIngresos: r.totalIngresos, totalGastos: r.totalGastos, balance: r.balance });
  }, []);

  useEffect(() => {
    if (showForm) setCategorias(getCategorias());
  }, [showForm]);

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim() || !monto || !categoria) return;

    const montoNum = parseFloat(monto);
    const now = new Date();

    let categoriaIA: string | undefined;
    let probabilidadIA: number | undefined;

    if (tipo === "gasto") {
      setCargando(true);
      try {
        const resultado = await api.clasificarTransacciones([
          { descripcion: descripcion.trim(), valor: montoNum, moneda: "ARS" },
        ]);
        if (resultado.clasificaciones?.length > 0) {
          categoriaIA = resultado.clasificaciones[0].categoria;
          probabilidadIA = resultado.clasificaciones[0].probabilidad;
        }
      } catch {
        // AI classification failed, continue without it
      } finally {
        setCargando(false);
      }
    }

    const nueva = saveTransaccion({
      fecha: now.toISOString().split("T")[0],
      hora: now.toTimeString().slice(0, 5),
      descripcion: descripcion.trim(),
      categoria,
      categoriaIA,
      probabilidadIA,
      monto: montoNum,
      moneda: "ARS",
      tipo,
    });

    setTransacciones((prev) => [nueva, ...prev]);
    const r = getResumen();
    setResumen({ totalIngresos: r.totalIngresos, totalGastos: r.totalGastos, balance: r.balance });
    setDescripcion("");
    setMonto("");
    setCategoria("");
    setShowForm(false);
  }

  const hoy = new Date().toISOString().split("T")[0];
  const transHoy = transacciones.filter((t) => t.fecha === hoy);
  const transAnteriores = transacciones.filter((t) => t.fecha !== hoy);

  return (
    <div className="flex flex-col px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Transacciones</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-full bg-[#2d4a3e] px-4 py-2 text-white text-sm font-medium hover:bg-[#1e3529] transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nueva"}
        </button>
      </div>

      {/* Mini resumen */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-center">
          <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide">Ingresos</p>
          <p className="text-sm font-bold text-green-600">${resumen.totalIngresos.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-center">
          <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide">Gastos</p>
          <p className="text-sm font-bold text-red-500">${resumen.totalGastos.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-center">
          <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide">Balance</p>
          <p className={`text-sm font-bold ${resumen.balance >= 0 ? "text-[#2d4a3e]" : "text-red-500"}`}>
            ${resumen.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={agregar} className="rounded-2xl border border-[#e0e0e0] bg-white p-5 mb-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTipo("gasto"); setCategoria(""); }}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
                tipo === "gasto" ? "bg-[#2d4a3e] text-white" : "border border-[#2d4a3e] text-[#2d4a3e]"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => { setTipo("ingreso"); setCategoria(""); }}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
                tipo === "ingreso" ? "bg-[#2d4a3e] text-white" : "border border-[#2d4a3e] text-[#2d4a3e]"
              }`}
            >
              Ingreso
            </button>
          </div>

          <div>
            <label className="text-xs text-[#6b6b6b] block mb-1">Descripcion</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tipo === "gasto" ? "Ej: Supermercado Coto, Uber al trabajo" : "Ej: Sueldo mensual"}
              required
              className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm outline-none focus:border-[#2d4a3e] text-[#1a1a1a]"
            />
          </div>

          <div>
            <label className="text-xs text-[#6b6b6b] block mb-1">Categoria</label>
            {categoriasFiltradas.length > 0 ? (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
                className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm outline-none focus:border-[#2d4a3e] text-[#1a1a1a]"
              >
                <option value="">Seleccionar categoria</option>
                {categoriasFiltradas.map((c, i) => (
                  <option key={i} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-[#999] py-2">
                No hay categorias de {tipo}. Crealas en la seccion Categorias.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-[#6b6b6b] block mb-1">Monto (ARS)</label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 45000"
              required
              className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm outline-none focus:border-[#2d4a3e] text-[#1a1a1a]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando || categoriasFiltradas.length === 0}
            className="w-full rounded-full bg-[#2d4a3e] py-3 text-white text-sm font-medium hover:bg-[#1e3529] transition-colors disabled:opacity-50"
          >
            {cargando ? "Clasificando con IA..." : "Agregar transaccion"}
          </button>
        </form>
      )}

      {/* Lista de transacciones */}
      {transacciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c4c4c4] bg-white p-8 text-center">
          <div className="text-4xl mb-3 opacity-30">$</div>
          <p className="text-[#1a1a1a] font-medium mb-1">Sin transacciones</p>
          <p className="text-xs text-[#6b6b6b]">
            Agrega tu primer gasto o ingreso para comenzar a rastrear tus finanzas
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {transHoy.length > 0 && (
            <div>
              <span className="inline-block rounded-full bg-[#2d4a3e] px-3 py-1 text-xs font-medium text-white mb-3">
                Hoy
              </span>
              <div className="space-y-2">
                {transHoy.map((t) => (
                  <TransaccionCard key={t.id} t={t} />
                ))}
              </div>
            </div>
          )}
          {transAnteriores.length > 0 && (
            <div>
              <span className="inline-block rounded-full bg-[#e8e5de] px-3 py-1 text-xs font-medium text-[#6b6b6b] mb-3">
                Anteriores
              </span>
              <div className="space-y-2">
                {transAnteriores.map((t) => (
                  <TransaccionCard key={t.id} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TransaccionCard({ t }: { t: TransaccionGuardada }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#999] w-10 flex-shrink-0">{t.hora}</span>
      <div className="flex-1 flex items-center justify-between rounded-2xl border border-[#e0e0e0] bg-white px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1a1a1a] truncate">{t.descripcion}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#6b6b6b]">{t.categoria}</span>
            {t.categoriaIA && t.categoriaIA !== t.categoria.toLowerCase() && (
              <span className="text-[10px] bg-[#e8e5de] text-[#2d4a3e] rounded-full px-2 py-0.5">
                IA: {t.categoriaIA} {t.probabilidadIA != null && `(${(t.probabilidadIA * 100).toFixed(0)}%)`}
              </span>
            )}
          </div>
        </div>
        <span className={`text-sm font-bold ml-3 flex-shrink-0 ${t.tipo === "gasto" ? "text-red-500" : "text-green-600"}`}>
          {t.tipo === "gasto" ? "-" : "+"} ${t.monto.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
