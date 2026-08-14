export type Tipo = "ingreso" | "gasto";

export interface Categoria {
  nombre: string;
  tipo: Tipo;
}

const KEY = "vinnah_categorias";

const CATEGORIAS_DEFAULT: Categoria[] = [
  { nombre: "Alimentacion", tipo: "gasto" },
  { nombre: "Transporte", tipo: "gasto" },
  { nombre: "Vivienda", tipo: "gasto" },
  { nombre: "Servicios y comunicaciones", tipo: "gasto" },
  { nombre: "Salud y cuidado", tipo: "gasto" },
  { nombre: "Educacion", tipo: "gasto" },
  { nombre: "Ocio y entretenimiento", tipo: "gasto" },
  { nombre: "Obligaciones y ahorro", tipo: "gasto" },
  { nombre: "Sueldo", tipo: "ingreso" },
  { nombre: "Freelance", tipo: "ingreso" },
  { nombre: "Inversiones", tipo: "ingreso" },
  { nombre: "Otros ingresos", tipo: "ingreso" },
];

export function getCategorias(): Categoria[] {
  if (typeof window === "undefined") return CATEGORIAS_DEFAULT;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      localStorage.setItem(KEY, JSON.stringify(CATEGORIAS_DEFAULT));
      return CATEGORIAS_DEFAULT;
    }
    const parsed = JSON.parse(stored) as Categoria[];
    return parsed.length > 0 ? parsed : CATEGORIAS_DEFAULT;
  } catch {
    return CATEGORIAS_DEFAULT;
  }
}

export function saveCategorias(cats: Categoria[]) {
  localStorage.setItem(KEY, JSON.stringify(cats));
}
