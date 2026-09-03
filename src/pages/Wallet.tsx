import { useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { holdings, getMarket, receiveAddresses } from '../data';
import { money, type Currency } from '../utils';
import AddressRow from '../components/AddressRow';

interface WalletProps {
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
  currency: Currency;
}

const allocationColors = ['bg-white', 'bg-white/70', 'bg-white/45', 'bg-white/25', 'bg-white/15'];

export default function Wallet({ hideBalance, setHideBalance, currency }: WalletProps) {
  const owned = useMemo(() => holdings.map(h => ({ ...h, market: getMarket(h.id), value: h.amount * getMarket(h.id).price })), []);
  const total = useMemo(() => owned.reduce((sum, h) => sum + h.value, 0), [owned]);
  const sorted = useMemo(() => [...owned].sort((a, b) => b.value - a.value), [owned]);

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-white/40">4 ativos</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Carteira</h1>
        </div>
        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60 hover:text-white"
        >
          {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
          {hideBalance ? 'Mostrar saldos' : 'Ocultar saldos'}
        </button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6">
        <span className="text-sm text-white/45">Valor total em carteira</span>
        <div className="mt-3 text-4xl font-bold tracking-tight">{hideBalance ? '••••••' : money(total, currency)}</div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="font-semibold">Meus ativos</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs text-white/35">
                  <th className="pb-3 font-normal">Ativo</th>
                  <th className="pb-3 font-normal">Preço</th>
                  <th className="pb-3 font-normal">Quantidade</th>
                  <th className="pb-3 font-normal text-right">Valor</th>
                  <th className="pb-3 font-normal text-right">24h</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(({ id, amount, market, value }) => (
                  <tr key={id} className="border-t border-white/5">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold">{market.icon}</div>
                        <div>
                          <p className="font-medium">{market.name}</p>
                          <p className="text-xs text-white/35">{market.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-white/70">{money(market.price, currency)}</td>
                    <td className="py-3 text-white/70">{amount} {market.symbol}</td>
                    <td className="py-3 text-right font-medium">{hideBalance ? '••••••' : money(value, currency)}</td>
                    <td className={`py-3 text-right ${market.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {market.change >= 0 ? '+' : ''}{market.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="font-semibold">Alocação</h2>
          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-white/5">
            {sorted.map(({ id, value }, i) => (
              <div key={id} className={allocationColors[i % allocationColors.length]} style={{ width: `${(value / total) * 100}%` }} />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {sorted.map(({ id, market, value }, i) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${allocationColors[i % allocationColors.length]}`} />
                  <span className="text-white/75">{market.name}</span>
                </div>
                <span className="text-white/40">{((value / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Receber</h2>
            <p className="mt-1 text-xs text-white/40">Endereços de demonstração — não envie ativos reais para eles.</p>
          </div>
          <span className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">MODO DEMO</span>
        </div>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {receiveAddresses.map(addr => (
            <AddressRow key={addr.network} {...addr} />
          ))}
        </div>
      </section>
    </>
  );
}
