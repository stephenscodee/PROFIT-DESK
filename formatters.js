export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export const formatPercent = (value) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'green': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'yellow': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'red': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
};
