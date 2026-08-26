import { formatCurrency, formatDate, getStatusClass, getStatusLabel } from '../../utils/formatters.js';
import { renderWhatsAppButton } from './WhatsAppButton.js';
import { renderCalendarButton } from './CalendarButton.js';
import { REMINDER_OPTIONS_PAGOS } from '../../utils/notifications/reminders.js';

export const renderPaymentRow = ({ payment, contract }) => `<div class="notification-payment-row">
  <div><strong>${payment.concept}</strong><span>${formatDate(payment.dueDate)} · ${getStatusLabel(payment.status)}</span></div>
  <strong>${formatCurrency(payment.amount)}</strong>
  ${payment.status !== 'pagado' ? `<div class="notification-payment-row__actions">
    ${renderWhatsAppButton({ phone: contract.telefono || contract.phone, label: payment.status === 'atrasado' ? 'Notificar urgentemente por WhatsApp' : 'Enviar notificación a WhatsApp', templateKey: 'pago_recordatorio', templateData: { nombreCliente: contract.clientName || contract.client || 'Cliente', valor: formatCurrency(payment.amount), fecha: formatDate(payment.dueDate) } })}
    ${renderCalendarButton({ title: `Pago - ${payment.concept}`, description: `Pago de ${contract.title || 'contrato'}`, date: payment.dueDate, time: '09:00', reminderOptions: REMINDER_OPTIONS_PAGOS, label: 'Enviar notificación al calendario' })}
  </div>` : ''}
  <span class="badge badge--${getStatusClass(payment.status)}">${getStatusLabel(payment.status)}</span>
</div>`;