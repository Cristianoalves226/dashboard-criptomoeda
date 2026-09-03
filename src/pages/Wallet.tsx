import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getMarket, type Holding, type Transaction } from '../data';
import { money, type Currency } from '../utils';
import QuickActions from '../components/QuickActions';
import ReceiveModal from '../components/ReceiveModal';
import SendModal from '../components/SendModal';
import SwapModal from '../components/SwapModal';
import TransactionRow from '../components/TransactionRow';

interface WalletProps {
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
  currency: Currency;
  holdings: Holding[];
  transactions: Transaction[];
  onSendConfirm: (assetId: string, amount: number, address: string) => void;
  onSwapConfirm: (fromId: string, fromAmount: number, toId: string, toAmount: number) => void;
}

type Tab = 'assets' | 'activity';
type ActiveModal = 'receive' | 'send' | 'swap' | null;

const allocationColors = ['bg-white', 'bg-white/70', 'bg-white/45', 'bg-white/25', 'bg-white/15'];

export default function Wallet({
  hideBalance, setHideBalance, currency,
  holdings, transactions,
  onSendConfirm, onSwapConfirm,
}: WalletProps) {
  const [tab, setTab] = useState<Tab>('assets');
  const [modal, setModal] = useState<ActiveModal>(null);

  const owned = useMemo(
    () => holdings.filter(h => h.amount > 0).map(h => ({ ...h, market: getMarket(h.id), value: h.amount * getMarket(h.id).price })),
    [holdings]
  );
  const total = useMemo(() => owned.reduce((sum, h) => sum + h.value, 0), [owned]);
  const sorted = useMemo(() => [...owned].sort((a, b) => b.value - a.value), [owned]);

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-white/40">{owned.length} ativos</p>
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

      <div className="mt-5">
        <QuickActions
          onReceive={() => setModal('receive')}
          onSend={() => setModal('send')}
          onSwap={() => setModal('swap')}
          onHistory={() => setTab('activity')}
        />
      </div>

      <div className="mt-6 flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
        {([['assets', 'Ativos'], ['activity', 'Transações']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-md px-4 py-1.5 text-xs ${tab === key ? 'bg-white text-black' : 'text-white/45'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'assets' ? (
        <section className="mt-4 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <h2 className="font-semibold">Meus ativos</h2>
            {sorted.length === 0 ? (
              <p className="mt-4 text-sm text-white/35">Nenhum ativo na carteira ainda.</p>
            ) : (
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
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <h2 className="font-semibold">Alocação</h2>
            {sorted.length === 0 ? (
              <p className="mt-4 text-sm text-white/35">Sem dados para exibir.</p>
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="font-semibold">Histórico de transações</h2>
          <div className="mt-4 space-y-2.5">
            {transactions.length === 0 ? (
              <p className="text-sm text-white/35">Nenhuma transação ainda.</p>
            ) : (
              transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </div>
        </section>
      )}

      {modal === 'receive' && <ReceiveModal onClose={() => setModal(null)} />}
      {modal === 'send' && (
        <SendModal onClose={() => setModal(null)} holdings={owned} onConfirm={onSendConfirm} currency={currency} />
      )}
      {modal === 'swap' && (
        <SwapModal onClose={() => setModal(null)} holdings={owned} onConfirm={onSwapConfirm} currency={currency} />
      )}
    </>
  );
}
