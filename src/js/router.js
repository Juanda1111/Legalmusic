// Router SPA con guard de autenticación
import { authService } from './services/authService.js';
import { renderHeader, initHeaderEvents } from './components/header.js';
import { renderBottomNav, initBottomNavEvents } from './components/bottomNav.js';
import { notificationEngine } from './services/notificationEngine.js';
import { store } from './state/store.js';

// Importar todas las vistas
import { renderAuthView, initAuthViewEvents } from './views/authView.js';
import { renderDashboardView, initDashboardViewEvents } from './views/dashboardView.js';
import { renderContractsView, initContractsViewEvents } from './views/contractsView.js';
import { renderContractDetailView, initContractDetailViewEvents } from './views/contractDetailView.js';
import { renderEventsView, initEventsViewEvents } from './views/eventsView.js';
import { renderRidersView, initRidersViewEvents } from './views/ridersView.js';
import { renderPaymentsView, initPaymentsViewEvents } from './views/paymentsView.js';
import { renderNotificationsView, initNotificationsViewEvents } from './views/notificationsView.js';

// Registro de rutas con sus funciones de renderizado e inicialización de eventos
const ROUTES = {
  'auth': {
    render: renderAuthView,
    init: initAuthViewEvents,
    requiresAuth: false
  },
  'dashboard': {
    render: renderDashboardView,
    init: initDashboardViewEvents,
    requiresAuth: true
  },
  'contracts': {
    render: renderContractsView,
    init: initContractsViewEvents,
    requiresAuth: true
  },
  'contract-detail': {
    render: renderContractDetailView,
    init: initContractDetailViewEvents,
    requiresAuth: true
  },
  'events': {
    render: renderEventsView,
    init: initEventsViewEvents,
    requiresAuth: true
  },
  'riders': {
    render: renderRidersView,
    init: initRidersViewEvents,
    requiresAuth: true
  },
  'payments': {
    render: renderPaymentsView,
    init: initPaymentsViewEvents,
    requiresAuth: true
  },
  'notifications': {
    render: renderNotificationsView,
    init: initNotificationsViewEvents,
    requiresAuth: true
  }
};

// Obtener la vista actual desde el hash de la URL
export const getCurrentView = () => {
  const hash = window.location.hash.substring(1);
  // Soportar parámetros: #contract-detail:c-1
  const [viewId] = hash.split(':');
  return viewId || 'dashboard';
};

// Obtener parámetros del hash (ej: #contract-detail:c-1 -> 'c-1')
export const getViewParam = () => {
  const hash = window.location.hash.substring(1);
  const parts = hash.split(':');
  return parts.length > 1 ? parts[1] : null;
};

// Navegar a una vista
export const navigate = (viewId, param) => {
  const nextHash = param ? `#${viewId}:${param}` : `#${viewId}`;

  if (window.location.hash === nextHash) {
    renderView(viewId);
  } else {
    window.location.hash = nextHash;
  }
};

// Renderizar la vista actual
export const renderView = (viewId) => {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Determinar la vista base (sin parámetros)
  const baseViewId = viewId.split(':')[0];
  const route = ROUTES[baseViewId] || ROUTES['dashboard'];

  // Verificar autenticación
  const isAuth = authService.isAuthenticated();

  if (route.requiresAuth && !isAuth) {
    navigate('auth');
    return;
  }

  if (baseViewId === 'auth' && isAuth) {
    navigate('dashboard');
    return;
  }

  // Actualizar estado en el store
  store.setState('currentView', baseViewId);

  if (route.requiresAuth) {
    // Vista autenticada: con header y bottom nav
    const user = authService.getCurrentUser();

    // Actualizar notificaciones
    const payments = store.getState().payments;
    notificationEngine.checkPayments(payments);
    const notifCount = notificationEngine.getNotificationCount();

    // Obtener parámetro de vista si existe
    const param = getViewParam();

    // Renderizar layout completo
    appContainer.innerHTML = `
      ${renderHeader(user, notifCount)}
      <main class="main-content">
        ${param ? route.render(param) : route.render()}
      </main>
      ${renderBottomNav(baseViewId)}
    `;

    // Inicializar eventos del layout
    initHeaderEvents();
    initBottomNavEvents();

    // Inicializar eventos de la vista
    if (typeof route.init === 'function') {
      if (param) {
        route.init(param);
      } else {
        route.init();
      }
    }
  } else {
    // Vista sin autenticación (login/registro)
    appContainer.innerHTML = `
      <main class="main-content main-content--full">
        ${route.render()}
      </main>
    `;

    // Inicializar eventos de la vista
    if (typeof route.init === 'function') {
      route.init();
    }
  }
};

// Inicializar el router
export const initRouter = () => {
  // Escuchar cambios en el hash
  window.addEventListener('hashchange', () => {
    const viewId = getCurrentView();
    renderView(viewId);
  });

  // Renderizado inicial
  const viewId = getCurrentView();
  renderView(viewId);
};
