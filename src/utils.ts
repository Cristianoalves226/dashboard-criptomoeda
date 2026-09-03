export type Currency = 'USD' | 'BRL';

// Taxa fixa apenas para fins demonstrativos
export const BRL_RATE = 5.35;

export function money(value: number, currency: Currency = 'USD') {
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value * BRL_RATE);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
