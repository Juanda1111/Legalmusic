import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate, formatRelativeDate, parseDate, isBeforeToday, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openConfirmDialog } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { notificationEngine } from '../services/notificationEngine.js';
import { renderEmptyState } from '../components/emptyState.js';

let currentTab = 'atrasados';

export function renderPaymentsView(action) {
  if (action === 'overdue') currentTab = 'atrasados';

  const state = store.getState();
  const payments = state.payments || [];
  const contracts = state.contracts || [];

  const pending = payments.filter(p => p.status === 'pendiente');
  const paid = payments.filter(p => p.status === 'pagado');
  const overdue = payments.filter(p => p.status === 'atrasado' || (p.status === 'pendiente' && isBeforeToday(p.dueDate)));
  const upcoming = pending.filter(payment => !isBeforeToday(payment.dueDate));

  const selectedPayment = payments.find(payment => String(payment.id) === String(action));
  if (selectedPayment) {
    currentTab = selectedPayment.status === 'pagado'
      ? 'pagados'
      : overdue.some(payment => String(payment.id) === String(selectedPayment.id))
        ? 'atrasados'
        : 'pendientes';
  }

  const totalPending = pending.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = paid.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = overdue.reduce((sum, p) => sum + Number(p.amount), 0);

  // Default tab logic
  if (currentTab === 'atrasados' && overdue.length === 0 && upcoming.length > 0) {
    currentTab = 'pendientes';
  }

  let html = `
    <div class="payments-view">
      <section class="payments-summary" aria-label="Resumen financiero">
        <div class="payments-summary__item">
          <span><span class="summary-dot summary-dot--warning"></span>Por cobrar</span>
          <h3>${formatCurrency(totalPending)}</h3>
          <small>${pending.length} cuota${pending.length === 1 ? '' : 's'}</small>
        </div>
        <div class="payments-summary__item">
          <span><span class="summary-dot summary-dot--success"></span>Cobrado</span>
          <h3>${formatCurrency(totalPaid)}</h3>
          <small>${paid.length} pago${paid.length === 1 ? '' : 's'}</small>
        </div>
        <div class="payments-summary__item">
          <span><span class="summary-dot summary-dot--danger"></span>Atrasado</span>
          <h3>${formatCurrency(totalOverdue)}</h3>
          <small>${overdue.length} cuota${overdue.length === 1 ? '' : 's'}</small>
        </div>
      </section>

      <section class="notifications-section">
        <div class="section-heading">
          <div>
            <span class="section-kicker">Seguimiento</span>
            <h2>${icon('bell', 18)} Alertas activas</h2>
          </div>
          <span class="section-count">${notificationEngine.getNotificationCount()}</span>
        </div>
        <div class="notification-list">
          ${renderNotifications()}
        </div>
      </section>

      <section class="payments-workspace">
        <div class="section-heading section-heading--list">
          <div>
            <span class="section-kicker">Detalle</span>
            <h2>Calendario de pagos</h2>
          </div>
          <span class="section-count">${payments.length}</span>
        </div>
      <div class="payment-tabs" role="tablist" aria-label="Filtrar pagos">
        <button class="payment-tab ${currentTab === 'atrasados' ? 'active' : ''}" data-tab="atrasados">
          Atrasados <span class="badge badge--danger">${overdue.length}</span>
        </button>
        <button class="payment-tab ${currentTab === 'pendientes' ? 'active' : ''}" data-tab="pendientes">
          Pendientes <span class="badge badge--warning">${upcoming.length}</span>
        </button>
        <button class="payment-tab ${currentTab === 'pagados' ? 'active' : ''}" data-tab="pagados">
          Pagados <span class="badge badge--success">${paid.length}</span>
        </button>
      </div>

      <div class="payments-list">
  `;

  let listToShow = [];
  if (currentTab === 'atrasados') listToShow = overdue;
  if (currentTab === 'pendientes') listToShow = upcoming;
  if (currentTab === 'pagados') listToShow = paid;

  if (listToShow.length === 0) {
    html += `
      ${renderEmptyState({ iconName: 'dollarSign', title: 'No hay pagos aquí', description: 'Cuando agregues contratos con calendario, sus pagos aparecerán en esta sección.' })}
    `;
  } else {
    listToShow.forEach(payment => {
      const contract = contracts.find(c => String(c.id) === String(payment.contractId)) || {};
      const statusClass = payment.status === 'atrasado' || isBeforeToday(payment.dueDate) && payment.status !== 'pagado' ? 'danger' :
                          payment.status === 'pagado' ? 'success' : 'warning';
      
      html += `
        <article class="payment-card payment-card--${statusClass}">
          <div class="payment-card__topline">
            <span class="payment-card__status-dot"></span>
            <span class="payment-card__status-label">${getStatusLabel(payment.status)}</span>
            <span class="payment-card__date">${formatDate(payment.dueDate)}</span>
          </div>
          <div class="payment-card__content">
            <div class="payment-card__info">
              <p class="payment-card__contract">${contract.title || 'Contrato desconocido'}</p>
              <h3>${payment.concept}</h3>
              <p class="payment-card__client">${contract.clientName || contract.client || 'Cliente sin especificar'}</p>
              ${payment.status === 'pagado' 
                ? `<p class="payment-card__meta">${icon('check', 14)} Pagado el ${formatDate(payment.paidDate)}</p>`
                : `<p class="payment-card__meta">${icon('clock', 14)} ${formatRelativeDate(payment.dueDate)}</p>`}
              ${payment.notes ? `<p class="payment-card__notes">${payment.notes}</p>` : ''}
            </div>
            <div class="payment-card__action">
              <strong class="payment-amount">${formatCurrency(payment.amount)}</strong>
              ${contract.id ? `<button class="btn btn--ghost btn--sm btn-view-contract" data-contract-id="${contract.id}">Ver contrato</button>` : ''}
            </div>
          </div>
          <div class="payment-card__footer">
            <span>${payment.status === 'pagado' ? 'Pago registrado' : `Vence ${formatDate(payment.dueDate)}`}</span>
            <div>
              ${payment.status !== 'pagado' ? `
                <button class="btn btn--sm btn--success btn-register-payment" data-id="${payment.id}" data-amount="${payment.amount}" data-concept="${payment.concept}">
                  Registrar Pago
                </button>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    });
  }

  html += `</div></section></div>`;
  return html;
}

function renderNotifications() {
  const notifications = notificationEngine ? notificationEngine.getNotifications() : [];
  if (notifications.length === 0) {
    return renderEmptyState({ iconName: 'bell', title: 'Sin alertas activas', description: 'Los avisos de pagos y eventos aparecerán aquí.', compact: true });
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

  requestAnimationFrame(() => {
    const calendarSection = document.querySelector('.payments-workspace');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

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
      const contractButton = e.target.closest('.btn-view-contract');
      if (contractButton) {
        navigate('contract-detail', contractButton.dataset.contractId);
        return;
      }

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
