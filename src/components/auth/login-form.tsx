"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo iniciar sesión");
      }

      const data = (await res.json()) as {
        user?: { id: string; email: string; name: string | null; role: string };
      };

      router.refresh();
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/mi-cuenta");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="text-sm">
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          placeholder="correo@ejemplo.com"
          required
          type="email"
        />
      </label>

      <label className="text-sm">
        Contrasena
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          placeholder="********"
          required
          type="password"
        />
      </label>

      {error ? (
        <div className="rounded-xl border border-[#ffd1d1] bg-[#fff2f2] px-3 py-2 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <button
        className="mt-2 rounded-full bg-[#1f1f1f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

