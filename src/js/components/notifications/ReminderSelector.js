export const renderReminderSelector = (options, name = 'reminderOffset') => options.length > 1 ? `
  <label class="notification-reminder">Avisar
    <select name="${name}" class="notification-reminder__select">
      ${options.map(option => `<option value="${option.minutes}">${option.label}</option>`).join('')}
    </select>
  </label>
` : '';