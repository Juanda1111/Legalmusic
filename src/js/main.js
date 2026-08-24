/**
 * LegalMusic — Punto de entrada principal
 * 
 * SPA de gestión de estudios musicales.
 * Vanilla JavaScript + SCSS + Vite.
 * Optimizado para Samsung Galaxy A36 5G.
 */

// Importar estilos SCSS (Vite los procesa automáticamente)
import '../scss/main.scss';

// Importar módulos de inicialización
import { initializeData } from './state/initialData.js';
import { store } from './state/store.js';
import { initRouter } from './router.js';

/**
 * Inicialización de la aplicación
 * 1. Cargar datos semilla si es la primera ejecución
 * 2. Cargar estado desde localStorage al store
 * 3. Iniciar el router SPA
 */
const initApp = () => {
  // Paso 1: Inicializar datos semilla (solo primera vez)
  initializeData();

  // Paso 2: Cargar datos persistidos en el store reactivo
  store.loadFromStorage();

  // Paso 3: Iniciar el router (renderiza la vista inicial)
  initRouter();
};

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
