import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openModal, closeModal, openConfirmDialog, openBottomSheet } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { contractService } from '../services/contractService.js';
import { navigate } from '../router.js';

let currentFilter = 'Todos';
const FILTERS = ['Todos', 'Borrador', 'Firmado', 'En Ejecución', 'Completado', 'Cancelado'];

export function renderContractsView() {
    return `
        <div class="contracts-view">
            <!-- Cabecera de la vista -->
            <header class="page-header">
                <div class="page-header__title-group">
                    <button class="btn-back" id="btnBackDashboard" aria-label="Volver al inicio">
                        ${icon('chevronLeft', 24)}
                    </button>
                    <h2>Contratos</h2>
                </div>
                <button class="btn btn--primary btn--sm" id="btnNewContractHeader">
                    ${icon('plus', 16)} Nuevo
                </button>
            </header>

            <!-- Barra de filtros -->
            <div class="filter-bar" id="contractsFilterBar">
                ${renderFilters()}
            </div>

            <!-- Lista de contratos -->
            <div class="contract-list" id="contractListContainer">
                ${renderContractList()}
            </div>
        </div>
    `;
}

function renderFilters() {
    return FILTERS.map(f => `
        <button class="filter-pill ${currentFilter === f ? 'active' : ''}" data-filter="${f}">
            ${f}
        </button>
    `).join('');
}

function renderContractList() {
    const state = store.getState();
    const allContracts = state.contracts || [];
    
    let filteredContracts = allContracts;
    if (currentFilter !== 'Todos') {
        const filterMap = {
            'Borrador': 'borrador',
            'Firmado': 'firmado',
            'En Ejecución': 'en_ejecucion',
            'Completado': 'completado',
            'Cancelado': 'cancelado'
        };
        filteredContracts = allContracts.filter(c => c.status === filterMap[currentFilter]);
    }

    if (filteredContracts.length === 0) {
        return `
            <div class="empty-state">
                ${icon('fileText', 48)}
                <p>No hay contratos en esta categoría</p>
            </div>
        `;
    }

    return filteredContracts.map(c => {
        const payments = (store.getState().payments || []).filter(payment => String(payment.contractId) === String(c.id));
        const nextPayment = contractService.getNextPayment(payments);
        return `
        <div class="compact-card compact-card--highlight status-${c.status}" data-id="${c.id}">
            <div class="compact-card__header">
                <strong>${c.title}</strong>
                <span class="badge badge--${getStatusClass(c.status)}">${getStatusLabel(c.status)}</span>
            </div>
            <div class="compact-card__body">
                        <div class="detail-row">
                            ${icon('user', 14)} <span>${c.clientName || c.client || 'Cliente sin especificar'}</span>
                </div>
                <div class="detail-row">
                    ${icon('calendar', 14)} <span>${formatDate(c.startDate)}</span>
                </div>
                ${nextPayment ? `<div class="detail-row"><span>Próximo pago: ${formatDate(nextPayment.dueDate)} · ${formatCurrency(nextPayment.amount)}</span></div>` : ''}
            </div>
            <div class="compact-card__footer">
                <span class="badge badge--type">${c.type}</span>
                <span class="amount">${formatCurrency(c.amount)}</span>
            </div>
        </div>
    `;
    }).join('');
}

export function initContractsViewEvents(action) {
    const container = document.querySelector('.contracts-view');
    if (!container) return;

    // Botón volver
    const btnBack = document.getElementById('btnBackDashboard');
    if (btnBack) {
        btnBack.addEventListener('click', () => navigate('dashboard'));
    }

    // Delegación de eventos para filtros y tarjetas
    container.addEventListener('click', (e) => {
        // Clic en filtro
        const filterPill = e.target.closest('.filter-pill');
        if (filterPill) {
            currentFilter = filterPill.dataset.filter;
            
            // Actualizar DOM parcialmente (SIN reemplazar toda la app)
            document.getElementById('contractsFilterBar').innerHTML = renderFilters();
            document.getElementById('contractListContainer').innerHTML = renderContractList();
            return;
        }

        // Clic en nuevo contrato
        if (e.target.closest('#btnNewContractHeader')) {
            openModal('Nuevo Contrato', renderContractForm());
            bindContractFormEvents();
            return;
        }

        // Clic en tarjeta de contrato
        const card = e.target.closest('.compact-card');
        if (card) {
            const id = card.dataset.id;
            const contract = store.getState().contracts.find(c => String(c.id) === id);
            if (contract) {
                showContractDetail(contract);
            }
        }
    });

    if (action === 'new') {
        openModal('Nuevo Contrato', renderContractForm());
        bindContractFormEvents();
    }
}

function renderContractForm(contract = {}) {
    return `
        <form id="contractForm" class="standard-form">
            <input type="hidden" name="id" value="${contract.id || ''}">
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="form-control" name="title" value="${contract.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Tipo</label>
                <select class="form-control form-select" name="type" required>
                    <option value="grabacion" ${contract.type === 'grabacion' ? 'selected' : ''}>Grabación</option>
                    <option value="mezcla" ${contract.type === 'mezcla' ? 'selected' : ''}>Mezcla</option>
                    <option value="produccion" ${contract.type === 'produccion' ? 'selected' : ''}>Producción</option>
                    <option value="evento" ${contract.type === 'evento' ? 'selected' : ''}>Evento</option>
                    <option value="alquiler" ${contract.type === 'alquiler' ? 'selected' : ''}>Alquiler</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Cliente</label>
                <input type="text" class="form-control" name="clientName" value="${contract.clientName || contract.client || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Monto</label>
                <input type="number" class="form-control" name="amount" value="${contract.amount || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Modalidad de pago</label>
                <select class="form-control form-select" name="paymentFrequency">
                    <option value="">Sin calendario</option>
                    <option value="unico" ${contract.paymentFrequency === 'unico' ? 'selected' : ''}>Único pago</option>
                    <option value="diario" ${contract.paymentFrequency === 'diario' ? 'selected' : ''}>Diario</option>
                    <option value="semanal" ${contract.paymentFrequency === 'semanal' ? 'selected' : ''}>Semanal</option>
                    <option value="quincenal" ${contract.paymentFrequency === 'quincenal' ? 'selected' : ''}>Quincenal</option>
                    <option value="mensual" ${contract.paymentFrequency === 'mensual' ? 'selected' : ''}>Mensual</option>
                    <option value="trimestral" ${contract.paymentFrequency === 'trimestral' ? 'selected' : ''}>Trimestral</option>
                    <option value="semestral" ${contract.paymentFrequency === 'semestral' ? 'selected' : ''}>Semestral</option>
                    <option value="anual" ${contract.paymentFrequency === 'anual' ? 'selected' : ''}>Anual</option>
                    <option value="personalizado" ${contract.paymentFrequency === 'personalizado' ? 'selected' : ''}>Personalizado</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Valor de cuota</label>
                    <input type="number" class="form-control" name="installmentValue" value="${contract.installmentValue || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Día de pago</label>
                    <input type="number" class="form-control" name="paymentDay" min="1" max="31" value="${contract.paymentDay || ''}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Días personalizados</label>
                <input type="number" class="form-control" name="customDays" min="1" value="${contract.customDays || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Fecha inicio</label>
                    <input type="date" class="form-control" name="startDate" value="${contract.startDate || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha fin</label>
                    <input type="date" class="form-control" name="endDate" value="${contract.endDate || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Estado</label>
                <select class="form-control form-select" name="status" required>
                    <option value="borrador" ${contract.status === 'borrador' ? 'selected' : ''}>Borrador</option>
                    <option value="firmado" ${contract.status === 'firmado' ? 'selected' : ''}>Firmado</option>
                    <option value="en_ejecucion" ${contract.status === 'en_ejecucion' ? 'selected' : ''}>En Ejecución</option>
                    <option value="completado" ${contract.status === 'completado' ? 'selected' : ''}>Completado</option>
                    <option value="cancelado" ${contract.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-control form-textarea" name="description" required>${contract.description || ''}</textarea>
            </div>
            <button type="submit" class="btn btn--primary btn--block">Guardar Contrato</button>
        </form>
    `;
}

function bindContractFormEvents() {
    const form = document.getElementById('contractForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const contractData = Object.fromEntries(formData.entries());
            contractData.amount = parseFloat(contractData.amount);
            if (contractData.installmentValue) contractData.installmentValue = parseFloat(contractData.installmentValue);
            if (contractData.paymentDay) contractData.paymentDay = parseInt(contractData.paymentDay, 10);
            if (contractData.customDays) contractData.customDays = parseInt(contractData.customDays, 10);
            
            if (contractData.id) {
                const existingContract = store.getState().contracts.find(contract => String(contract.id) === contractData.id);
                if (!existingContract) return;
                contractData.id = existingContract.id;
                store.updateContract(existingContract.id, contractData);
                showToast({ message: 'Contrato actualizado', type: 'success' });
            } else {
                contractData.id = Date.now();
                store.addContract(contractData);
                showToast({ message: 'Contrato creado', type: 'success' });
            }
            
            closeModal();
            // Re-render list safely
            const listContainer = document.getElementById('contractListContainer');
            if (listContainer) listContainer.innerHTML = renderContractList();
        });
    }
}

function showContractDetail(contract) {
    navigate('contract-detail', contract.id);
}
