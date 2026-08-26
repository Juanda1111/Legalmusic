export const parseDate = (dateString) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateString);
};

export const isBeforeToday = (dateString) => {
  const date = parseDate(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date < today;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = parseDate(dateString);
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = parseDate(dateString);
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  const date = parseDate(dateString);
  const now = new Date();
  
  // Strip time for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  
  if (diffDays > 1) return `En ${diffDays} días`;
  return `Hace ${Math.abs(diffDays)} días`;
};

const statusLabels = {
  // Contratos
  'borrador': 'Borrador',
  'firmado': 'Firmado',
  'en_ejecucion': 'En Ejecución',
  'completado': 'Completado',
  'cancelado': 'Cancelado',
  
  // Eventos
  'programado': 'Programado',
  'en_prueba': 'En Prueba de Sonido',
  'en_vivo': 'En Vivo',
  'finalizado': 'Finalizado',
  
  // Pagos
  'pendiente': 'Pendiente',
  'pagado': 'Pagado',
  'atrasado': 'Atrasado'
};

const statusClasses = {
  // Contratos & Eventos
  'borrador': 'status-neutral',
  'firmado': 'status-primary',
  'en_ejecucion': 'status-info',
  'completado': 'status-success',
  'cancelado': 'status-danger',
  
  'programado': 'status-primary',
  'en_prueba': 'status-warning',
  'en_vivo': 'status-success',
  'finalizado': 'status-neutral',
  
  // Pagos
  'pendiente': 'status-warning',
  'pagado': 'status-success',
  'atrasado': 'status-danger'
};

export const getStatusLabel = (status) => {
  return statusLabels[status] || status;
};

export const getStatusClass = (status) => {
  return statusClasses[status] || 'status-neutral';
};
