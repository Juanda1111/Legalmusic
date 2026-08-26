import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate, formatRelativeDate, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openConfirmDialog } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { notificationEngine } from '../services/notificationEngine.js';

let currentTab = 'atrasados';

export function renderPaymentsView(action) {
  if (action === 'overdue') currentTab = 'atrasados';

  const state = store.getState();
  const payments = state.payments || [];
  const contracts = state.contracts || [];

  const pending = payments.filter(p => p.status === 'pendiente');
  const paid = payments.filter(p => p.status === 'pagado');
  const overdue = payments.filter(p => p.status === 'atrasado' || (p.status === 'pendiente' && new Date(p.dueDate) < new Date()));

  const totalPending = pending.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = paid.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = overdue.reduce((sum, p) => sum + Number(p.amount), 0);

  // Default tab logic
  if (currentTab === 'atrasados' && overdue.length === 0 && pending.length > 0) {
    currentTab = 'pendientes';
  }

  let html = `
    <div class="payments-view">
      <div class="view-header">
        <h1 class="view-title">Pagos</h1>
      </div>

      <div class="payments-summary card mb-4">
        <div class="payments-summary__item">
          <span class="text-warning">Por cobrar</span>
          <h3>${formatCurrency(totalPending)}</h3>
        </div>
        <div class="payments-summary__item">
          <span class="text-success">Cobrado</span>
          <h3>${formatCurrency(totalPaid)}</h3>
        </div>
        <div class="payments-summary__item">
          <span class="text-danger">Atrasado</span>
          <h3>${formatCurrency(totalOverdue)}</h3>
        </div>
      </div>

      <section class="notifications-section mb-4">
        <h3 class="mb-2">${icon('bell', 20)} Alertas Activas</h3>
        <div class="notification-list">
          ${renderNotifications()}
        </div>
      </section>

      <div class="payment-tabs mb-4">
        <button class="payment-tab ${currentTab === 'atrasados' ? 'active' : ''}" data-tab="atrasados">
          Atrasados <span class="badge badge--danger">${overdue.length}</span>
        </button>
        <button class="payment-tab ${currentTab === 'pendientes' ? 'active' : ''}" data-tab="pendientes">
          Pendientes <span class="badge badge--warning">${pending.length}</span>
        </button>
        <button class="payment-tab ${currentTab === 'pagados' ? 'active' : ''}" data-tab="pagados">
          Pagados <span class="badge badge--success">${paid.length}</span>
        </button>
      </div>

      <div class="payments-list">
  `;

  let listToShow = [];
  if (currentTab === 'atrasados') listToShow = overdue;
  if (currentTab === 'pendientes') listToShow = pending;
  if (currentTab === 'pagados') listToShow = paid;

  if (listToShow.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state__icon">${icon('dollarSign', 48)}</div>
        <p class="empty-state__text">No hay pagos en esta categoría.</p>
      </div>
    `;
  } else {
    listToShow.forEach(payment => {
      const contract = contracts.find(c => c.id === payment.contractId) || {};
      const statusClass = payment.status === 'atrasado' || new Date(payment.dueDate) < new Date() && payment.status !== 'pagado' ? 'danger' :
                          payment.status === 'pagado' ? 'success' : 'warning';
      
      html += `
        <div class="payment-card payment-card--${statusClass} card mb-3">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray">${contract.title || 'Contrato Desconocido'}</p>
              <h4>${payment.concept}</h4>
              <div class="payment-amount">${formatCurrency(payment.amount)}</div>
              ${payment.status === 'pagado' 
                ? `<p class="text-sm mt-1">${icon('check', 14)} Pagado el ${formatDate(payment.paidDate)}</p>` 
                : `<p class="text-sm mt-1">${icon('clock', 14)} Vence: ${formatDate(payment.dueDate)} (${formatRelativeDate(payment.dueDate)})</p>`}
              ${payment.notes ? `<p class="text-xs text-gray mt-1">${payment.notes}</p>` : ''}
            </div>
            <div class="flex flex-col items-end gap-2">
              <span class="badge badge--${statusClass}">${getStatusLabel(payment.status)}</span>
              ${payment.status !== 'pagado' ? `
                <button class="btn btn--sm btn--success btn-register-payment" data-id="${payment.id}" data-amount="${payment.amount}" data-concept="${payment.concept}">
                  Registrar Pago
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  return html;
}

function renderNotifications() {
  const notifications = notificationEngine ? notificationEngine.getNotifications() : [];
  if (notifications.length === 0) {
    return `<p class="text-sm text-gray">No hay alertas activas.</p>`;
  }

  return notifications.map(notif => {
    const priorityClass = notif.priority === 'high' ? 'notification-card--high' :
      notif.priority === 'medium' ? 'notification-card--medium' : 'notification-card--low';
    return `
      <div class="notification-card ${priorityClass}">
        <div class="notification-card__indicator"></div>
        <div>
          <p class="notification-card__message">${notif.message}</p>
          <p class="notification-card__amount">${formatCurrency(notif.amount)}</p>
        </div>
      </div>
    `;
  }).join('');
}

export function initPaymentsViewEvents(action) {
  if (action === 'overdue') currentTab = 'atrasados';
  const container = document.querySelector('.payment-tabs');
  if (container) {
    container.addEventListener('click', (e) => {
      const tab = e.target.closest('.payment-tab');
      if (tab) {
        currentTab = tab.dataset.tab;
        navigate('payments');
      }
    });
  }

  const listContainer = document.querySelector('.payments-list');
  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-register-payment');
      if (btn) {
        const id = btn.dataset.id;
        const amount = btn.dataset.amount;
        const concept = btn.dataset.concept;

        openConfirmDialog(
          'Registrar Pago',
          `¿Confirmar que se recibió el pago de ${formatCurrency(amount)} por "${concept}"?`,
          () => {
            store.updatePayment(id, {
              status: 'pagado',
              paidDate: new Date().toISOString().split('T')[0]
            });
            showToast({ message: 'Pago registrado exitosamente', type: 'success' });
            navigate('payments');
          }
        );
      }
    });
  }
}
