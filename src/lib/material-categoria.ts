/** Slugs guardados en `materiales.categoria`. */
export const MATERIAL_CATEGORIA_SLUGS = [
  "mano_de_obra",
  "espumas",
  "telas",
  "esqueletos",
  "herraje",
  "guata",
  "patas_madera",
  "rodachines",
  "tapicero",
  "varios",
] as const;

export type MaterialCategoriaSlug = (typeof MATERIAL_CATEGORIA_SLUGS)[number];

export const MATERIAL_CATEGORIA_LABELS: Record<MaterialCategoriaSlug, string> = {
  mano_de_obra: "Mano de obra",
  espumas: "Espumas",
  telas: "Telas",
  esqueletos: "Esqueletos",
  herraje: "Herraje",
  guata: "Guata",
  patas_madera: "Patas madera",
  rodachines: "Rodachines",
  tapicero: "Tapicero",
  varios: "Varios",
};

export const DEFAULT_MATERIAL_CATEGORIA: MaterialCategoriaSlug = "telas";

export function isMaterialCategoriaSlug(value: string): value is MaterialCategoriaSlug {
  return (MATERIAL_CATEGORIA_SLUGS as readonly string[]).includes(value);
}

export function labelMaterialCategoria(slug: string): string {
  if (isMaterialCategoriaSlug(slug)) return MATERIAL_CATEGORIA_LABELS[slug];
  return slug;
}
