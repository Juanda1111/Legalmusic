import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate, isBeforeToday, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openModal, closeModal, openBottomSheet } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { renderWhatsAppButton, initWhatsAppButtons } from '../components/notifications/WhatsAppButton.js';
import { renderCalendarButton, initCalendarButtons } from '../components/notifications/CalendarButton.js';
import { renderPaymentRow } from '../components/notifications/PaymentRow.js';
import { REMINDER_OPTIONS_PAGOS } from '../utils/notifications/reminders.js';

export function renderContractDetailView(contractId) {
  const state = store.getState();
  const contract = state.contracts.find(c => c.id == contractId);
  const payments = state.payments ? state.payments.filter(p => String(p.contractId) === String(contractId)).map(payment => ({
    ...payment,
    status: payment.status === 'pendiente' && isBeforeToday(payment.dueDate) ? 'atrasado' : payment.status
  })) : [];

  if (!contract) {
    return `
      <div class="empty-state">
        <button class="btn-back mb-4" id="btnBackError">${icon('chevronLeft', 24)}</button>
        <p>Contrato no encontrado</p>
      </div>
    `;
  }

  const statusClass = getStatusClass(contract.status);
  
  // Use amount from contract creation
  const totalAmount = Number(contract.amount || 0);
  const paidAmount = payments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const pendingAmount = totalAmount - paidAmount;
  const progressPercent = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  const nextPayment = payments.find(payment => payment.status !== 'pagado');
  const paidCount = payments.filter(payment => payment.status === 'pagado').length;

  return `
    <div class="contract-detail">
      <div class="detail-header mb-4">
        <span class="badge badge--${statusClass} mb-2" style="display:inline-block">${getStatusLabel(contract.status)}</span>
        <h2 class="mb-1" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 4px;">${contract.title}</h2>
        <p class="text-sm text-secondary">ID: ${contract.id} | Tipo: <span style="text-transform: capitalize">${contract.type || 'General'}</span></p>
      </div>

      <div class="card mb-4">
        <div class="card-body">
            <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">${icon('user', 18)} Cliente</h4>
            <p><strong>${contract.clientName || contract.client || 'No especificado'}</strong></p>
            ${contract.description ? `<p style="margin-top:8px;font-size:0.875rem;color:var(--text-secondary)">${contract.description}</p>` : ''}
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
            <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">${icon('calendar', 18)} Fechas</h4>
            <div style="display:flex; gap: 24px;">
              <div>
                <p style="font-size:0.75rem;color:var(--text-secondary)">Inicio</p>
                <p style="font-weight:600">${formatDate(contract.startDate)}</p>
              </div>
              <div>
                <p style="font-size:0.75rem;color:var(--text-secondary)">Fin</p>
                <p style="font-weight:600">${formatDate(contract.endDate)}</p>
              </div>
            </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
            <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">${icon('dollarSign', 18)} Financiero</h4>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:var(--text-secondary)">Total Acordado:</span>
              <strong style="font-size:1.1rem">${formatCurrency(totalAmount)}</strong>
            </div>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
              <span style="color:var(--text-secondary)">Por Cobrar:</span>
              <strong style="color:var(--warning)">${formatCurrency(Math.max(0, pendingAmount))}</strong>
            </div>

            <div class="contract-financial-grid">
              <span>Cuotas pagadas <strong>${paidCount}</strong></span>
              <span>Cuotas pendientes <strong>${payments.length - paidCount}</strong></span>
              <span>Próximo pago <strong>${nextPayment ? `${formatCurrency(nextPayment.amount)} · ${formatDate(nextPayment.dueDate)}` : 'Sin pagos'}</strong></span>
              <span>Modalidad <strong>${contract.paymentFrequency || 'No configurada'}</strong></span>
            </div>

            <div class="notification-actions">
              ${renderWhatsAppButton({ phone: contract.telefono || contract.phone, templateKey: 'pago_recordatorio', templateData: { nombreCliente: contract.clientName || contract.client || 'Cliente', valor: formatCurrency(nextPayment?.amount || 0), fecha: nextPayment ? formatDate(nextPayment.dueDate) : 'la fecha indicada' }, label: 'Enviar recordatorio por WhatsApp' })}
            </div>

            <div style="margin-bottom: 8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;">
                <span>Progreso de Pagos</span>
                <span>${progressPercent}%</span>
              </div>
              <div style="height:8px;background:var(--surface-elevated);border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${progressPercent}%;background:var(--success);border-radius:4px;transition:width 0.3s ease;"></div>
              </div>
            </div>
        </div>
      </div>

      <h4 style="margin-bottom:12px;font-size:1.1rem;">Calendario e historial de pagos</h4>
      <div class="payment-list mb-4">
        ${payments.length > 0 ? payments.map(p => `
          <div class="card card--highlight status-${p.status} mb-2">
            ${renderPaymentRow({ payment: p, contract })}
            ${p.status !== 'pagado' ? `<div class="card-footer" style="padding-top:0;border:none;"><button class="btn btn--primary btn--sm btn--block" id="btnMarkPaid" data-id="${p.id}" data-amount="${p.amount}">Registrar Pago</button></div>` : ''}
          </div>
        `).join('') : '<p style="color:var(--text-secondary);text-align:center;padding:24px 0;">No hay pagos registrados</p>'}
      </div>

      <div class="form-row" style="margin-top:24px;margin-bottom:32px;">
        <button class="btn btn--secondary" id="btnChangeStatus" data-id="${contract.id}" style="flex:1;">
          Cambiar Estado
        </button>
        <button class="btn btn--danger" id="btnDeleteContract" data-id="${contract.id}" style="flex:1;">
          Eliminar contrato
        </button>
      </div>
    </div>
  `;
}

export function initContractDetailViewEvents(contractId) {
  // Botones de volver
  const btnBackError = document.getElementById('btnBackError');
  if (btnBackError) btnBackError.addEventListener('click', () => navigate('contracts'));

  const container = document.querySelector('.contract-detail');
  if (!container) return;

  initWhatsAppButtons(container);
  initCalendarButtons(container);

  container.addEventListener('click', (e) => {
    // Registrar pago
    const btnPayment = e.target.closest('#btnMarkPaid');
    if (btnPayment) {
      const pid = btnPayment.dataset.id;
      const amount = btnPayment.dataset.amount;
      openPaymentModal(pid, amount, contractId);
      return;
    }

    // Cambiar estado del contrato
    const btnStatus = e.target.closest('#btnChangeStatus');
    if (btnStatus) {
      const id = btnStatus.dataset.id;
      openBottomSheet({
        title: 'Cambiar Estado',
        content: `
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button class="btn btn--secondary" onclick="window.updateContractStatus(${id}, 'borrador')">Borrador</button>
                <button class="btn btn--secondary" onclick="window.updateContractStatus(${id}, 'firmado')">Firmado</button>
                <button class="btn btn--secondary" onclick="window.updateContractStatus(${id}, 'en_ejecucion')">En Ejecución</button>
                <button class="btn btn--success" onclick="window.updateContractStatus(${id}, 'completado')">Completado</button>
                <button class="btn btn--danger" onclick="window.updateContractStatus(${id}, 'cancelado')">Cancelado</button>
            </div>
        `
      });
      return;
    }

    const btnDelete = e.target.closest('#btnDeleteContract');
    if (btnDelete) {
      openConfirmDialog('Eliminar contrato', 'Se eliminarán también sus pagos programados. ¿Deseas continuar?', () => {
        store.deleteContract(btnDelete.dataset.id);
        showToast({ message: 'Contrato eliminado', type: 'success' });
        navigate('contracts');
      });
    }
  });
}

function openPaymentModal(paymentId, amount, contractId) {
  const today = new Date();
  const paidDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  const modal = openModal({
    title: 'Registrar pago',
    content: `
      <form id="paymentForm" class="standard-form">
        <div class="form-group">
          <label class="form-label">Valor pagado</label>
          <input class="form-control" type="number" name="amount" value="${amount}" min="0" required>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha real del pago</label>
          <input class="form-control" type="date" name="paidDate" value="${paidDate}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Observación</label>
          <textarea class="form-control form-textarea" name="notes" placeholder="Opcional"></textarea>
        </div>
        <button class="btn btn--primary btn--block" type="submit">Marcar como pagado</button>
      </form>
    `
  });

  modal.querySelector('#paymentForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    store.updatePayment(paymentId, {
      amount: Number(data.get('amount')),
      paidDate: data.get('paidDate'),
      notes: data.get('notes'),
      status: 'pagado'
    });
    closeModal();
    showToast({ message: 'Pago registrado', type: 'success' });
    setTimeout(() => navigate('contract-detail', contractId), 300);
  });
}

// Global handler for bottom sheet status change
window.updateContractStatus = function(id, status) {
  store.updateContract(id, { status });
  showToast({ message: 'Estado actualizado', type: 'success' });
  const bottomSheet = document.querySelector('.bottom-sheet');
  if (bottomSheet) bottomSheet.remove();
  navigate('contract-detail', id);
};
