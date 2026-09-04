import { useMemo, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { getMarket, markets, type Holding } from '../data';
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
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">● Mercado ativo</div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/45">Patrimônio total</span>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-white/40 hover:text-white">
              {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            {hideBalance ? '••••••••' : money(portfolio, currency)}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
            <ArrowUpRight size={14} />
            <span>+3,2% em relação ao mês anterior</span>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm text-white/45">Ativo em foco</span>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base font-bold">
                {selectedMarket.icon}
              </div>
              <div>
                <p className="font-semibold">{selectedMarket.name}</p>
                <p className="text-xs text-white/40">{selectedMarket.symbol}/USD</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-xl font-bold">{money(selectedMarket.price, currency)}</p>
            <span className={`text-xs ${selectedMarket.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {selectedMarket.change >= 0 ? '+' : ''}{selectedMarket.change}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm text-white/45">Ações rápidas</span>
            <p className="mt-1 text-xs text-white/40">Gerencie seus ativos diretamente da carteira.</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setPage('wallet')}
              className="flex-1 rounded-xl bg-white px-3 py-2.5 text-center text-xs font-semibold text-black hover:bg-white/90"
            >
              Abrir Carteira
            </button>
            <button
              onClick={() => setPage('markets')}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-xs text-white/80 hover:bg-white/10"
            >
              Ver Mercados
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Desempenho da carteira</h2>
              <p className="text-xs text-white/40">Variação simulada no período selecionado</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
              {['24H', '7D', '30D', '1A'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-3 py-1 text-xs ${period === p ? 'bg-white text-black font-semibold' : 'text-white/45 hover:text-white'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 h-56 w-full">
            <svg viewBox="0 0 800 260" className="h-full w-full overflow-visible">
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
            {owned.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                <p>Nenhum saldo registrado.</p>
                <button
                  onClick={() => setPage('wallet')}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                >
                  <Plus size={13} />
                  Adicionar à carteira
                </button>
              </div>
            ) : (
              owned.map(({ id, amount, market }) => (
                <button key={id} onClick={() => setSelected(id)} className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${selected === id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-bold">{market.icon}</div>
                    <div><p className="text-sm font-medium">{market.name}</p><p className="text-xs text-white/35">{amount} {market.symbol}</p></div>
                  </div>
                  <div className="text-right"><p className="text-sm font-medium">{hideBalance ? '••••••' : money(amount * market.price, currency)}</p><p className={`text-xs ${market.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{market.change >= 0 ? '+' : ''}{market.change}%</p></div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Mercados em destaque</h2>
          <button className="text-xs text-white/40 hover:text-white" onClick={() => setPage('markets')}>
            Ver todos os mercados
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {markets.slice(0, 4).map(market => (
            <div key={market.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{market.symbol}/USD</span>
                <span className={`text-xs ${market.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {market.change >= 0 ? '+' : ''}{market.change}%
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold">{money(market.price, currency)}</p>
              <div className="mt-3 h-1 rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-white/70" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
