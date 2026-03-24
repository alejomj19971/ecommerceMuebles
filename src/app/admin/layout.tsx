import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionFromCookie } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin | Galeria Deluxe Medellin",
  description: "Panel de administracion del ecommerce.",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}

