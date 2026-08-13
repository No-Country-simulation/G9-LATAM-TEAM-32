export type Tipo = "ingreso" | "gasto";

export interface Categoria {
  nombre: string;
  tipo: Tipo;
}

const KEY = "vinnah_categorias";

export function getCategorias(): Categoria[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCategorias(cats: Categoria[]) {
  localStorage.setItem(KEY, JSON.stringify(cats));
}
