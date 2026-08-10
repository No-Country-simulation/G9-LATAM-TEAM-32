const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    fetchAPI("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  registro: (data: { nombre: string; email: string; password: string }) =>
    fetchAPI("/auth/registro", { method: "POST", body: JSON.stringify(data) }),

  analisisFinanciero: (data: unknown) =>
    fetchAPI("/analisis-financiero", { method: "POST", body: JSON.stringify(data) }),

  clasificarTransacciones: (transacciones: unknown[]) =>
    fetchAPI("/clasificacion-transacciones", { method: "POST", body: JSON.stringify({ transacciones }) }),

  importarCsv: async (archivo: File) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("archivo", archivo);
    const res = await fetch(`${API_URL}/transacciones/importar-csv`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};
