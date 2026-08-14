export interface TransaccionGuardada {
  id: string;
  fecha: string;
  hora: string;
  descripcion: string;
  categoria: string;
  categoriaIA?: string;
  probabilidadIA?: number;
  monto: number;
  moneda: string;
  tipo: "gasto" | "ingreso";
}

const KEY = "vinnah_transacciones";

export function getTransacciones(): TransaccionGuardada[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveTransaccion(
  t: Omit<TransaccionGuardada, "id">
): TransaccionGuardada {
  const txs = getTransacciones();
  const nueva: TransaccionGuardada = { ...t, id: crypto.randomUUID() };
  txs.push(nueva);
  localStorage.setItem(KEY, JSON.stringify(txs));
  return nueva;
}

export function getResumen() {
  const txs = getTransacciones();
  let totalIngresos = 0;
  let totalGastos = 0;
  const gastosPorCategoria: Record<string, number> = {};

  for (const t of txs) {
    if (t.tipo === "ingreso") {
      totalIngresos += t.monto;
    } else {
      totalGastos += t.monto;
      gastosPorCategoria[t.categoria] =
        (gastosPorCategoria[t.categoria] || 0) + t.monto;
    }
  }

  return {
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
    gastosPorCategoria,
  };
}
