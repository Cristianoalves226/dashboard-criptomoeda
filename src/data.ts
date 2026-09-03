export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  marketCap: number;
  icon: string;
  spark: number[];
}

export interface Holding {
  id: string;
  amount: number;
}

// Catálogo completo de mercado (usado nas páginas Visão geral, Mercados e Carteira)
export const markets: MarketAsset[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 109842.31, change: 2.84, marketCap: 2_180_000_000_000, icon: '₿', spark: [38, 42, 39, 48, 45, 52, 49, 61, 58, 64, 59, 72, 69, 78, 75] },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 4268.72, change: 1.92, marketCap: 514_000_000_000, icon: 'Ξ', spark: [50, 48, 53, 51, 55, 52, 58, 56, 61, 59, 63, 60, 65, 62, 67] },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 204.38, change: -0.74, marketCap: 98_600_000_000, icon: 'S', spark: [60, 63, 61, 58, 62, 59, 56, 60, 57, 54, 58, 55, 52, 56, 53] },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', price: 1.0, change: 0.01, marketCap: 41_200_000_000, icon: '$', spark: [50, 50, 51, 50, 49, 50, 50, 51, 50, 50, 49, 50, 50, 51, 50] },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 970.15, change: 1.35, marketCap: 141_300_000_000, icon: 'B', spark: [45, 47, 46, 49, 48, 51, 49, 53, 51, 55, 53, 57, 55, 58, 56] },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 2.14, change: -1.08, marketCap: 124_800_000_000, icon: 'X', spark: [55, 54, 56, 53, 55, 52, 54, 51, 53, 50, 52, 49, 51, 48, 50] },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.68, change: 3.21, marketCap: 24_500_000_000, icon: 'A', spark: [40, 41, 43, 42, 45, 44, 47, 46, 49, 48, 51, 50, 53, 52, 55] },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.198, change: -2.45, marketCap: 29_800_000_000, icon: 'D', spark: [58, 57, 55, 56, 53, 54, 51, 52, 49, 50, 47, 48, 45, 46, 43] },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', price: 34.72, change: 4.12, marketCap: 14_200_000_000, icon: 'Λ', spark: [35, 37, 36, 40, 39, 43, 42, 46, 45, 49, 48, 52, 51, 55, 54] },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', price: 6.85, change: 0.52, marketCap: 10_600_000_000, icon: 'P', spark: [48, 49, 48, 50, 49, 51, 50, 49, 51, 50, 52, 51, 50, 52, 51] },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', price: 21.34, change: -1.76, marketCap: 14_100_000_000, icon: 'L', spark: [52, 51, 53, 50, 52, 49, 51, 48, 50, 47, 49, 46, 48, 45, 47] },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', price: 112.4, change: 0.88, marketCap: 8_700_000_000, icon: 'Ł', spark: [46, 47, 46, 48, 47, 49, 48, 50, 49, 48, 50, 49, 51, 50, 52] },
];

// Ativos que a conta demo "possui" — referenciam markets por id
export const holdings: Holding[] = [
  { id: 'btc', amount: 0.1842 },
  { id: 'eth', amount: 1.842 },
  { id: 'sol', amount: 12.5 },
  { id: 'usdc', amount: 1250 },
];

export interface ReceiveAddress {
  network: string;
  symbol: string;
  address: string;
}

// Endereços de recebimento — apenas para fins DEMONSTRATIVOS da interface
export const receiveAddresses: ReceiveAddress[] = [
  { network: 'Ethereum', symbol: 'ETH', address: '0xd9De97C4C761caD82d9ffEa022ED2Ea2EeC6D93D' },
  { network: 'Bitcoin', symbol: 'BTC', address: 'bc1qk5fmz7xrr8g2nee9lwukvlwf5lrudannerh5hz' },
  { network: 'Solana', symbol: 'SOL', address: '9hdctqumnvNGH15iJvx2TpVf6M3yFT3kS7mjdTWakPJV' },
  { network: 'Tron', symbol: 'TRX', address: 'TTztnUpZQFneZbrxhkxLzvynPmcfRxtfMj' },
  { network: 'Polygon', symbol: 'MATIC', address: '0xd9De97C4C761caD82d9ffEa022ED2Ea2EeC6D93D' },
  { network: 'BNB Smart Chain', symbol: 'BNB', address: '0xd9De97C4C761caD82d9ffEa022ED2Ea2EeC6D93D' },
  { network: 'USDT (Solana)', symbol: 'USDT', address: 'D6h24fWJyamwfphHojBnmNcEKttMLQWCNzzgAnqaSzXk' },
];

export function getMarket(id: string): MarketAsset {
  const found = markets.find(m => m.id === id);
  if (!found) throw new Error(`Ativo desconhecido: ${id}`);
  return found;
}

export function marketCapLabel(value: number) {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  return `$${(value / 1_000_000).toFixed(1)}M`;
}
