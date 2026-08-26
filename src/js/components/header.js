import { icon } from './icons.js';
import { authService } from '../services/authService.js';
import { navigate } from '../router.js';

export const renderHeader = (user, notificationCount) => {
  if (!user) return '';

  const badgeHTML = notificationCount > 0
    ? `<span class="header__badge">${notificationCount}</span>`
    : '';

  return `
    <header class="app-header">
      <div class="header__left">
        <h1 class="header__brand">LegalMusic ${icon('music', 18)}</h1>
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
