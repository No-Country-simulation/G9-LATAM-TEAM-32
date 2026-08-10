"use client";

import { useState, useEffect } from "react";
import { type Categoria, getCategorias } from "@/lib/categorias";

interface Transaccion {
  hora: string;
  categoria: string;
  monto: number;
  tipo: "gasto" | "ingreso";
}

interface Grupo {
  fecha: string;
  transacciones: Transaccion[];
}

const datosIniciales: Grupo[] = [
  {
    fecha: "Hoy",
    transacciones: [
      { hora: "23:20", categoria: "Salud", monto: 96.41, tipo: "gasto" },
      { hora: "22:28", categoria: "Salud", monto: 96.41, tipo: "gasto" },
      { hora: "21:53", categoria: "Alimentacion", monto: 2745.27, tipo: "gasto" },
    ],
  },
  {
    fecha: "sabado, 20 junio",
    transacciones: [
      { hora: "18:08", categoria: "Alimentacion", monto: 15.0, tipo: "gasto" },
    ],
  },
  {
    fecha: "lunes, 15 junio",
    transacciones: [
      { hora: "01:00", categoria: "Inversiones", monto: 5000.0, tipo: "ingreso" },
    ],
  },
];

export default function TransaccionesPage() {
  const [grupos, setGrupos] = useState(datosIniciales);
  const [showForm, setShowForm] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto");
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);

  useEffect(() => {
    setCategoriasDisponibles(getCategorias());
  }, []);

  // ponytail: re-read on form open in case user created categories in another tab
  useEffect(() => {
    if (showForm) setCategoriasDisponibles(getCategorias());
  }, [showForm]);

  const categoriasFiltradas = categoriasDisponibles.filter((c) => c.tipo === tipo);

  function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!categoria.trim() || !monto) return;
    const now = new Date();
    const nueva: Transaccion = {
      hora: now.toTimeString().slice(0, 5),
      categoria: categoria.trim(),
      monto: parseFloat(monto),
      tipo,
    };
    const updated = [...grupos];
    if (updated[0]?.fecha === "Hoy") {
      updated[0].transacciones.unshift(nueva);
    } else {
      updated.unshift({ fecha: "Hoy", transacciones: [nueva] });
    }
    setGrupos(updated);
    setCategoria("");
    setMonto("");
    setShowForm(false);
  }

  return (
    <div className="flex flex-col px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Transacciones</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[#2d4a3e] hover:text-[#1e3529]"
          title="Agregar transaccion"
        >
          {showForm ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={agregar} className="rounded-2xl border border-[#e0e0e0] bg-white p-4 mb-6 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTipo("gasto"); setCategoria(""); }}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                tipo === "gasto" ? "bg-[#2d4a3e] text-white" : "border border-[#2d4a3e] text-[#2d4a3e]"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => { setTipo("ingreso"); setCategoria(""); }}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                tipo === "ingreso" ? "bg-[#2d4a3e] text-white" : "border border-[#2d4a3e] text-[#2d4a3e]"
              }`}
            >
              Ingreso
            </button>
          </div>

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
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Categoria (crea categorias para verlas aqui)"
              required
              className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm outline-none focus:border-[#2d4a3e]"
            />
          )}

          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            required
            className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm outline-none focus:border-[#2d4a3e]"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#2d4a3e] py-3 text-white text-sm font-medium hover:bg-[#1e3529] transition-colors"
          >
            Agregar
          </button>
        </form>
      )}

      {/* Lista de transacciones */}
      <div className="space-y-5">
        {grupos.map((grupo, gi) => (
          <div key={gi}>
            <span className="inline-block rounded-full bg-[#e8e5de] px-3 py-1 text-xs font-medium text-[#6b6b6b] mb-3">
              {grupo.fecha}
            </span>
            <div className="space-y-3">
              {grupo.transacciones.map((t, ti) => (
                <div key={ti} className="flex items-center gap-3">
                  <span className="text-xs text-[#999] w-10 flex-shrink-0">{t.hora}</span>
                  <div className="flex-1 flex items-center justify-between rounded-2xl border border-[#e0e0e0] bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{t.categoria}</p>
                      <p className="text-[11px] text-[#999]">{t.hora}</p>
                    </div>
                    <span className={`text-sm font-bold ${t.tipo === "gasto" ? "text-red-500" : "text-green-600"}`}>
                      {t.tipo === "gasto" ? "-" : "+"} ${t.monto.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
