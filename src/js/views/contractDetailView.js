import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openConfirmDialog, openBottomSheet } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderContractDetailView(contractId) {
  const state = store.getState();
  const contract = state.contracts.find(c => c.id == contractId);
  const payments = state.payments ? state.payments.filter(p => p.contractId == contractId) : [];

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

  return `
    <div class="contract-detail">
      <!-- Cabecera -->
      <header class="page-header">
          <div class="page-header__title-group">
              <button class="btn-back" id="btnBackToContracts" aria-label="Volver a contratos">
                  ${icon('chevronLeft', 24)}
              </button>
              <h2>Detalle</h2>
          </div>
      </header>

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

      <h4 style="margin-bottom:12px;font-size:1.1rem;">Pagos Programados</h4>
      <div class="payment-list mb-4">
        ${payments.length > 0 ? payments.map(p => `
          <div class="card card--highlight status-${p.status} mb-2">
            <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <p style="font-weight:600">${p.concept}</p>
                <p style="font-size:0.75rem;color:var(--text-secondary)">Vence: ${formatDate(p.dueDate)}</p>
              </div>
              <div style="text-align:right;">
                <p style="font-weight:bold;margin-bottom:4px;">${formatCurrency(p.amount)}</p>
                <span class="badge badge--${getStatusClass(p.status)}">${getStatusLabel(p.status)}</span>
              </div>
            </div>
            ${p.status !== 'pagado' ? `
            <div class="card-footer" style="padding-top:0;border:none;">
                <button class="btn btn--primary btn--sm btn--block" id="btnMarkPaid" data-id="${p.id}" data-amount="${p.amount}">
                    Registrar Pago
                </button>
            </div>
            ` : ''}
          </div>
        `).join('') : '<p style="color:var(--text-secondary);text-align:center;padding:24px 0;">No hay pagos registrados</p>'}
      </div>

      <div class="form-row" style="margin-top:24px;margin-bottom:32px;">
        <button class="btn btn--secondary" id="btnChangeStatus" data-id="${contract.id}" style="flex:1;">
          Cambiar Estado
        </button>
      </div>
    </div>
  `;
}

export function initContractDetailViewEvents(contractId) {
  // Botones de volver
  const btnBackError = document.getElementById('btnBackError');
  if (btnBackError) btnBackError.addEventListener('click', () => navigate('contracts'));

  const btnBack = document.getElementById('btnBackToContracts');
  if (btnBack) btnBack.addEventListener('click', () => navigate('contracts'));

  const container = document.querySelector('.contract-detail');
  if (!container) return;

  container.addEventListener('click', (e) => {
    // Registrar pago
    const btnPayment = e.target.closest('#btnMarkPaid');
    if (btnPayment) {
      const pid = parseInt(btnPayment.dataset.id, 10);
      const amount = btnPayment.dataset.amount;
      openConfirmDialog('Registrar Pago', `¿Confirmar recepción de ${formatCurrency(amount)}?`, () => {
        store.updatePayment(pid, { status: 'pagado', paidDate: new Date().toISOString().split('T')[0] });
        showToast({ message: 'Pago registrado', type: 'success' });
        navigate('contract-detail', contractId);
      });
      return;
    }

    // Cambiar estado del contrato
    const btnStatus = e.target.closest('#btnChangeStatus');
    if (btnStatus) {
      const id = parseInt(btnStatus.dataset.id, 10);
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
