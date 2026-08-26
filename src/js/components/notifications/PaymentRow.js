import { formatCurrency, formatDate, getStatusClass, getStatusLabel } from '../../utils/formatters.js';
import { renderWhatsAppButton } from './WhatsAppButton.js';
import { buildCalendarLink } from '../../utils/notifications/calendar.js';

export const renderPaymentRow = ({ payment, contract }) => `<div class="notification-payment-row">
  <div><strong>${payment.concept}</strong><span>${formatDate(payment.dueDate)} · ${getStatusLabel(payment.status)}</span></div>
  <strong>${formatCurrency(payment.amount)}</strong>
  ${payment.status !== 'pagado' ? `<div class="notification-payment-row__actions">
    ${renderWhatsAppButton({ phone: contract.telefono || contract.phone, label: payment.status === 'atrasado' ? 'Notificar pago atrasado por WhatsApp' : 'Enviar recordatorio de pago por WhatsApp', templateKey: 'pago_recordatorio', templateData: { nombreCliente: contract.clientName || contract.client || 'Cliente', valor: formatCurrency(payment.amount), fecha: formatDate(payment.dueDate), calendarLink: buildCalendarLink({ title: `Pago - ${payment.concept}`, description: `Pago de ${contract.title || 'contrato'}`, date: payment.dueDate }) } })}
  </div>` : ''}
  <span class="badge badge--${getStatusClass(payment.status)}">${getStatusLabel(payment.status)}</span>
</div>`;