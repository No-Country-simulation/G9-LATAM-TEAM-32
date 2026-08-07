"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // ponytail: bypass login para dev, quitar cuando la DB esté conectada
    if (process.env.NODE_ENV === "development") {
      localStorage.setItem("token", "dev-token");
      router.push("/dashboard");
      return;
    }
    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch {
      setError("Credenciales inválidas");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f3ee] px-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <h1 className="text-5xl font-serif text-[#2d4a3e] mb-2">Vinnah</h1>
        <p className="text-sm text-[#6b6b6b] text-center leading-snug mb-12">
          Comprende tu dinero.<br />
          Comprende tu vida
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm text-[#2d4a3e] placeholder-[#6b6b6b] outline-none focus:border-[#2d4a3e] transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm text-[#2d4a3e] placeholder-[#6b6b6b] outline-none focus:border-[#2d4a3e] transition-colors"
            />
            <div className="mt-1 text-right">
              <Link href="#" className="text-xs text-[#6b6b6b] hover:text-[#2d4a3e]">
                Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#2d4a3e] py-3.5 text-white text-base font-medium hover:bg-[#1e3529] transition-colors"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-sm text-[#6b6b6b]">
          No tienes cuenta?{" "}
          <Link href="#" className="font-semibold text-[#2d4a3e] hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
