const escapeICS = value => String(value || '').replace(/[\\;,]/g, match => `\\${match}`).replace(/\r?\n/g, '\\n');
const pad = value => String(value).padStart(2, '0');

const bogotaDateTime = (date, time = '00:00') => {
  const [year, month, day] = String(date).split('-').map(Number);
  const [hours, minutes] = String(time).split(':').map(Number);
  return `${year}${pad(month)}${pad(day)}T${pad(hours || 0)}${pad(minutes || 0)}00`;
};

export const buildICS = ({ title, description, date, time, durationMinutes = 60, reminderOffsetMinutes = 0 }) => {
  const start = bogotaDateTime(date, time);
  const [year, month, day] = String(date).split('-').map(Number);
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  const endDate = new Date(year, month - 1, day, hours || 0, minutes || 0);
  endDate.setMinutes(endDate.getMinutes() + Number(durationMinutes));
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@legalmusic.local`;
  const alarm = Number.isFinite(Number(reminderOffsetMinutes))
    ? `\nBEGIN:VALARM\nACTION:DISPLAY\nDESCRIPTION:${escapeICS(title)}\nTRIGGER:-PT${Number(reminderOffsetMinutes) * 60}S\nEND:VALARM`
    : '';
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LegalMusic//Recordatorios//ES\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${stamp}\nDTSTART;TZID=America/Bogota:${start}\nDTEND;TZID=America/Bogota:${end}\nSUMMARY:${escapeICS(title)}\nDESCRIPTION:${escapeICS(description)}${alarm}\nEND:VEVENT\nEND:VCALENDAR`;
};

export const downloadICS = (icsContent, filename) => {
  const fileName = filename.endsWith('.ics') ? filename : `${filename}.ics`;

  if (window.showSaveFilePicker) {
    try {
      window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'Calendario', accept: { 'text/calendar': ['.ics'] } }]
      }).then(async handle => {
        const writable = await handle.createWritable();
        await writable.write(icsContent);
        await writable.close();
      }).catch(() => {});
      return;
    } catch (error) {}
  }

  const url = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
};