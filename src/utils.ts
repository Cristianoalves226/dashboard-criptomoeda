export type Currency = 'USD' | 'BRL';

// Taxa fixa apenas para fins demonstrativos
export const BRL_RATE = 5.35;

export function money(value: number, currency: Currency = 'USD') {
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value * BRL_RATE);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function truncateMiddle(value: string, start = 6, end = 4) {
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

export function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'agora mesmo';
  if (diffMs < hour) return `há ${Math.floor(diffMs / minute)} min`;
  if (diffMs < day) return `há ${Math.floor(diffMs / hour)}h`;
  if (diffMs < day * 7) return `há ${Math.floor(diffMs / day)} dias`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(timestamp);
}
