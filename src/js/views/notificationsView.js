import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { notificationEngine } from '../services/notificationEngine.js';
import { navigate } from '../router.js';

export function renderNotificationsView() {
  const state = store.getState();
  const contracts = state.contracts || [];
  const notifications = notificationEngine.getNotifications();

  return `
    <div class="notifications-view">
      <header class="page-header">
        <div class="page-header__title-group">
          <button class="btn-back" id="btnBackDashboard" aria-label="Volver al inicio">
            ${icon('chevronLeft', 24)}
          </button>
          <h2>Notificaciones</h2>
        </div>
        <span class="badge badge--type">${notifications.length}</span>
      </header>

      ${notifications.length === 0 ? `
        <div class="empty-state">
          ${icon('bell', 48)}
          <p>No hay notificaciones pendientes.</p>
        </div>
      ` : `
        <div class="notifications-list">
          ${notifications.map(notification => {
            const contract = contracts.find(item => item.id === notification.contractId);
            return `
              <button class="notification-item notification-item--${notification.priority}" data-payment-id="${notification.paymentId}">
                <span class="notification-item__icon">${icon('bell', 18)}</span>
                <span class="notification-item__content">
                  <strong>${notification.message}</strong>
                  <span>${contract?.title || 'Pago sin contrato'} · ${formatCurrency(notification.amount)}</span>
                  <span>Vence: ${formatDate(notification.dueDate)}</span>
                </span>
                ${icon('chevronRight', 18)}
              </button>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

export function initNotificationsViewEvents() {
  const container = document.querySelector('.notifications-view');
  if (!container) return;

  document.getElementById('btnBackDashboard')?.addEventListener('click', () => navigate('dashboard'));

  container.addEventListener('click', (event) => {
    if (event.target.closest('.notification-item')) {
      navigate('payments');
    }
  });
}
