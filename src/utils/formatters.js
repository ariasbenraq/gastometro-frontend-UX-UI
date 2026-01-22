export const formatCurrency = (value) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);

export const formatDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
