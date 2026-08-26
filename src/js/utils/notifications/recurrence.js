const addPeriod = (date, modalidad) => {
  const next = new Date(date);
  if (modalidad === 'semanal') next.setDate(next.getDate() + 7);
  if (modalidad === 'quincenal') next.setDate(next.getDate() + 15);
  if (modalidad === 'mensual') next.setMonth(next.getMonth() + 1);
  return next;
};

export const calculateRecurringPayments = contract => {
  const { valor, modalidad, fechaInicio, cantidadCuotas } = contract || {};
  if (!valor || !modalidad || !fechaInicio) return [];
  const results = [];
  let date = new Date(`${fechaInicio}T00:00:00`);
  const limit = cantidadCuotas || 24;
  for (let index = 0; index < limit; index += 1) {
    results.push({ fecha: date.toISOString().slice(0, 10), valor: Number(valor), estado: 'pendiente' });
    date = addPeriod(date, modalidad);
  }
  return results;
};