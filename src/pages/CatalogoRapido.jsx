import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCatalog } from '../context/CatalogContext';

export default function CatalogoRapido() {
  const { productos, cargando, fetchAllProductos } = useCatalog();
  
  const [busqueda, setBusqueda] = useState('');
  
  // MÁQUINA DE ESTADOS DE FILTROS: null significa "no seleccionado"
  const [categoriaActiva, setCategoriaActiva] = useState(null); 
  const [subcategoriaActiva, setSubcategoriaActiva] = useState(null);
  const [varietalActivo, setVarietalActivo] = useState('Todos');
  const [ordenActivo, setOrdenActivo] = useState('recomendados');

  useEffect(() => {
    if (productos.length === 0) {
      fetchAllProductos();
    }
  }, [productos.length, fetchAllProductos]);

  const productosConSeed = useMemo(() => {
    return productos.map(p => ({
      ...p,
      _seed: Math.random() 
    }));
  }, [productos]);

  // 1. EXTRAER CATEGORÍAS
  const categorias = useMemo(() => {
    const cats = productosConSeed
      .filter(p => p.estado !== 'Oculto' && p.estado !== 'eliminado')
      .map(p => p.categoria)
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return cats;
  }, [productosConSeed]);

  // 2. EXTRAER SUBCATEGORÍAS (Solo de la categoría activa)
  const subcategorias = useMemo(() => {
    if (!categoriaActiva) return [];
    const subcats = productosConSeed
      .filter(p => p.categoria === categoriaActiva && p.estado !== 'Oculto' && p.estado !== 'eliminado')
      .map(p => p.subcategoria)
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return subcats;
  }, [productosConSeed, categoriaActiva]);

  // 3. EXTRAER VARIETALES (Solo de la subcategoría activa)
  const varietales = useMemo(() => {
    if (!subcategoriaActiva) return [];
    const vars = productosConSeed
      .filter(p => p.subcategoria === subcategoriaActiva && p.estado !== 'Oculto' && p.estado !== 'eliminado')
      .map(p => p.varietal)
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return ['Todos', ...vars];
  }, [productosConSeed, subcategoriaActiva]);

  // RESETEO EN CASCADA
  useEffect(() => {
    setSubcategoriaActiva(null);
    setVarietalActivo('Todos');
  }, [categoriaActiva]);

  useEffect(() => {
    setVarietalActivo('Todos');
  }, [subcategoriaActiva]);

  const productosFiltrados = useMemo(() => {
    let result = productosConSeed.filter(p => p.estado !== 'eliminado' && p.estado !== 'Oculto');

    if (!categoriaActiva) {
      result = result.filter(p => p.categoria !== 'Suscripciones');
    } else {
      result = result.filter(p => p.categoria === categoriaActiva);
    }

    if (subcategoriaActiva) {
      result = result.filter(p => p.subcategoria === subcategoriaActiva);
    }

    if (varietalActivo !== 'Todos') {
      result = result.filter(p => p.varietal === varietalActivo);
    }

    if (busqueda) {
      const searchStr = busqueda.toLowerCase();
      result = result.filter(p => 
        (p.nombre?.toLowerCase() || '').includes(searchStr) || 
        (p.bodega?.toLowerCase() || '').includes(searchStr) ||
        (p.varietal?.toLowerCase() || '').includes(searchStr)
      );
    }

    switch (ordenActivo) {
      case 'menor':
        result.sort((a, b) => (a.precioFinal || a.precioBase || 0) - (b.precioFinal || b.precioBase || 0));
        break;
      case 'mayor':
        result.sort((a, b) => (b.precioFinal || b.precioBase || 0) - (a.precioFinal || a.precioBase || 0));
        break;
      case 'az':
        result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        break;
      case 'recomendados':
      default:
        if (!categoriaActiva) {
          result.sort((a, b) => a._seed - b._seed);
        }
        break;
    }

    return result;
  }, [productosConSeed, categoriaActiva, subcategoriaActiva, varietalActivo, busqueda, ordenActivo]);

  return (
    <div className="min-h-screen bg-[#0F1714] text-[#F5F5DC] font-poppins selection:bg-[#ED6B48] selection:text-white">
      <Helmet>
        <title>Catálogo | DECANT</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="sticky top-0 z-50 bg-[#0F1714]/95 backdrop-blur-md border-b border-white/10 px-4 py-5 shadow-xl">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          
          <div className="flex justify-between items-center mb-1">
            <img src="/assets/brand/logo-white-T.png" alt="Decant" className="h-10 object-contain opacity-90" />
            
            {/* BOTÓN WHATSAPP CTA */}
            {/* Reemplaza el número 549... con el número real de la empresa */}
            <a 
              href="https://wa.me/5491100000000?text=Hola,%20quiero%20hacer%20un%20pedido" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 bg-[#fafafa]/50 text-[#25D366] px-3 py-1.5 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase mt-0.5">Hacé tu pedido</span>
            </a>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar vino, bodega, varietal..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#F5F5DC] placeholder-white/40 focus:outline-none focus:border-[#ED6B48] transition-colors shadow-inner"
            />
          </div>

          {/* FILA DE NAVEGACIÓN PRINCIPAL (Drill-down) */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2">
            {!categoriaActiva ? (
              // Nivel 0: Mostrar Categorías
              categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors outline-none bg-white/5 text-white/60 hover:bg-white/10"
                >
                  {cat}
                </button>
              ))
            ) : (
              // Nivel 1: Mostrar Botón Limpiar y Subcategorías
              <>
                <button
                  onClick={() => setCategoriaActiva(null)}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all outline-none bg-[#ED6B48] text-white shadow-md shadow-[#ED6B48]/20 flex items-center gap-1"
                >
                  <span className="text-white/80">✕</span> {categoriaActiva}
                </button>
                {subcategorias.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSubcategoriaActiva(subcategoriaActiva === sub ? null : sub)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors outline-none
                      ${subcategoriaActiva === sub 
                        ? 'bg-white/20 text-white border border-white/30' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {sub}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* FILA SECUNDARIA: Varietales (Solo aparece si hay una subcategoría activa) */}
          {subcategoriaActiva && varietales.length > 1 && (
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pt-1 border-t border-white/5 mt-1">
              {varietales.map(varietal => (
                <button
                  key={varietal}
                  onClick={() => setVarietalActivo(varietal)}
                  className={`whitespace-nowrap px-3 py-1 rounded border text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all outline-none
                    ${varietalActivo === varietal 
                      ? 'border-[#ED6B48] text-[#ED6B48] bg-[#ED6B48]/10' 
                      : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'}`}
                >
                  {varietal}
                </button>
              ))}
            </div>
          )}

        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {cargando ? (
          <div className="flex justify-center py-20">
            <span className="text-sm font-bold uppercase tracking-widest text-white/40 animate-pulse">Cargando bodega...</span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-white/40 text-sm font-medium">
            No se encontraron productos para esta búsqueda/filtro.
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex justify-center items-center mb-4 gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Ordenar por:</span>
              <select 
                value={ordenActivo}
                onChange={(e) => setOrdenActivo(e.target.value)}
                className="bg-transparent text-[#F5F5DC] text-[10px] md:text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none border-b border-white/20 pb-0.5 focus:border-[#ED6B48] transition-colors"
              >
                <option value="recomendados" className="bg-[#0F1714]">Sugeridos</option>
                <option value="menor" className="bg-[#0F1714]">Menor Precio</option>
                <option value="mayor" className="bg-[#0F1714]">Mayor Precio</option>
                <option value="az" className="bg-[#0F1714]">Nombre A-Z</option>
              </select>
            </div>

            {productosFiltrados.map((producto) => (
              <div key={producto.id || producto.slug} className="flex justify-between items-center py-4 border-b border-white/10 group hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg">
                
                <div className="flex flex-col pr-4">
                  <span className="text-sm md:text-base font-bold uppercase tracking-wide  text-[#F5F5DC] leading-tight mb-0.5">
                    {producto.nombre}
                  </span>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-xs md:text-sm font-medium text-[#ED6B48]  uppercase tracking-widest mb-0.5">
                      {producto.bodega}
                    </span>
                    {/* Origen en gris (antiguo color de la bodega). Opcionalmente se añade varietal si lo deseas */}
                    <span className="text-xs md:text-sm font-medium text-white/50 uppercase tracking-widest mb-0.5">
                      {producto.origen || 'Argentina'}
                    </span>
                  </div>
                  {producto.aPedido ? (
                    <span className="text-[9px] text-[#ED6B48] font-bold uppercase mt-1 tracking-widest inline-block">
                      A pedido
                    </span>
                  ) : producto.stock <= 0 ? (
                    <span className="text-[9px] text-red-500 font-bold uppercase mt-1 tracking-widest inline-block">
                      Agotado
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col items-end shrink-0">
                  {producto.mostrarDescuento && producto.descuentoPorcentaje > 0 ? (
                    <>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="bg-[#ED6B48] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest shadow-sm">
                          {producto.descuentoPorcentaje}% OFF
                        </span>
                        <span className="text-[10px] text-white/40 font-medium line-through">
                          ${producto.precioBase?.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-base md:text-xl font-semibold text-[#F5F5DC] tracking-tighter">
                        ${producto.precioFinal?.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    /* Precio normal en Brand Orange */
                    <span className="text-base md:text-xl font-semibold text-[#F5F5DC] tracking-tighter">
                      ${producto.precioFinal?.toLocaleString() || producto.precioBase?.toLocaleString()}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-[10px] text-white/20 font-bold uppercase tracking-widest">
        D E C A N T • {new Date().getFullYear()}
      </footer>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}