"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  imageUrl?: string;
  imageKey?: string;
  marca: { nombre: string };
  categoria: { nombre: string };
  precio?: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

function ProductosContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") ?? "";

  // Refs por categoría para hacer scroll
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/public/productos?limit=100`),
          fetch(`/api/public/categorias`),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProductos(data);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Error al cargar productos/categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll a la categoría indicada en el param ?cat= después de cargar
  useEffect(() => {
    if (!catParam || loading) return;
    // Pequeño delay para que los refs estén montados
    const timer = setTimeout(() => {
      const el = catRefs.current[catParam];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [catParam, loading]);

  // filtro por búsqueda de texto
  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.categoria?.nombre.toLowerCase().includes(q.toLowerCase())
  );

  // agrupar productos por categoría
  const groupedByCategory: Record<string, Producto[]> = {};
  filtered.forEach((p) => {
    const cat = p.categoria?.nombre || "Otros";
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(p);
  });

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header con buscador */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-zinc-900">
            {catParam ? `Categoría: ${catParam}` : "Nuestros productos"}
          </h1>
          <p className="text-zinc-600 text-sm">
            {catParam
              ? `Mostrando productos de "${catParam}"`
              : "Explora nuestro catálogo de medicamentos, dermocosmética y bienestar."}
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex justify-center">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              🔍
            </span>
            <input
              className="pl-9 pr-3 py-2 w-full border rounded-full shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="Buscar producto o categoría..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Estados */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border bg-white p-4 space-y-3 shadow-sm"
              >
                <div className="h-32 bg-zinc-200 rounded-lg" />
                <div className="h-4 bg-zinc-200 rounded w-1/2" />
                <div className="h-4 bg-zinc-200 rounded w-2/3" />
                <div className="h-8 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-16">
            <p className="text-lg">😕 No encontramos resultados.</p>
            <p className="text-sm mt-1">Prueba con otro término de búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {categorias.map((cat) => {
              const productosDeCat = groupedByCategory[cat.nombre];
              if (!productosDeCat || productosDeCat.length === 0) return null;

              const isHighlighted =
                catParam &&
                cat.nombre.toLowerCase() === catParam.toLowerCase();

              return (
                <div
                  key={cat.id}
                  ref={(el) => {
                    catRefs.current[cat.nombre] = el;
                  }}
                  className={`space-y-6 scroll-mt-20 rounded-2xl transition-all ${isHighlighted
                    ? "ring-2 ring-emerald-400 ring-offset-4 bg-emerald-50/40 p-4"
                    : ""
                    }`}
                >
                  {/* Encabezado de categoría */}
                  <div className="flex items-center justify-between relative">
                    <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 border rounded-full shadow-sm ${isHighlighted
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-emerald-50 border-emerald-200"
                          }`}
                      >
                        {cat.nombre}
                      </span>
                    </h2>
                    <a
                      href={`/productos?cat=${encodeURIComponent(cat.nombre)}`}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Ver más →
                    </a>
                  </div>

                  {/* Grilla de productos */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {productosDeCat.map((p) => (
                      <ProductCard
                        key={p.id}
                        productoId={p.id}
                        nombre={p.nombre}
                        precio={p.precio ?? 0}
                        imagen={p.imageUrl}
                        marca={p.marca?.nombre}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nota legal */}
        <p className="text-xs text-zinc-500 border-t pt-4 text-center">
          ⚠️ Los medicamentos de venta bajo receta solo se expenden según
          normativa vigente.
        </p>
      </div>
    </section>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Cargando...</div>}>
      <ProductosContent />
    </Suspense>
  );
}
