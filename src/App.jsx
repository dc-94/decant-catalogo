import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// CONTEXTOS (Solo dejamos el de Catálogo)
import { CatalogProvider } from './context/CatalogContext';

// COMPONENTES GLOBALES MINIMALISTAS
import ScrollToTop from './components/public/ScrollToTop';

// CARGA PEREZOSA (Solo cargamos la página del catálogo)
const CatalogoRapido = lazy(() => import('./pages/CatalogoRapido'));

function App() {
  return (
    <HelmetProvider>
      <CatalogProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-[#0F1714]">
              <img src="/assets/brand/logo-white-T.png" className="h-8 animate-pulse opacity-50" />
            </div>
          }>
            <Routes>
              {/* Cualquier intento de entrar al inicio o rutas viejas redirige al catálogo */}
              <Route path="/" element={<CatalogoRapido />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </CatalogProvider>
    </HelmetProvider>
  );
}

export default function AppWrapper() {
  return <App />;
}