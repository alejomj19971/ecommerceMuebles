"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/home/product-card";

type CatalogClientProps = {
  products: Array<{
    slug: string;
    name: string;
    price: string;
    image: string;
    tag: string;
    category: string;
  }>;
};

const categories = ["Todos", "General", "Sala", "Dormitorio", "Comedor", "Oficina"] as const;
const sortOptions = [
  "Recomendados",
  "Precio: menor a mayor",
  "Precio: mayor a menor",
] as const;

function parsePrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

export function CatalogClient({ products }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("Todos");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>(
    "Recomendados"
  );
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const byCategory =
      selectedCategory === "Todos"
        ? products
        : products.filter((product) => product.category === selectedCategory);

    const bySearch = byCategory.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );

    if (sortBy === "Precio: menor a mayor") {
      return [...bySearch].sort(
        (a, b) => parsePrice(a.price) - parsePrice(b.price)
      );
    }

    if (sortBy === "Precio: mayor a menor") {
      return [...bySearch].sort(
        (a, b) => parsePrice(b.price) - parsePrice(a.price)
      );
    }

    return bySearch;
  }, [products, selectedCategory, sortBy, query]);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
      <div className="mb-6 flex flex-col gap-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar producto por nombre..."
          className="w-full rounded-xl border border-[#ddd] px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm ${
                selectedCategory === category
                  ? "bg-[#1f1f1f] text-white"
                  : "bg-[#efefef] text-[#333]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-[#4f4f4f]">
          Ordenar:
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as (typeof sortOptions)[number])
            }
            className="rounded-full border border-[#ddd] px-3 py-2 text-xs sm:text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-5 text-sm text-[#666]">
        Mostrando {filteredProducts.length} productos
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </section>
  );
}
