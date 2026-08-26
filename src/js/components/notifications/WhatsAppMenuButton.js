import { buildWhatsAppLink } from '../../utils/notifications/whatsapp.js';
import { buildMessage } from '../../utils/notifications/templates.js';
import { validatePhone } from '../../utils/notifications/validators.js';
import { renderActionButton } from './ActionButton.js';
import { showToast } from '../toast.js';
import { NOTIFICATION_MESSAGES } from '../../utils/notifications/validators.js';

export const renderWhatsAppMenuButton = ({ phone, options, label = 'Elegir aviso para enviar por WhatsApp' }) => {
  const validation = validatePhone({ telefono: phone });
  const menu = options.map((option, index) => {
    const link = validation.valid ? buildWhatsAppLink(phone, buildMessage(option.templateKey, option.templateData)) : '';
    return `<button class="notification-menu__option" data-menu-link="${link}" ${!validation.valid ? `disabled title="${validation.reason}"` : ''}>${option.label}</button>`;
  }).join('');
  return `<div class="notification-menu"><div class="notification-menu__trigger">${renderActionButton({ label, disabled: !validation.valid, disabledReason: validation.reason })}</div><div class="notification-menu__items">${menu}</div></div>`;
};

export const initWhatsAppMenus = root => root.querySelectorAll('.notification-menu').forEach(menu => {
  menu.querySelector('.notification-menu__trigger').addEventListener('click', event => {
    if (!event.target.closest('button')?.disabled) menu.classList.toggle('is-open');
  });
  menu.querySelectorAll('[data-menu-link]').forEach(option => option.addEventListener('click', () => {
    if (!option.disabled) {
      showToast({ message: NOTIFICATION_MESSAGES.whatsappReady, type: 'info' });
      window.open(option.dataset.menuLink, '_blank', 'noopener');
    }
    menu.classList.remove('is-open');
  }));
});