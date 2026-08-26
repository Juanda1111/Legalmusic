import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { formatDate } from '../utils/formatters.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderRidersView() {
  const state = store.getState();
  const events = state.events || [];
  const riders = state.riders || [];

  const getRider = event => riders.find(rider => String(rider.eventId) === String(event.id));
  const eventsWithRiders = events.filter(event => getRider(event));
  const eventsWithoutRiders = events.filter(event => !getRider(event));

  let html = `
    <div class="riders-view">
      <!-- Cabecera -->
      <header class="page-header">
          <div class="page-header__title-group">
              <button class="btn-back" id="btnBackDashboard" aria-label="Volver al inicio">
                  ${icon('chevronLeft', 24)}
              </button>
              <h2>Riders Técnicos</h2>
          </div>
      </header>

      <div class="riders-container">
  `;

  if (eventsWithRiders.length === 0 && eventsWithoutRiders.length === 0) {
    html += `
      <div class="empty-state">
        ${icon('headphones', 48)}
        <p>No hay eventos programados ni riders configurados</p>
      </div>
    `;
  } else {
    // 1. List events that DO have riders
    eventsWithRiders.forEach(event => {
      const rider = getRider(event);
      html += `
        <div class="card mb-4" data-event-id="${event.id}">
          <div class="card-header" style="align-items:center;">
            <div style="flex:1;">
              <h3 style="font-size:1.1rem;margin-bottom:4px;">${event.name}</h3>
              <p style="font-size:0.75rem;color:var(--text-secondary);display:flex;align-items:center;gap:4px;">
                ${icon('calendar', 12)} ${formatDate(event.date)}
              </p>
            </div>
            <button class="btn btn--sm btn--primary btn-edit-rider" data-event-id="${event.id}">
              ${icon('edit', 14)} Editar
            </button>
          </div>
          
          <div class="card-body">
            <!-- PA & Monitores -->
            <div class="rider-category">
              <div class="rider-category__header" data-toggle="pa">
                <span style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">
                  ${icon('speaker', 18)} PA & Monitoreo
                </span>
                ${icon('chevronDown', 18)}
              </div>
              <div class="rider-category__content" style="display: none; padding:12px 0 0 26px;">
                <p style="margin-bottom:8px;"><strong>PA:</strong> <span style="color:var(--text-secondary)">${rider.pa || 'No especificado'}</span></p>
                <p><strong>Monitoreo:</strong> <span style="color:var(--text-secondary)">${rider.monitoring || rider.monitors || 'No especificado'}</span></p>
              </div>
            </div>

            <!-- Microfonía -->
            <div class="rider-category mt-3 border-top pt-3">
              <div class="rider-category__header" data-toggle="mic">
                <span style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">
                  ${icon('mic', 18)} Microfonía
                </span>
                ${icon('chevronDown', 18)}
              </div>
              <div class="rider-category__content" style="display: none; padding:12px 0 0 26px;">
                ${rider.microphones && rider.microphones.length > 0 ? `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    ${rider.microphones.map(mic => `
                      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface-elevated);padding:8px 12px;border-radius:var(--radius-md);">
                        <div style="display:flex;align-items:center;gap:8px;">
                          ${icon('mic', 14)}
                          <span style="font-weight:600">${mic.name}</span>
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);text-align:right;">
                          <p>Cant: ${mic.quantity ?? mic.qty}</p>
                          <p>Uso: ${mic.use}</p>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : '<p style="color:var(--text-secondary)">No se especificó microfonía.</p>'}
              </div>
            </div>

            <!-- Backline -->
            <div class="rider-category mt-3 border-top pt-3">
              <div class="rider-category__header" data-toggle="backline">
                <span style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">
                  ${icon('music', 18)} Backline
                </span>
                ${icon('chevronDown', 18)}
              </div>
              <div class="rider-category__content" style="display: none; padding:12px 0 0 26px; color:var(--text-secondary);">
                <p>${rider.backline || 'No especificado'}</p>
              </div>
            </div>

            <!-- Producción -->
            <div class="rider-category mt-3 border-top pt-3">
              <div class="rider-category__header" data-toggle="production">
                <span style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">
                  ${icon('coffee', 18)} Producción / Hospitality
                </span>
                ${icon('chevronDown', 18)}
              </div>
              <div class="rider-category__content" style="display: none; padding:12px 0 0 26px; color:var(--text-secondary);">
                <p>${rider.production || 'No especificado'}</p>
              </div>
            </div>
            
            <!-- Notas -->
            <div class="rider-category mt-3 border-top pt-3">
              <div class="rider-category__header" data-toggle="notes">
                <span style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">
                  ${icon('fileText', 18)} Notas de Escenario
                </span>
                ${icon('chevronDown', 18)}
              </div>
              <div class="rider-category__content" style="display: none; padding:12px 0 0 26px; color:var(--text-secondary);">
                <p>${rider.notes || rider.stageNotes || 'Sin notas adicionales.'}</p>
              </div>
            </div>

          </div>
        </div>
      `;
    });

    // 2. List events WITHOUT riders
    if (eventsWithoutRiders.length > 0) {
      html += `
        <h3 style="font-size:1.1rem;margin: 24px 0 16px;color:var(--text-primary);">Eventos sin Rider</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${eventsWithoutRiders.map(event => `
            <div class="compact-card" style="display:flex;align-items:center;justify-content:space-between;border-left: 3px solid var(--text-secondary);">
              <div>
                <strong style="display:block;margin-bottom:4px;">${event.name}</strong>
                <span style="font-size:0.75rem;color:var(--text-secondary);">${formatDate(event.date)}</span>
              </div>
              <button class="btn btn--sm btn--primary btn-create-rider" data-event-id="${event.id}">
                ${icon('plus', 14)} Agregar
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  html += `</div></div>`;
  return html;
}

export function initRidersViewEvents() {
  const container = document.querySelector('.riders-view');
  if (!container) return;

  // Botón volver
  const btnBack = document.getElementById('btnBackDashboard');
  if (btnBack) {
      btnBack.addEventListener('click', () => navigate('dashboard'));
  }

  // Collapsible sections
  container.addEventListener('click', (e) => {
    const header = e.target.closest('.rider-category__header');
    if (header) {
      const content = header.nextElementSibling;
      const chevron = header.querySelector('svg:last-child');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      } else {
        content.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Edit / Create Rider
  container.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-rider');
    const createBtn = e.target.closest('.btn-create-rider');

    if (editBtn || createBtn) {
      const btn = editBtn || createBtn;
      const eventId = btn.dataset.eventId;
      openRiderModal(eventId);
    }
  });
}

function openRiderModal(eventId) {
  const state = store.getState();
  const event = state.events.find(e => String(e.id) === String(eventId));
  if (!event) return;

  const rider = state.riders.find(item => String(item.eventId) === String(event.id)) || {
    pa: '',
    monitoring: '',
    microphones: [],
    backline: '',
    production: '',
    stageNotes: ''
  };

  let micsHtml = '';
  if (rider.microphones) {
    rider.microphones.forEach((mic, index) => {
      micsHtml += getMicRowHtml(mic, index);
    });
  }

  const modalHtml = `
    <form id="riderForm" class="standard-form">
      <div class="form-group">
        <label class="form-label">PA</label>
        <textarea class="form-control form-textarea" name="pa">${rider.pa}</textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Monitoreo</label>
        <textarea class="form-control form-textarea" name="monitoring">${rider.monitoring || rider.monitors || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Backline</label>
        <textarea class="form-control form-textarea" name="backline">${rider.backline}</textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Producción / Hospitality</label>
        <textarea class="form-control form-textarea" name="production">${rider.production}</textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Notas de Escenario</label>
        <textarea class="form-control form-textarea" name="stageNotes">${rider.notes || rider.stageNotes || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Microfonía</label>
        <div id="micList" style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">${micsHtml}</div>
        <button type="button" class="btn btn--sm btn--secondary" id="addMicBtn" style="width:100%;">
          ${icon('plus', 16)} Agregar Micrófono
        </button>
      </div>

      <button type="submit" class="btn btn--primary btn--block mt-4">Guardar Rider</button>
    </form>
  `;

  openModal('Editar Rider - ' + event.name, modalHtml);

  // Setup modal events
  let micCount = rider.microphones ? rider.microphones.length : 0;
  
  // Agregar micrófono
  document.getElementById('addMicBtn').addEventListener('click', () => {
    document.getElementById('micList').insertAdjacentHTML('beforeend', getMicRowHtml({name: '', quantity: 1, use: ''}, micCount++));
  });

  // Eliminar micrófono
  document.getElementById('micList').addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btn-remove-mic');
    if (removeBtn) {
      removeBtn.closest('.rider-mic-row').remove();
    }
  });

  document.getElementById('riderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Extract microphones
    const mics = [];
    const micRows = document.querySelectorAll('.rider-mic-row');
    micRows.forEach((row) => {
      const index = row.dataset.index;
      const name = formData.get(`mic_name_${index}`);
      const qty = formData.get(`mic_qty_${index}`);
      const use = formData.get(`mic_use_${index}`);
      if (name) {
        mics.push({ name, quantity: parseInt(qty, 10), use });
      }
    });

    const updatedRider = {
      id: rider.id || `r-${Date.now()}`,
      eventId: event.id,
      pa: formData.get('pa'),
      monitoring: formData.get('monitoring'),
      backline: formData.get('backline'),
      production: formData.get('production'),
      stageNotes: formData.get('stageNotes'),
      microphones: mics
    };

    store.saveRider(updatedRider);
    showToast({ message: 'Rider guardado exitosamente', type: 'success' });
    closeModal();
    setTimeout(() => navigate('riders'), 300);
  });
}

function getMicRowHtml(mic, index) {
  return `
    <div class="rider-mic-row" data-index="${index}" style="display:flex; gap:8px; align-items:center;">
      <input type="text" class="form-control" name="mic_name_${index}" placeholder="Micrófono" value="${mic.name}" style="flex:2" required>
      <input type="number" class="form-control" name="mic_qty_${index}" placeholder="Cant." value="${mic.quantity ?? mic.qty ?? 1}" style="flex:1" required>
      <input type="text" class="form-control" name="mic_use_${index}" placeholder="Uso (Ej. Voz)" value="${mic.use}" style="flex:2" required>
      <button type="button" class="btn btn--danger btn-remove-mic" style="padding:0;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${icon('trash', 16)}
      </button>
    </div>
  `;
}
