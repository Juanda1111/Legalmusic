export const REMINDER_OPTIONS_PAGOS = [
  { label: '7 días antes', minutes: 7 * 24 * 60 },
  { label: '3 días antes', minutes: 3 * 24 * 60 },
  { label: '1 día antes', minutes: 24 * 60 },
  { label: 'El mismo día', minutes: 0 }
];

export const REMINDER_OPTIONS_EVENTOS = [
  { label: '24 horas antes', minutes: 24 * 60 },
  { label: '3 horas antes', minutes: 3 * 60 },
  { label: '1 hora antes', minutes: 60 },
  { label: '30 minutos antes', minutes: 30 }
];

export const calculateReminderDate = (eventDate, eventTime = '00:00', offsetMinutes) => {
  const [year, month, day] = String(eventDate).split('-').map(Number);
  const [hours, minutes] = String(eventTime).split(':').map(Number);
  const date = new Date(year, month - 1, day, hours || 0, minutes || 0);
  date.setMinutes(date.getMinutes() - Number(offsetMinutes || 0));
  return date;
};