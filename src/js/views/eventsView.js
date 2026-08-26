import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatDate, getStatusLabel, getStatusClass } from '../utils/formatters.js';
import { openModal, closeModal, openConfirmDialog, openBottomSheet } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderEventsView() {
    const state = store.getState();
    const events = state.events || [];
    const contracts = state.contracts || [];
    const riders = state.riders || [];

    // Ordenar eventos por fecha ascendente
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    return `
        <div class="events-view">
            <!-- Cabecera -->
            <header class="page-header">
                <div class="page-header__title-group">
                    <button class="btn-back" id="btnBackDashboard" aria-label="Volver al inicio">
                        ${icon('chevronLeft', 24)}
                    </button>
                    <h2>Eventos</h2>
                </div>
                <button class="btn btn--primary btn--sm" id="btnNewEventHeader">
                    ${icon('plus', 16)} Nuevo
                </button>
            </header>

            <div class="event-list" id="eventListContainer">
                ${renderEventList(sortedEvents, contracts, riders)}
            </div>
        </div>
    `;
}

function renderEventList(events, contracts, riders) {
    if (events.length === 0) {
        return `
            <div class="empty-state">
                ${icon('calendar', 48)}
                <p>No hay eventos programados</p>
            </div>
        `;
    }

    return events.map(e => {
        const contract = contracts.find(c => String(c.id) === String(e.contractId));
        const hasRider = riders.some(rider => String(rider.eventId) === String(e.id));
        return `
            <div class="compact-card compact-card--highlight status-${e.status} event-card" data-id="${e.id}">
                <div class="compact-card__header">
                    <strong>${e.name}</strong>
                    <span class="badge badge--${getStatusClass(e.status)}">${getStatusLabel(e.status)}</span>
                </div>
                <div class="compact-card__body">
                    <div class="detail-row">
                        ${icon('mapPin', 14)} <span>${e.venue}</span>
                    </div>
                    <div class="detail-row">
                        ${icon('calendar', 14)} <span>${formatDate(e.date)} · ${e.showTime}</span>
                    </div>
                    ${contract ? `
                    <div class="detail-row">
                        ${icon('fileText', 14)} <span>Contrato ref: ${contract.title}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="compact-card__footer">
                    <span class="badge badge--type">${e.capacity} px</span>
                    ${hasRider ? `
                        <button class="btn btn--ghost btn--sm btn-ver-rider" data-id="${e.id}" style="padding:0;height:auto;min-height:0;color:var(--primary);">
                            ${icon('headphones', 14)} Ver Rider
                        </button>
                    ` : '<span style="font-size:0.75rem;color:var(--text-secondary)">Sin rider</span>'}
                </div>
            </div>
        `;
    }).join('');
}

export function initEventsViewEvents() {
    const container = document.querySelector('.events-view');
    if (!container) return;

    // Botón volver
    const btnBack = document.getElementById('btnBackDashboard');
    if (btnBack) {
        btnBack.addEventListener('click', () => navigate('dashboard'));
    }

    // Delegación
    container.addEventListener('click', (e) => {
        // Nuevo evento
        if (e.target.closest('#btnNewEventHeader')) {
            const contracts = store.getState().contracts || [];
            openModal('Nuevo Evento', renderEventForm({}, contracts));
            bindEventFormEvents();
            return;
        }

        // Ver rider
        const btnRider = e.target.closest('.btn-ver-rider');
        if (btnRider) {
            e.stopPropagation();
            navigate('riders');
            return;
        }

        // Detalle de evento
        const card = e.target.closest('.event-card');
        if (card) {
            const id = card.dataset.id;
            const event = store.getState().events.find(ev => String(ev.id) === id);
            if (event) {
                showEventDetail(event);
            }
        }
    });
}

function showEventDetail(event) {
    const state = store.getState();
    const contract = state.contracts.find(c => String(c.id) === String(event.contractId));

    const html = `
        <div class="event-detail-sheet">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                <h3 style="margin:0; font-size:1.25rem;">${event.name}</h3>
                <span class="badge badge--${getStatusClass(event.status)}">${getStatusLabel(event.status)}</span>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom: 24px;">
                <p style="display:flex; gap:8px; color:var(--text-secondary); font-size:0.875rem;">
                    ${icon('mapPin', 16)} <strong style="color:var(--text-primary)">${event.venue}</strong>
                </p>
                <p style="display:flex; gap:8px; color:var(--text-secondary); font-size:0.875rem;">
                    ${icon('calendar', 16)} <strong style="color:var(--text-primary)">${formatDate(event.date)}</strong>
                </p>
                <p style="display:flex; gap:8px; color:var(--text-secondary); font-size:0.875rem;">
                    ${icon('clock', 16)} 
                    <span>Soundcheck: <strong style="color:var(--text-primary)">${event.soundcheckTime}</strong> | Show: <strong style="color:var(--text-primary)">${event.showTime}</strong></span>
                </p>
                <p style="display:flex; gap:8px; color:var(--text-secondary); font-size:0.875rem;">
                    ${icon('users', 16)} Capacidad: <strong style="color:var(--text-primary)">${event.capacity} pax</strong>
                </p>
                ${contract ? `
                <p style="display:flex; gap:8px; color:var(--text-secondary); font-size:0.875rem;">
                    ${icon('fileText', 16)} Contrato: <strong style="color:var(--text-primary)">${contract.title}</strong>
                </p>
                ` : ''}
            </div>

            ${event.notes ? `
            <div style="background:var(--surface-elevated); padding:12px; border-radius:var(--radius-md); margin-bottom:24px;">
                <p style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">Notas:</p>
                <p style="font-size:0.875rem;">${event.notes}</p>
            </div>
            ` : ''}

            <div class="form-row">
                <button class="btn btn--secondary" id="btnEditEvent" data-id="${event.id}" style="flex:1;">
                    ${icon('edit', 16)} Editar
                </button>
                <button class="btn btn--danger" id="btnDeleteEvent" data-id="${event.id}" style="flex:1;">
                    ${icon('trash', 16)} Eliminar
                </button>
            </div>
        </div>
    `;
    openBottomSheet({
        title: 'Detalle del Evento',
        content: html
    });

    document.getElementById('btnEditEvent')?.addEventListener('click', () => {
        closeModal();
        const contracts = store.getState().contracts || [];
        openModal('Editar Evento', renderEventForm(event, contracts));
        bindEventFormEvents();
    });

    document.getElementById('btnDeleteEvent')?.addEventListener('click', () => {
        openConfirmDialog('¿Estás seguro de eliminar este evento?', () => {
            closeModal();
            store.deleteEvent(event.id);
            showToast({ message: 'Evento eliminado', type: 'success' });
            
            // Re-render safe list
            const listContainer = document.getElementById('eventListContainer');
            if (listContainer) {
                const events = store.getState().events || [];
                const contracts = store.getState().contracts || [];
                listContainer.innerHTML = renderEventList(events, contracts);
            }
        });
    });
}

function renderEventForm(event = {}, contracts = []) {
    return `
        <form id="eventForm" class="standard-form">
            <input type="hidden" name="id" value="${event.id || ''}">
            <div class="form-group">
                <label class="form-label">Nombre del Evento</label>
                <input type="text" class="form-control" name="name" value="${event.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Lugar</label>
                <input type="text" class="form-control" name="venue" value="${event.venue || ''}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Fecha</label>
                    <input type="date" class="form-control" name="date" value="${event.date || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Capacidad</label>
                    <input type="number" class="form-control" name="capacity" value="${event.capacity || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Soundcheck</label>
                    <input type="time" class="form-control" name="soundcheckTime" value="${event.soundcheckTime || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Show</label>
                    <input type="time" class="form-control" name="showTime" value="${event.showTime || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Contrato Vinculado</label>
                <select class="form-control form-select" name="contractId">
                    <option value="">Ninguno</option>
                    ${contracts.map(c => `
                        <option value="${c.id}" ${event.contractId == c.id ? 'selected' : ''}>${c.title}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Estado</label>
                <select class="form-control form-select" name="status" required>
                    <option value="programado" ${event.status === 'programado' ? 'selected' : ''}>Programado</option>
                    <option value="planeado" ${event.status === 'planeado' ? 'selected' : ''}>Planeado</option>
                    <option value="confirmado" ${event.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="en_curso" ${event.status === 'en_curso' ? 'selected' : ''}>En Curso</option>
                    <option value="finalizado" ${event.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                    <option value="cancelado" ${event.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Notas</label>
                <textarea class="form-control form-textarea" name="notes">${event.notes || ''}</textarea>
            </div>
            <button type="submit" class="btn btn--primary btn--block">Guardar Evento</button>
        </form>
    `;
}

function bindEventFormEvents() {
    const form = document.getElementById('eventForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const eventData = Object.fromEntries(formData.entries());
            eventData.capacity = parseInt(eventData.capacity, 10);
            
            if (eventData.id) {
                const existingEvent = store.getState().events.find(event => String(event.id) === eventData.id);
                if (!existingEvent) return;
                eventData.id = existingEvent.id;
                store.updateEvent(existingEvent.id, eventData);
                showToast({ message: 'Evento actualizado', type: 'success' });
            } else {
                eventData.id = Date.now();
                store.addEvent(eventData);
                showToast({ message: 'Evento creado', type: 'success' });
            }
            
            closeModal();
            // Re-render safe list
            const listContainer = document.getElementById('eventListContainer');
            if (listContainer) {
                const events = store.getState().events || [];
                const contracts = store.getState().contracts || [];
                // Sort array 
                events.sort((a, b) => new Date(a.date) - new Date(b.date));
                listContainer.innerHTML = renderEventList(events, contracts);
            }
        });
    }
}
