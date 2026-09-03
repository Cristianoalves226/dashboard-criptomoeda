import { useMemo, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { getMarket, type Holding } from '../data';
import { money, type Currency } from '../utils';
import type { Page } from '../App';

const chart = [38, 42, 39, 48, 45, 52, 49, 61, 58, 64, 59, 72, 69, 78, 75, 88, 83, 94, 91, 100];

const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

interface OverviewProps {
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
  currency: Currency;
  setPage: (p: Page) => void;
  holdings: Holding[];
}

export default function Overview({ hideBalance, setHideBalance, currency, setPage, holdings }: OverviewProps) {
  const [period, setPeriod] = useState('7D');
  const owned = useMemo(() => holdings.map(h => ({ ...h, market: getMarket(h.id) })), [holdings]);
  const [selected, setSelected] = useState(holdings[0]?.id ?? 'btc');
  const portfolio = useMemo(() => owned.reduce((sum, h) => sum + h.amount * h.market.price, 0), [owned]);
  const selectedMarket = getMarket(selected);
  const selectedHolding = owned.find(h => h.id === selected);

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-white/40 capitalize">{today}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Visão geral</h1>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">● Mercado simulado ativo</div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/45">Patrimônio total</span>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-white/40 hover:text-white">
              {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight">{hideBalance ? '••••••' : money(portfolio, currency)}</div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-lg bg-emerald-400/10 px-2 py-1 text-emerald-300"><ArrowUpRight size={15} /> +3,42%</span>
            <span className="text-white/35">últimos 7 dias</span>
          </div>
        </motion.div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <span className="text-sm text-white/45">Saldo disponível</span>
          <div className="mt-4 text-2xl font-semibold">{hideBalance ? '••••••' : money(5840.25, currency)}</div>
          <p className="mt-2 text-xs text-white/35">saldo virtual</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <span className="text-sm text-white/45">Resultado acumulado</span>
          <div className="mt-4 text-2xl font-semibold text-emerald-300">{hideBalance ? '••••••' : `+${money(1284.76, currency)}`}</div>
          <p className="mt-2 text-xs text-white/35">desde o início</p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedMarket.icon}</span>
                <div>
                  <h2 className="font-semibold">{selectedMarket.name}</h2>
                  <p className="text-xs text-white/35">{selectedMarket.symbol} / USD</p>
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold">
                {money(selectedMarket.price, currency)}
                <span className={`ml-2 text-sm font-medium ${selectedMarket.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {selectedMarket.change >= 0 ? '+' : ''}{selectedMarket.change}%
                </span>
              </div>
            </div>
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              {['1D', '7D', '1M', '1Y'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs ${period === p ? 'bg-white text-black' : 'text-white/45'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mt-6 h-64 w-full">
            <svg viewBox="0 0 800 250" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopOpacity=".24" />
                  <stop offset="100%" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M 0 250 L ${chart.map((v, i) => `${i * (800 / (chart.length - 1))} ${250 - v * 2.25}`).join(' L ')} L 800 250 Z`} fill="url(#fill)" />
              <path d={`M ${chart.map((v, i) => `${i * (800 / (chart.length - 1))} ${250 - v * 2.25}`).join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="3" className="text-white" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {selectedHolding && (
            <p className="mt-2 text-xs text-white/35">
              Você possui {selectedHolding.amount} {selectedMarket.symbol} ({hideBalance ? '••••••' : money(selectedHolding.amount * selectedMarket.price, currency)})
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Minha carteira</h2>
            <button className="text-xs text-white/40 hover:text-white" onClick={() => setPage('wallet')}>Ver tudo</button>
          </div>
          <div className="mt-5 space-y-2">
            {owned.map(({ id, amount, market }) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${selected === id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-bold">{market.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{market.name}</p>
                    <p className="text-xs text-white/35">{amount} {market.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{hideBalance ? '••••••' : money(amount * market.price, currency)}</p>
                  <p className={`text-xs ${market.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{market.change >= 0 ? '+' : ''}{market.change}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Mercados em destaque</h2>
          <button className="text-xs text-white/40 hover:text-white" onClick={() => setPage('markets')}>Ver todos os mercados</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {owned.map(({ id, market }) => (
            <div key={id} className="rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{market.symbol}/USD</span>
                <span className={`text-xs ${market.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{market.change >= 0 ? '+' : ''}{market.change}%</span>
              </div>
              <p className="mt-3 text-lg font-semibold">{money(market.price, currency)}</p>
              <div className="mt-3 h-1 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-white/70" /></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-white/25">CryptoDesk • Plataforma demonstrativa • Sem operações financeiras reais</footer>
    </>
  );
}
