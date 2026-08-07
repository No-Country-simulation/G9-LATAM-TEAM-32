"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    href: "/dashboard", label: "Dashboard",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: "/categorias", label: "Categorias",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>,
  },
  {
    href: "/transacciones", label: "Transacciones",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"/></svg>,
  },
  {
    href: "/reporte", label: "Reporte",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 20h18M6 16v4M10 12v8M14 8v12M18 4v16"/></svg>,
  },
  {
    href: "/recomendaciones", label: "Recomendaciones",
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 4 12.7V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.3A7 7 0 0 1 12 2ZM9 21h6"/></svg>,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 bg-white border-b border-[#e8e5de]">
        <button onClick={() => setOpen(true)} className="text-[#2d4a3e]">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <Link href="/dashboard" className="text-2xl font-serif italic text-[#2d4a3e] font-bold">
          Vinnah
        </Link>
        <button className="text-[#2d4a3e]">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e5de]">
          <span className="text-xl font-serif italic text-[#2d4a3e] font-bold">Vinnah</span>
          <button onClick={() => setOpen(false)} className="text-[#2d4a3e]">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <ul className="py-4">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  pathname === href
                    ? "bg-[#2d4a3e] text-white font-medium"
                    : "text-[#2d4a3e] hover:bg-[#f5f3ee]"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="absolute bottom-0 w-full border-t border-[#e8e5de] p-4">
          <Link
            href="/login"
            onClick={() => {
              localStorage.removeItem("token");
              setOpen(false);
            }}
            className="flex items-center gap-3 text-sm text-red-500 hover:text-red-700"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Cerrar sesion
          </Link>
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  );
}
