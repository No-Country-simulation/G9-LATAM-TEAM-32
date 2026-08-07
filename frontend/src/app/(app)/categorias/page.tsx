"use client";

import { useState, useEffect } from "react";
import { type Tipo, type Categoria, getCategorias, saveCategorias } from "@/lib/categorias";

export default function CategoriasPage() {
  const [tipo, setTipo] = useState<Tipo>("ingreso");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    setCategorias(getCategorias());
  }, []);

  function agregar() {
    if (!nombre.trim()) return;
    const updated = [...categorias, { nombre: nombre.trim(), tipo }];
    setCategorias(updated);
    saveCategorias(updated);
    setNombre("");
    setShowInput(false);
  }

  function eliminar(index: number) {
    const real = categorias.filter((c) => c.tipo === tipo);
    const target = real[index];
    const updated = categorias.filter((c) => c !== target);
    setCategorias(updated);
    saveCategorias(updated);
  }

  const filtered = categorias.filter((c) => c.tipo === tipo);

  return (
    <div className="flex flex-col px-5 py-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Categorias</h1>

      {/* Card */}
      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6">
        {/* Tabs */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setTipo("ingreso")}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              tipo === "ingreso"
                ? "bg-[#2d4a3e] text-white"
                : "bg-white text-[#2d4a3e] border-2 border-[#2d4a3e]"
            }`}
          >
            Ingreso
          </button>
          <button
            onClick={() => setTipo("gasto")}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              tipo === "gasto"
                ? "bg-[#2d4a3e] text-white"
                : "bg-white text-[#2d4a3e] border-2 border-[#2d4a3e]"
            }`}
          >
            Gasto
          </button>
        </div>

        {/* Agregar */}
        {showInput ? (
          <div className="flex gap-2 mb-5">
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregar()}
              placeholder="Nombre de categoria"
              className="flex-1 border-b border-[#c4c4c4] bg-transparent px-2 py-1 text-sm outline-none focus:border-[#2d4a3e]"
            />
            <button onClick={agregar} className="rounded-full bg-[#2d4a3e] px-4 py-1 text-sm text-white">
              OK
            </button>
            <button onClick={() => { setShowInput(false); setNombre(""); }} className="text-sm text-[#999] hover:text-[#1a1a1a]">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="mb-5 rounded-full border-2 border-[#2d4a3e] px-5 py-2 text-sm font-medium text-[#2d4a3e] hover:bg-[#2d4a3e] hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="text-lg leading-none">+</span> Agregar
          </button>
        )}

        {/* Categorias list */}
        {filtered.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filtered.map((cat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e8e5de] px-3 py-1.5 text-sm text-[#1a1a1a] group"
              >
                <span className="h-2 w-2 rounded-full bg-[#2d4a3e]" />
                {cat.nombre}
                <button
                  onClick={() => eliminar(i)}
                  className="ml-1 text-[#999] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#999]">
            No hay categorias de {tipo} creadas
          </p>
        )}
      </div>
    </div>
  );
}
