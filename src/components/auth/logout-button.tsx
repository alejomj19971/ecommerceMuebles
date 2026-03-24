"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({ className, label = "Cerrar sesion" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setLoading(false);
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void logout()}
      className={className ?? "rounded-xl bg-[#f6f5f3] px-4 py-3 text-sm font-medium"}
    >
      {loading ? "Saliendo..." : label}
    </button>
  );
}

