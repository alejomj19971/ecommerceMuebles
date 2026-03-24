"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CATEGORIA_LABELS, CATEGORIA_SLUGS } from "@/lib/utils";
import {
  MATERIAL_CATEGORIA_LABELS,
  MATERIAL_CATEGORIA_SLUGS,
  type MaterialCategoriaSlug,
} from "@/lib/material-categoria";

type MaterialOption = {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  precioUnitario: number;
};

type RecipeLine = {
  categoriaMaterial: "" | MaterialCategoriaSlug;
  idMaterial: string;
  cantidad: string;
};

type Props = {
  materiales: MaterialOption[];
  onCreated?: () => void;
};

export function CreateProductoForm({ materiales, onCreated }: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState<string>("general");
  const [imagenUrl, setImagenUrl] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lineas, setLineas] = useState<RecipeLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addLinea() {
    setLineas((prev) => [...prev, { categoriaMaterial: "", idMaterial: "", cantidad: "1" }]);
  }

  function removeLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLinea(index: number, patch: Partial<RecipeLine>) {
    setLineas((prev) =>
      prev.map((linea, i) => (i === index ? { ...linea, ...patch } : linea))
    );
  }

  async function onImageFileChange(file: File | null) {
    if (!file) return;
    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/uploads/image", {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        secure_url?: string;
      };
      if (!res.ok || !data?.secure_url) {
        throw new Error(data?.error ?? "No se pudo subir la imagen");
      }
      setImagenUrl(data.secure_url);
      setPreviewImage(data.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setSubiendoImagen(false);
      URL.revokeObjectURL(localUrl);
    }
  }

  const costoFabricacion = useMemo(() => {
    let total = 0;
    for (const linea of lineas) {
      const mat = materiales.find((m) => m.id === linea.idMaterial);
      const cantidad = Number(linea.cantidad.replace(",", "."));
      if (!mat || !Number.isFinite(cantidad) || cantidad <= 0) continue;
      total += mat.precioUnitario * cantidad;
    }
    return total;
  }, [lineas, materiales]);

  const precioVentaNum = Number(precio.replace(/\D/g, "") || "0");
  const margen = precioVentaNum - costoFabricacion;
  const margenPct = precioVentaNum > 0 ? (margen / precioVentaNum) * 100 : 0;
  const fmt = new Intl.NumberFormat("es-CO");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const precioNum = Number(precio.replace(/\D/g, "") || "0");
    if (!nombre.trim()) {
      setError("Indica el nombre del producto.");
      return;
    }
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setError("Indica un precio válido (solo números).");
      return;
    }
    const receta = [];
    for (const [i, linea] of lineas.entries()) {
      if (!linea.categoriaMaterial) {
        setError(`Selecciona una categoría de material en la línea ${i + 1}.`);
        return;
      }
      if (!linea.idMaterial) {
        setError(`Selecciona un material en la línea ${i + 1}.`);
        return;
      }
      const cantidad = Number(linea.cantidad.replace(",", "."));
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        setError(`Cantidad inválida en la línea ${i + 1}.`);
        return;
      }
      receta.push({ id_material: linea.idMaterial, cantidad });
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          precio_venta: Math.round(precioNum),
          categoria,
          imagen_url: imagenUrl.trim() || null,
          materiales: receta,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo crear el producto");
      }
      setNombre("");
      setPrecio("");
      setCategoria("general");
      setImagenUrl("");
      setLineas([]);
      router.refresh();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="grid min-w-0 gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold">Crear producto</h2>
        <p className="mt-1 text-sm text-[#666]">
          Define datos del producto y, si quieres, agrega la receta de materiales desde este
          mismo formulario.
        </p>
      </div>

      <label className="text-sm">
        Nombre
        <input
          value={nombre}
          onChange={(ev) => setNombre(ev.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          placeholder="Ej. Sofa modular 3 puestos"
          required
        />
      </label>

      <label className="text-sm">
        Precio venta (COP, sin símbolos)
        <input
          value={precio}
          onChange={(ev) => setPrecio(ev.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          placeholder="1890000"
          inputMode="numeric"
          required
        />
      </label>

      <label className="text-sm sm:col-span-2">
        Archivo de imagen (JPG, PNG, WEBP)
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2 text-sm"
          onChange={(ev) => void onImageFileChange(ev.target.files?.[0] ?? null)}
        />
        <p className="mt-1 text-xs text-[#666]">
          Se sube a Cloudinary y rellena automáticamente la URL.
        </p>
      </label>

      {subiendoImagen ? (
        <p className="sm:col-span-2 text-sm text-[#666]">Subiendo imagen...</p>
      ) : null}

      {previewImage ? (
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs text-[#666]">Previsualización</p>
          <div className="h-44 w-full overflow-hidden rounded-2xl border border-[#ddd] bg-white">
            <img
              src={previewImage}
              alt="Previsualización"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      <label className="text-sm sm:col-span-2">
        Categoría
        <select
          value={categoria}
          onChange={(ev) => setCategoria(ev.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
        >
          {CATEGORIA_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {CATEGORIA_LABELS[slug]}
            </option>
          ))}
        </select>
      </label>

      <div className="sm:col-span-2 rounded-2xl border border-[#ece8df] bg-[#faf9f7] p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Materiales del producto</h3>
            <p className="text-xs text-[#666]">
              Cada línea define: categoría, material y cantidad.
            </p>
          </div>
          <button
            type="button"
            onClick={addLinea}
            className="rounded-full bg-[#f6f5f3] px-3 py-2 text-xs font-medium ring-1 ring-black/10"
          >
            Añadir material
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {lineas.map((linea, i) => (
            <div key={`linea-${i}`} className="grid min-w-0 gap-2 lg:grid-cols-[1.2fr_1.8fr_1fr_auto]">
              {(() => {
                const selectedInOthers = new Set(
                  lineas
                    .map((l, idx) => (idx === i ? null : l.idMaterial))
                    .filter((id): id is string => Boolean(id))
                );
                const availableMaterials = materiales.filter(
                  (m) =>
                    (linea.categoriaMaterial === "" ||
                      m.categoria === linea.categoriaMaterial) &&
                    (!selectedInOthers.has(m.id) || m.id === linea.idMaterial)
                );
                return (
                  <>
                    <select
                      value={linea.categoriaMaterial}
                      onChange={(ev) => {
                        const nextCategoria = ev.target.value as "" | MaterialCategoriaSlug;
                        const keepMaterial = materiales.some(
                          (m) =>
                            m.id === linea.idMaterial &&
                            (nextCategoria === "" || m.categoria === nextCategoria)
                        );
                        updateLinea(i, {
                          categoriaMaterial: nextCategoria,
                          idMaterial: keepMaterial ? linea.idMaterial : "",
                        });
                      }}
                      className="min-w-0 rounded-xl border border-[#ddd] px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona categoría material</option>
                      {MATERIAL_CATEGORIA_SLUGS.map((slug) => (
                        <option key={slug} value={slug}>
                          {MATERIAL_CATEGORIA_LABELS[slug]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={linea.idMaterial}
                      onChange={(ev) => updateLinea(i, { idMaterial: ev.target.value })}
                      className="min-w-0 rounded-xl border border-[#ddd] px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona material</option>
                      {availableMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} ({m.unidadMedida}) - $
                          {new Intl.NumberFormat("es-CO").format(m.precioUnitario)}
                        </option>
                      ))}
                    </select>
                  </>
                );
              })()}
              <input
                value={linea.cantidad}
                onChange={(ev) => updateLinea(i, { cantidad: ev.target.value })}
                className="min-w-0 rounded-xl border border-[#ddd] px-3 py-2 text-sm"
                placeholder="Cantidad"
                inputMode="decimal"
              />
              <button
                type="button"
                onClick={() => removeLinea(i)}
                className="rounded-full border border-[#ffd1d1] bg-[#fff8f8] px-3 py-2 text-xs font-medium text-[#b42318] lg:px-3"
              >
                Quitar
              </button>
            </div>
          ))}
          {lineas.length === 0 ? (
            <p className="text-xs text-[#666]">No agregaste materiales.</p>
          ) : null}
        </div>
      </div>

      <div className="sm:col-span-2 rounded-2xl border border-[#ece8df] bg-[#f8fafc] p-4">
        <h3 className="text-sm font-semibold">Comparación de costos (en vivo)</h3>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
          <p>
            Precio venta: <span className="font-semibold">${fmt.format(precioVentaNum || 0)}</span>
          </p>
          <p>
            Precio fabricación:{" "}
            <span className="font-semibold">${fmt.format(Math.round(costoFabricacion))}</span>
          </p>
          <p>
            Margen:{" "}
            <span className={margen >= 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
              ${fmt.format(Math.round(margen))} ({margenPct.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#1f1f1f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar producto"}
        </button>
      </div>
    </form>
  );
}
