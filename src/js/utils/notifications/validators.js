export const NOTIFICATION_MESSAGES = {
  missingPhone: 'Este contrato no tiene un número de teléfono registrado.',
  missingEventDate: 'No se puede crear el recordatorio porque el evento no tiene fecha.',
  whatsappReady: 'Se abrirá WhatsApp con el mensaje preparado.',
  calendarReady: 'Se generará el recordatorio del evento.'
};

export const validatePhone = contract => contract?.telefono || contract?.phone
  ? { valid: true }
  : { valid: false, reason: NOTIFICATION_MESSAGES.missingPhone };

export const validateEventDate = event => event?.date
  ? { valid: true }
  : { valid: false, reason: NOTIFICATION_MESSAGES.missingEventDate };