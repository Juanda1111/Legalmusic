import { icon } from './icons.js';
import { authService } from '../services/authService.js';
import { navigate } from '../router.js';

export const renderHeader = (user, notificationCount, currentView) => {
  if (!user) return '';

  const pageContext = {
    dashboard: { title: 'Inicio' },
    contracts: { title: 'Contratos', backId: 'btnBackDashboard', backLabel: 'Volver al inicio', backView: 'dashboard' },
    events: { title: 'Eventos', backId: 'btnBackDashboard', backLabel: 'Volver al inicio', backView: 'dashboard' },
    'contract-detail': { title: 'Detalle', backId: 'btnBackToContracts', backLabel: 'Volver a contratos', backView: 'contracts' },
    riders: { title: 'Riders Técnicos', backId: 'btnBackDashboard', backLabel: 'Volver al inicio', backView: 'dashboard' },
    payments: { title: 'Pagos', description: 'Controla lo recibido y lo que está por cobrar.', backId: 'btnBackDashboard', backLabel: 'Volver al inicio', backView: 'dashboard' },
    notifications: { title: 'Notificaciones', backId: 'btnBackDashboard', backLabel: 'Volver al inicio', backView: 'dashboard' }
  }[currentView];

  const badgeHTML = notificationCount > 0
    ? `<span class="header__badge">${notificationCount}</span>`
    : '';

  return `
    <header class="app-header">
      <div class="header__left">
        ${pageContext?.backId ? `
          <button class="header__back" id="${pageContext.backId}" data-back-view="${pageContext.backView}" aria-label="${pageContext.backLabel}">
            ${icon('chevronLeft', 20)}
          </button>
        ` : ''}
        <button class="header__brand" id="btnBrandDashboard" aria-label="Ir al inicio">
          <span>LegalMusic</span> ${icon('music', 18)}
        </button>
        ${pageContext ? `
          <span class="header__context">
            ${pageContext.title}
            ${pageContext.description ? `<small>${pageContext.description}</small>` : ''}
          </span>
        ` : ''}
      </div>
      <div class="header__right">
        <button class="header__bell" id="btnNotifications" aria-label="Notificaciones">
          ${icon('bell', 20)}
          ${badgeHTML}
        </button>
        <button class="header__logout" id="btnLogout" aria-label="Cerrar sesión">
          ${icon('logOut', 20)}
        </button>
      </div>
    </header>
  `;
};

export const initHeaderEvents = () => {
  const btnBack = document.querySelector('.header__back');
  if (btnBack) {
    btnBack.addEventListener('click', () => navigate(btnBack.dataset.backView));
  }

  const btnBrand = document.getElementById('btnBrandDashboard');
  if (btnBrand) {
    btnBrand.addEventListener('click', () => navigate('dashboard'));
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      authService.logout();
      navigate('auth');
    });
  }

  const btnNotifications = document.getElementById('btnNotifications');
  if (btnNotifications) {
    btnNotifications.addEventListener('click', () => {
      navigate('notifications');
    });
  }
};
