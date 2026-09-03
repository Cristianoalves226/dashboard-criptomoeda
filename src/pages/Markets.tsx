import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { markets, marketCapLabel } from '../data';
import { money, type Currency } from '../utils';
import Sparkline from '../components/Sparkline';

interface MarketsProps {
  currency: Currency;
  initialQuery?: string;
}

type Filter = 'all' | 'gainers' | 'losers';

export default function Markets({ currency, initialQuery = '' }: MarketsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return markets
      .filter(m => !q || m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q))
      .filter(m => (filter === 'gainers' ? m.change >= 0 : filter === 'losers' ? m.change < 0 : true))
      .sort((a, b) => b.marketCap - a.marketCap);
  }, [query, filter]);

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-white/40">{markets.length} ativos listados</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Mercados</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 w-full md:w-72">
          <Search size={16} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome ou símbolo..."
            className="w-full bg-transparent text-white placeholder:text-white/35 outline-none"
          />
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
        {([['all', 'Todos'], ['gainers', 'Em alta'], ['losers', 'Em queda']] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-md px-3 py-1.5 text-xs ${filter === key ? 'bg-white text-black' : 'text-white/45'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/35">Nenhum ativo encontrado para "{query}".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs text-white/35">
                  <th className="pb-3 font-normal">Ativo</th>
                  <th className="pb-3 font-normal">Preço</th>
                  <th className="pb-3 font-normal">24h</th>
                  <th className="pb-3 font-normal">Cap. de mercado</th>
                  <th className="pb-3 font-normal text-right">Últimos 15 pontos</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold">{m.icon}</div>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-white/35">{m.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-white/70">{money(m.price, currency)}</td>
                    <td className={`py-3 ${m.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{m.change >= 0 ? '+' : ''}{m.change}%</td>
                    <td className="py-3 text-white/50">{marketCapLabel(m.marketCap)}</td>
                    <td className="py-3 flex justify-end"><Sparkline data={m.spark} positive={m.change >= 0} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
