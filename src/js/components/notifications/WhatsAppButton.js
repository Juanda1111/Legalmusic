import { buildWhatsAppLink } from '../../utils/notifications/whatsapp.js';
import { buildMessage } from '../../utils/notifications/templates.js';
import { validatePhone, NOTIFICATION_MESSAGES } from '../../utils/notifications/validators.js';
import { renderActionButton } from './ActionButton.js';
import { showToast } from '../toast.js';

export const renderWhatsAppButton = ({ phone, templateKey, templateData, label = 'WhatsApp' }) => {
  const validation = validatePhone({ telefono: phone });
  const link = validation.valid ? buildWhatsAppLink(phone, buildMessage(templateKey, templateData)) : '';
  return renderActionButton({ label, disabled: !validation.valid, disabledReason: validation.reason, className: 'notification-whatsapp', data: `data-whatsapp-link="${link}"` });
};

export const initWhatsAppButtons = root => root.querySelectorAll('[data-whatsapp-link]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.disabled) return;
    showToast({ message: NOTIFICATION_MESSAGES.whatsappReady, type: 'info' });
    window.open(button.dataset.whatsappLink, '_blank', 'noopener');
  });
});