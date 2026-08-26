import { icon } from '../components/icons.js';
import { store } from '../state/store.js';
import { openModal, closeModal, openConfirmDialog } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { renderEmptyState } from '../components/emptyState.js';

let searchTerm = '';
let typeFilter = 'todos';

const PERSON_TYPES = [
  ['natural', 'Persona natural'],
  ['empresa', 'Empresa']
];

const ROLES = [
  'Artista', 'Cliente', 'Compositor', 'Productor musical', 'Productor ejecutivo',
  'Ingeniero de grabación', 'Ingeniero de mezcla', 'Ingeniero de mastering',
  'Músico de sesión', 'Manager', 'Sello', 'Publisher', 'Promotor', 'Organizador',
  'Booking', 'Técnico', 'Estudio', 'Empresa', 'Otro'
];

export function renderPeopleView() {
  return `
    <div class="people-view">
      <div class="people-toolbar">
        <label class="people-search">
          ${icon('search', 18)}
          <input id="peopleSearch" type="search" placeholder="Buscar persona, correo o teléfono" value="${escapeHtml(searchTerm)}">
        </label>
        <select class="form-control form-select" id="peopleTypeFilter" aria-label="Filtrar por tipo">
          <option value="todos" ${typeFilter === 'todos' ? 'selected' : ''}>Todos los tipos</option>
          ${PERSON_TYPES.map(([value, label]) => `<option value="${value}" ${typeFilter === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
        <button class="btn btn--primary" id="btnNewPerson">${icon('plus', 18)} Nueva persona</button>
      </div>
      <div class="people-list" id="peopleList">${renderPeopleList()}</div>
    </div>
  `;
}

function renderPeopleList() {
  const people = getFilteredPeople();
  if (!people.length) {
    return renderEmptyState({ iconName: 'user', title: 'Aún no hay personas', description: 'Crea tu primer contacto para relacionarlo con contratos y eventos.', actionId: 'btnEmptyNewPerson', actionLabel: 'Crear persona', page: true });
  }

  return people.map(person => `
    <article class="person-card" data-person-id="${person.id}">
      <div class="person-card__identity">
        <div class="person-card__avatar">${icon('user', 20)}</div>
        <div class="person-card__main">
          <strong>${escapeHtml(person.fullName)}</strong>
          <span>${person.personType === 'empresa' ? 'Empresa' : 'Persona natural'}${person.city ? ` · ${escapeHtml(person.city)}` : ''}</span>
          ${person.roles?.length ? `<div class="person-card__roles">${person.roles.slice(0, 3).map(role => `<span class="badge badge--type">${escapeHtml(role)}</span>`).join('')}${person.roles.length > 3 ? `<span class="person-card__more">+${person.roles.length - 3}</span>` : ''}</div>` : ''}
        </div>
      </div>
      <div class="person-card__contact">
        ${person.phone ? `<span>${icon('user', 14)} ${escapeHtml(person.phone)}</span>` : ''}
        ${person.email ? `<span>${escapeHtml(person.email)}</span>` : ''}
      </div>
    </article>
  `).join('');
}

function getFilteredPeople() {
  const people = store.getState().people || [];
  const query = searchTerm.trim().toLowerCase();
  return people.filter(person => {
    const matchesType = typeFilter === 'todos' || person.personType === typeFilter;
    const searchable = [person.fullName, person.document, person.phone, person.email, person.city, ...(person.roles || [])].join(' ').toLowerCase();
    return matchesType && (!query || searchable.includes(query));
  }).sort((a, b) => a.fullName.localeCompare(b.fullName));
}

function renderPersonForm(person = {}) {
  const selectedRoles = person.roles || [];
  return `
    <form id="personForm" class="standard-form">
      <input type="hidden" name="id" value="${person.id || ''}">
      <div class="form-group"><label class="form-label">Nombre completo</label><input class="form-control" name="fullName" value="${escapeHtml(person.fullName || '')}" required></div>
      <div class="form-group"><label class="form-label">Tipo de persona</label><select class="form-control form-select" name="personType" required>${PERSON_TYPES.map(([value, label]) => `<option value="${value}" ${person.personType === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Roles</label><div class="people-role-grid">${ROLES.map(role => `<label class="people-role-option"><input type="checkbox" name="roles" value="${escapeHtml(role)}" ${selectedRoles.includes(role) ? 'checked' : ''}> <span>${escapeHtml(role)}</span></label>`).join('')}</div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Documento <span class="muted">(opcional)</span></label><input class="form-control" name="document" value="${escapeHtml(person.document || '')}"></div><div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" name="phone" type="tel" value="${escapeHtml(person.phone || '')}" required></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">WhatsApp</label><input class="form-control" name="whatsapp" type="tel" value="${escapeHtml(person.whatsapp || '')}"></div><div class="form-group"><label class="form-label">Correo</label><input class="form-control" name="email" type="email" value="${escapeHtml(person.email || '')}"></div></div>
      <div class="form-group"><label class="form-label">Dirección <span class="muted">(opcional)</span></label><input class="form-control" name="address" value="${escapeHtml(person.address || '')}"></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Ciudad</label><input class="form-control" name="city" value="${escapeHtml(person.city || '')}" required></div><div class="form-group"><label class="form-label">País</label><input class="form-control" name="country" value="${escapeHtml(person.country || 'Colombia')}" required></div></div>
      <div class="form-group"><label class="form-label">Empresa</label><input class="form-control" name="company" value="${escapeHtml(person.company || '')}"></div>
      <div class="form-group"><label class="form-label">Notas</label><textarea class="form-control form-textarea" name="notes">${escapeHtml(person.notes || '')}</textarea></div>
      <button class="btn btn--primary btn--block" type="submit">${person.id ? 'Guardar cambios' : 'Crear persona'}</button>
    </form>
  `;
}

function showPersonDetail(person) {
  const state = store.getState();
  const contracts = (state.contracts || []).filter(item => String(item.personId) === String(person.id));
  const events = (state.events || []).filter(item => String(item.personId) === String(person.id));
  const works = (state.works || []).filter(item => String(item.personId) === String(person.id));
  const masters = (state.masters || []).filter(item => String(item.personId) === String(person.id));
  openModal(person.fullName, `
    <div class="person-detail">
      <div class="person-detail__intro"><div class="person-card__avatar">${icon('user', 22)}</div><div><strong>${escapeHtml(person.fullName)}</strong><span>${person.personType === 'empresa' ? 'Empresa' : 'Persona natural'}</span></div></div>
      <div class="person-detail__section"><h4>Información personal</h4><p>${person.document ? `Documento: ${escapeHtml(person.document)}<br>` : ''}${person.phone ? `Teléfono: ${escapeHtml(person.phone)}<br>` : ''}${person.whatsapp ? `WhatsApp: ${escapeHtml(person.whatsapp)}<br>` : ''}${person.email ? `Correo: ${escapeHtml(person.email)}<br>` : ''}${person.address ? `Dirección: ${escapeHtml(person.address)}<br>` : ''}${escapeHtml([person.city, person.country].filter(Boolean).join(', '))}</p>${person.notes ? `<p class="muted">${escapeHtml(person.notes)}</p>` : ''}</div>
      <div class="person-detail__section"><h4>Roles</h4><div class="person-card__roles">${person.roles?.length ? person.roles.map(role => `<span class="badge badge--type">${escapeHtml(role)}</span>`).join('') : '<span class="muted">Sin roles asignados</span>'}</div></div>
      ${renderRelatedSection('Contratos relacionados', contracts, item => item.title)}
      ${renderRelatedSection('Eventos relacionados', events, item => item.name)}
      ${renderRelatedSection('Obras relacionadas', works, item => item.title || item.name)}
      ${renderRelatedSection('Masters relacionados', masters, item => item.title || item.name)}
      <div class="person-detail__actions"><button class="btn btn--secondary" id="btnEditPerson">${icon('edit', 16)} Editar</button><button class="btn btn--danger" id="btnDeletePerson">${icon('trash', 16)} Eliminar</button></div>
    </div>
  `);
  document.getElementById('btnEditPerson')?.addEventListener('click', () => { closeModal(); openPersonForm(person); });
  document.getElementById('btnDeletePerson')?.addEventListener('click', () => {
    openConfirmDialog('Eliminar persona', 'La persona se eliminará, pero no se borrarán contratos, eventos ni pagos existentes. ¿Deseas continuar?', () => { store.deletePerson(person.id); closeModal(); renderPeopleListInPlace(); showToast({ message: 'Persona eliminada', type: 'success' }); });
  });
}

function renderRelatedSection(title, items, label) {
  return `<div class="person-detail__section"><h4>${title}</h4>${items.length ? `<ul>${items.map(item => `<li>${escapeHtml(label(item) || 'Sin título')}</li>`).join('')}</ul>` : '<span class="muted">Sin relaciones todavía</span>'}</div>`;
}

function openPersonForm(person = {}) {
  openModal(person.id ? 'Editar persona' : 'Nueva persona', renderPersonForm(person));
  document.getElementById('personForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    data.roles = [...event.currentTarget.querySelectorAll('input[name="roles"]:checked')].map(input => input.value);
    data.createdAt = person.createdAt || new Date().toISOString();
    if (person.id) store.updatePerson(person.id, data); else store.addPerson({ ...data, id: `person-${Date.now()}` });
    closeModal(); renderPeopleListInPlace(); showToast({ message: person.id ? 'Persona actualizada' : 'Persona creada', type: 'success' });
  });
}

function renderPeopleListInPlace() {
  const list = document.getElementById('peopleList');
  if (list) list.innerHTML = renderPeopleList();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

export function initPeopleViewEvents() {
  const container = document.querySelector('.people-view');
  if (!container) return;
  container.addEventListener('input', event => { if (event.target.id === 'peopleSearch') { searchTerm = event.target.value; renderPeopleListInPlace(); } });
  container.addEventListener('change', event => { if (event.target.id === 'peopleTypeFilter') { typeFilter = event.target.value; renderPeopleListInPlace(); } });
  container.addEventListener('click', event => {
    if (event.target.closest('#btnNewPerson, #btnEmptyNewPerson')) { openPersonForm(); return; }
    const card = event.target.closest('.person-card');
    if (card) { const person = (store.getState().people || []).find(item => String(item.id) === String(card.dataset.personId)); if (person) showPersonDetail(person); }
  });
}
