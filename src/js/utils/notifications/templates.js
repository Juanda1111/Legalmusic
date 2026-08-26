export const TEMPLATES = {
  pago_recordatorio: data => `Hola ${data.nombreCliente}. Te recordamos que tienes un pago pendiente de ${data.valor} correspondiente al contrato. La fecha de pago es el ${data.fecha}.${data.calendarLink ? ` Agrega el recordatorio a tu calendario: ${data.calendarLink}` : ''}`,
  evento_recordatorio: data => `Hola ${data.artista}. Te recordamos que tienes presentación el ${data.fecha} en ${data.lugar}. La prueba de sonido es a las ${data.horaPruebaSonido} y el evento comienza a las ${data.horaEvento}.${data.calendarLink ? ` Agrega el evento a tu calendario: ${data.calendarLink}` : ''}`,
  evento_prueba_sonido: data => `Hola ${data.artista}. Te recordamos que la prueba de sonido es el ${data.fecha} a las ${data.horaPruebaSonido} en ${data.lugar}.${data.calendarLink ? ` Agrega la prueba de sonido a tu calendario: ${data.calendarLink}` : ''}`,
  evento_llegada: data => `Hola ${data.artista}. Te recordamos que debes llegar el ${data.fecha} a las ${data.horaLlegada} para tu presentación en ${data.lugar}.${data.calendarLink ? ` Agrega la hora de llegada a tu calendario: ${data.calendarLink}` : ''}`
};

export const buildMessage = (templateKey, data) => {
  const template = TEMPLATES[templateKey];
  if (!template) throw new Error(`Plantilla de notificación desconocida: ${templateKey}`);
  return template(data);
};