import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Slugs en columna `productos.categoria` (rutas /categorias/[slug]). */
export const CATEGORIA_SLUGS = [
  "general",
  "sala",
  "dormitorio",
  "comedor",
  "oficina",
] as const

export type CategoriaSlug = (typeof CATEGORIA_SLUGS)[number]

export const CATEGORIA_LABELS: Record<CategoriaSlug, string> = {
  general: "General",
  sala: "Sala",
  dormitorio: "Dormitorio",
  comedor: "Comedor",
  oficina: "Oficina",
}

export function isCategoriaSlug(value: string): value is CategoriaSlug {
  return (CATEGORIA_SLUGS as readonly string[]).includes(value)
}

export function labelCategoria(slug: string): string {
  if (isCategoriaSlug(slug)) return CATEGORIA_LABELS[slug]
  return slug
}
