"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api.registro({ nombre, email, password });
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch {
      setError("Error al crear la cuenta. Intenta con otro correo.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f3ee] px-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="text-5xl font-serif text-[#2d4a3e] mb-2">Vinnah</h1>
        <p className="text-sm text-[#6b6b6b] text-center leading-snug mb-12">
          Crea tu cuenta para comenzar
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm text-[#2d4a3e] placeholder-[#6b6b6b] outline-none focus:border-[#2d4a3e] transition-colors"
          />
          <input
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm text-[#2d4a3e] placeholder-[#6b6b6b] outline-none focus:border-[#2d4a3e] transition-colors"
          />
          <input
            type="password"
            placeholder="Contrasena (min. 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border-b border-[#c4c4c4] bg-transparent py-2 text-sm text-[#2d4a3e] placeholder-[#6b6b6b] outline-none focus:border-[#2d4a3e] transition-colors"
          />

          <button
            type="submit"
            className="w-full rounded-full bg-[#2d4a3e] py-3.5 text-white text-base font-medium hover:bg-[#1e3529] transition-colors"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-sm text-[#6b6b6b]">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-[#2d4a3e] hover:underline">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
