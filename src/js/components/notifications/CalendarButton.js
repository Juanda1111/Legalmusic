import { buildICS, downloadICS } from '../../utils/notifications/calendar.js';
import { validateEventDate, NOTIFICATION_MESSAGES } from '../../utils/notifications/validators.js';
import { renderActionButton } from './ActionButton.js';
import { renderReminderSelector } from './ReminderSelector.js';
import { showToast } from '../toast.js';

export const renderCalendarButton = ({ title, description, date, time, durationMinutes = 60, reminderOptions, label = 'Enviar recordatorio al calendario' }) => {
  const validation = validateEventDate({ date });
  return `<div class="notification-calendar" data-calendar-title="${encodeURIComponent(title)}" data-calendar-description="${encodeURIComponent(description || '')}" data-calendar-date="${date || ''}" data-calendar-time="${time || ''}" data-calendar-duration="${durationMinutes}">${renderReminderSelector(reminderOptions || [], 'reminderOffset')} ${renderActionButton({ label, disabled: !validation.valid, disabledReason: validation.reason || NOTIFICATION_MESSAGES.missingEventDate, className: 'notification-calendar__button' })}</div>`;
};

export const initCalendarButtons = root => root.querySelectorAll('.notification-calendar').forEach(calendar => {
  calendar.querySelector('button').addEventListener('click', () => {
    if (calendar.querySelector('button').disabled) return;
    const offset = Number(calendar.querySelector('select')?.value || 0);
    const ics = buildICS({ title: decodeURIComponent(calendar.dataset.calendarTitle), description: decodeURIComponent(calendar.dataset.calendarDescription), date: calendar.dataset.calendarDate, time: calendar.dataset.calendarTime, durationMinutes: Number(calendar.dataset.calendarDuration), reminderOffsetMinutes: offset });
    showToast({ message: 'Se generará el recordatorio del evento.', type: 'info' });
    downloadICS(ics, decodeURIComponent(calendar.dataset.calendarTitle).replace(/[^a-z0-9]+/gi, '-').toLowerCase());
  });
});