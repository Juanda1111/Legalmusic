import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatCurrency, formatDate, parseDate, isBeforeToday, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openBottomSheet, closeModal } from '../components/modal.js';
import { navigate } from '../router.js';
import { authService } from '../services/authService.js';
import { contractService } from '../services/contractService.js';

export function renderDashboardView() {
    const state = store.getState();
    const user = authService.getCurrentUser() || { name: 'Usuario' };
    const contracts = state.contracts || [];
    const events = state.events || [];
    const payments = state.payments || [];

    // Calcular KPIs
    const activeContracts = contracts.filter(c => c.status === 'firmado' || c.status === 'en_ejecucion');

    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);
    const upcomingEvents = events.filter(e => {
        const eDate = parseDate(e.date);
        return eDate >= now && eDate <= next30Days;
    });

    const pendingAmount = payments
        .filter(p => p.status === 'pendiente')
        .reduce((acc, p) => acc + p.amount, 0);
    const overduePayments = payments.filter(p => p.status === 'atrasado' || (p.status === 'pendiente' && isBeforeToday(p.dueDate)));
    const overdueAmount = overduePayments.reduce((acc, p) => acc + p.amount, 0);

    // Próximos eventos (máximo 3)
    const next3Events = [...events]
        .filter(e => new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Últimos pagos recibidos
    const last3Paid = payments
        .filter(p => p.status === 'pagado')
        .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))
        .slice(0, 3);

    const contractHighlights = contracts
        .map(contract => ({
            contract,
            nextPayment: contractService.getNextPayment(payments.filter(payment => String(payment.contractId) === String(contract.id)))
        }))
        .filter(item => item.nextPayment)
        .sort((a, b) => contractService.parseDate(a.nextPayment.dueDate) - contractService.parseDate(b.nextPayment.dueDate))
        .slice(0, 4);

    return `
        <div class="dashboard-view">
            <!-- Saludo -->
            <div class="dash-greeting">
                <h2 class="dash-greeting__name">Hola, ${user.name}</h2>
                <span class="dash-greeting__date">${formatDate(now.toISOString())}</span>
            </div>

            <!-- Alerta de pagos atrasados -->
            ${overduePayments.length > 0 ? `
            <div class="dash-alert">
                <div class="dash-alert__icon">${icon('alertTriangle', 18)}</div>
                <div class="dash-alert__info">
                    <strong>${overduePayments.length} pago${overduePayments.length > 1 ? 's' : ''} atrasado${overduePayments.length > 1 ? 's' : ''}</strong>
                    <span>${formatCurrency(overdueAmount)}</span>
                </div>
                <button class="dash-alert__btn" id="btnVerPagosAtrasados">Ver</button>
            </div>
            ` : ''}

            <!-- KPIs en grid 2x2 -->
            <div class="dash-kpis">
                <div class="dash-kpi dash-kpi--primary">
                    <div class="dash-kpi__icon">${icon('fileText', 20)}</div>
                    <div class="dash-kpi__data">
                        <span class="dash-kpi__value">${activeContracts.length}</span>
                        <span class="dash-kpi__label">Contratos</span>
                    </div>
                </div>
                <div class="dash-kpi dash-kpi--success">
                    <div class="dash-kpi__icon">${icon('calendar', 20)}</div>
                    <div class="dash-kpi__data">
                        <span class="dash-kpi__value">${upcomingEvents.length}</span>
                        <span class="dash-kpi__label">Eventos</span>
                    </div>
                </div>
                <div class="dash-kpi dash-kpi--warning">
                    <div class="dash-kpi__icon">${icon('dollarSign', 20)}</div>
                    <div class="dash-kpi__data">
                        <span class="dash-kpi__value">${formatCurrency(pendingAmount)}</span>
                        <span class="dash-kpi__label">Por cobrar</span>
                    </div>
                </div>
                <div class="dash-kpi dash-kpi--danger">
                    <div class="dash-kpi__icon">${icon('alertTriangle', 20)}</div>
                    <div class="dash-kpi__data">
                        <span class="dash-kpi__value">${overduePayments.length}</span>
                        <span class="dash-kpi__label">Atrasados</span>
                    </div>
                </div>
            </div>

            <!-- Próximos eventos -->
            <section class="dash-section dash-section--events">
                <h3 class="dash-section__title">Próximos Eventos</h3>
                ${next3Events.length === 0
                    ? '<p class="dash-section__empty">No hay eventos próximos</p>'
                    : next3Events.map(e => `
                    <div class="dash-event-card">
                        <div class="dash-event-card__main">
                            <strong>${e.name}</strong>
                            <span class="dash-event-card__detail">${icon('mapPin', 14)} ${e.venue}</span>
                            <span class="dash-event-card__detail">${icon('calendar', 14)} ${formatDate(e.date)} · ${e.showTime}</span>
                        </div>
                        <span class="badge badge--${getStatusClass(e.status)}">${getStatusLabel(e.status)}</span>
                    </div>
                `).join('')}
            </section>

            <section class="dash-section dash-section--contracts">
                <div class="dash-section__heading">
                    <h3 class="dash-section__title">Contratos y próximos pagos</h3>
                    <button class="btn btn--ghost btn--sm" id="btnViewContracts">Ver todos</button>
                </div>
                ${contractHighlights.length === 0
                    ? '<p class="dash-section__empty">No hay pagos programados</p>'
                    : contractHighlights.map(({ contract, nextPayment }) => `
                    <button class="dash-contract-card" data-contract-id="${contract.id}">
                        <span class="dash-contract-card__main">
                            <strong>${contract.title}</strong>
                            <span>${contract.clientName || contract.client || 'Cliente sin especificar'} · ${contractService.getPaymentFrequencyLabel(contract.paymentFrequency)}</span>
                        </span>
                        <span class="dash-contract-card__payment">
                            <strong>${formatCurrency(nextPayment.amount)}</strong>
                            <span>${formatDate(nextPayment.dueDate)}</span>
                        </span>
                    </button>
                `).join('')}
            </section>

            <!-- Actividad reciente -->
            ${last3Paid.length > 0 ? `
            <section class="dash-section dash-section--payments">
                <h3 class="dash-section__title">Pagos Recientes</h3>
                ${last3Paid.map(p => {
                    const contract = contracts.find(c => c.id === p.contractId);
                    return `
                    <div class="dash-payment-item">
                        <div class="dash-payment-item__info">
                            <strong>${p.concept}</strong>
                            <span>${contract ? contract.client : ''} · ${formatDate(p.paidDate)}</span>
                        </div>
                        <span class="dash-payment-item__amount">${formatCurrency(p.amount)}</span>
                    </div>
                `;}).join('')}
            </section>
            ` : ''}

            <!-- FAB -->
            <button class="fab" id="dashboardFab" aria-label="Crear nuevo" title="Crear nuevo">
                ${icon('plus', 24)}
            </button>
        </div>
    `;
}

export function initDashboardViewEvents() {
    document.getElementById('btnViewContracts')?.addEventListener('click', () => navigate('contracts'));

    document.querySelector('.dash-section--contracts')?.addEventListener('click', event => {
        const card = event.target.closest('.dash-contract-card');
        if (card) navigate('contract-detail', card.dataset.contractId);
    });

    const btnVerPagos = document.getElementById('btnVerPagosAtrasados');
    if (btnVerPagos) {
        btnVerPagos.addEventListener('click', () => navigate('payments', 'overdue'));
    }

    const fab = document.getElementById('dashboardFab');
    if (fab) {
        fab.addEventListener('click', () => {
            openBottomSheet({
                title: 'Crear Nuevo',
                content: `
                    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0;">
                        <button class="btn btn--primary btn--block" id="btnNewContract">
                            ${icon('fileText', 18)} Nuevo Contrato
                        </button>
                        <button class="btn btn--secondary btn--block" id="btnNewEvent">
                            ${icon('calendar', 18)} Nuevo Evento
                        </button>
                    </div>
                `
            });

            document.getElementById('btnNewContract')?.addEventListener('click', () => {
                closeModal();
                setTimeout(() => navigate('contracts', 'new'), 300);
            });
            document.getElementById('btnNewEvent')?.addEventListener('click', () => {
                closeModal();
                setTimeout(() => navigate('events', 'new'), 300);
            });
        });
    }
}
