import { icon } from './icons.js';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio', icon: 'home', view: 'dashboard' },
  { id: 'payments', label: 'Pagos', icon: 'dollarSign', view: 'payments' },
  { id: 'contracts', label: 'Contratos', icon: 'fileText', view: 'contracts' },
  { id: 'events', label: 'Eventos', icon: 'calendar', view: 'events' },
  { id: 'riders', label: 'Riders', icon: 'music', view: 'riders' }
  ,{ id: 'people', label: 'Personas', icon: 'user', view: 'people' }
];

export const renderBottomNav = (activeView) => {
  const navItemsHtml = NAV_ITEMS.map(item => {
    const isActive = activeView === item.view ? 'active' : '';
    return `
      <a href="#${item.view}" class="nav-item ${isActive}" data-view="${item.view}">
        ${icon(item.icon, 24)}
        <span class="nav-label">${item.label}</span>
      </a>
    `;
  }).join('');

  return `
    <nav class="bottom-nav">
      ${navItemsHtml}
    </nav>
  `;
};

export const initBottomNavEvents = (onNavigate) => {
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // El cambio de vista es manejado por el hashchange router,
      // pero si se necesita lógica adicional se llama onNavigate
      if (typeof onNavigate === 'function') {
        const view = item.getAttribute('data-view');
        onNavigate(view);
      }
    });
  });
};
