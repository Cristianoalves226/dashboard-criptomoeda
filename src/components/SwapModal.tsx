import { useMemo, useState } from 'react';
import { ArrowDown, ArrowLeftRight, Check, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { markets, getMarket, swapFeeRate, type Holding } from '../data';
import { money, type Currency } from '../utils';

interface SwapModalProps {
  onClose: () => void;
  holdings: Holding[];
  onConfirm: (fromId: string, fromAmount: number, toId: string, toAmount: number) => void;
  currency: Currency;
}

type Step = 'form' | 'pending' | 'done';

export default function SwapModal({ onClose, holdings, onConfirm, currency }: SwapModalProps) {
  const [fromId, setFromId] = useState(holdings[0]?.id ?? '');
  const [toId, setToId] = useState(markets.find(m => m.id !== holdings[0]?.id)?.id ?? '');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');

  const holding = holdings.find(h => h.id === fromId);
  const fromMarket = getMarket(fromId);
  const toMarket = getMarket(toId);
  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;

  const receiveAmount = useMemo(() => {
    if (!numericAmount) return 0;
    const grossUsd = numericAmount * fromMarket.price;
    const netUsd = grossUsd * (1 - swapFeeRate);
    return netUsd / toMarket.price;
  }, [numericAmount, fromMarket, toMarket]);

  function flip() {
    setFromId(toId);
    setToId(fromId);
    setAmount('');
    setError('');
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!holding) { setError('Você não possui esse ativo.'); return; }
    if (numericAmount <= 0) { setError('Informe um valor maior que zero.'); return; }
    if (numericAmount > holding.amount) { setError(`Saldo insuficiente. Disponível: ${holding.amount} ${fromMarket.symbol}.`); return; }
    if (fromId === toId) { setError('Escolha ativos diferentes para a troca.'); return; }

    setStep('pending');
    setTimeout(() => {
      onConfirm(fromId, numericAmount, toId, receiveAmount);
      setStep('done');
    }, 1600);
  }

  if (!holding) {
    return (
      <Modal title="Swap" onClose={onClose}>
        <p className="text-sm text-white/50">Você não possui ativos disponíveis para trocar.</p>
      </Modal>
    );
  }

  return (
    <Modal title="Swap" onClose={onClose}>
      {step === 'form' && (
        <form onSubmit={handleConfirm}>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-xs text-white/40"><span>De</span><span>Disponível: {holding.amount} {fromMarket.symbol}</span></div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full bg-transparent text-xl font-semibold outline-none"
              />
              <select
                value={fromId}
                onChange={e => { setFromId(e.target.value); setError(''); }}
                className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none"
              >
                {holdings.map(h => {
                  const m = getMarket(h.id);
                  return <option key={h.id} value={h.id} className="bg-[#0b0f16]">{m.symbol}</option>;
                })}
              </select>
            </div>
            <button type="button" onClick={() => setAmount(String(holding.amount))} className="mt-2 rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/60 hover:text-white">Usar máximo</button>
          </div>

          <div className="relative my-1 flex justify-center">
            <button type="button" onClick={flip} className="z-10 rounded-full border border-white/10 bg-[#0b0f16] p-2 text-white/50 hover:text-white">
              <ArrowDown size={15} />
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-xs text-white/40"><span>Para (estimado)</span></div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-full text-xl font-semibold text-white/70">{receiveAmount ? receiveAmount.toFixed(6) : '0.00'}</div>
              <select
                value={toId}
                onChange={e => { setToId(e.target.value); setError(''); }}
                className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none"
              >
                {markets.map(m => <option key={m.id} value={m.id} className="bg-[#0b0f16]">{m.symbol}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 text-xs text-white/35">
            <div className="flex justify-between"><span>Taxa de câmbio</span><span>1 {fromMarket.symbol} ≈ {(fromMarket.price / toMarket.price).toFixed(6)} {toMarket.symbol}</span></div>
            <div className="flex justify-between"><span>Taxa de swap</span><span>{(swapFeeRate * 100).toFixed(2)}%</span></div>
            <div className="flex justify-between"><span>Valor estimado</span><span>{money(numericAmount * fromMarket.price, currency)}</span></div>
          </div>

          {error && <p className="mt-3 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
            <ArrowLeftRight size={15} /> Confirmar swap
          </button>
        </form>
      )}

      {step === 'pending' && (
        <div className="flex flex-col items-center py-6 text-center">
          <Loader2 className="animate-spin text-white/60" size={32} />
          <p className="mt-4 text-sm text-white/60">Executando troca na rede...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check size={22} /></div>
          <p className="mt-4 text-sm font-medium">Swap concluído</p>
          <p className="mt-1 text-xs text-white/40">{numericAmount} {fromMarket.symbol} → {receiveAmount.toFixed(6)} {toMarket.symbol}</p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">Concluir</button>
        </div>
      )}
    </Modal>
  );
}
