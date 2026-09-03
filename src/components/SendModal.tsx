import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { getMarket, networkFees, generateTxHash, type Holding } from '../data';
import { money, truncateMiddle, type Currency } from '../utils';

interface SendModalProps {
  onClose: () => void;
  holdings: Holding[];
  onConfirm: (assetId: string, amount: number, address: string) => void;
  currency: Currency;
}

type Step = 'form' | 'review' | 'pending' | 'done';

export default function SendModal({ onClose, holdings, onConfirm, currency }: SendModalProps) {
  const [assetId, setAssetId] = useState(holdings[0]?.id ?? '');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');

  const holding = holdings.find(h => h.id === assetId);
  const market = holding ? getMarket(holding.id) : null;
  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  const fee = market ? networkFees[market.id] ?? 0.5 : 0;

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!holding || !market) return;
    if (!address.trim() || address.trim().length < 8) { setError('Informe um endereço de destino válido.'); return; }
    if (numericAmount <= 0) { setError('Informe um valor maior que zero.'); return; }
    if (numericAmount > holding.amount) { setError(`Saldo insuficiente. Disponível: ${holding.amount} ${market.symbol}.`); return; }
    setStep('review');
  }

  function handleConfirm() {
    setStep('pending');
    setTimeout(() => {
      const txHash = generateTxHash();
      setHash(txHash);
      onConfirm(assetId, numericAmount, address.trim());
      setStep('done');
    }, 1600);
  }

  if (!holding || !market) {
    return (
      <Modal title="Pagar" onClose={onClose}>
        <p className="text-sm text-white/50">Você não possui ativos disponíveis para enviar.</p>
      </Modal>
    );
  }

  return (
    <Modal title="Pagar" onClose={onClose}>
      {step === 'form' && (
        <form onSubmit={handleReview}>
          <label className="block text-xs text-white/40">Ativo</label>
          <select
            value={assetId}
            onChange={e => { setAssetId(e.target.value); setAmount(''); setError(''); }}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-white/25"
          >
            {holdings.map(h => {
              const m = getMarket(h.id);
              return <option key={h.id} value={h.id} className="bg-[#0b0f16]">{m.name} — disponível: {h.amount} {m.symbol}</option>;
            })}
          </select>

          <label className="mt-4 block text-xs text-white/40">Endereço de destino</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={`Endereço ${market.symbol}...`}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-mono outline-none focus:border-white/25"
          />

          <label className="mt-4 block text-xs text-white/40">Valor</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 focus-within:border-white/25">
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full bg-transparent text-sm outline-none"
            />
            <span className="text-xs text-white/40">{market.symbol}</span>
            <button type="button" onClick={() => setAmount(String(holding.amount))} className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/60 hover:text-white">MÁX</button>
          </div>
          <p className="mt-1.5 text-xs text-white/30">≈ {money(numericAmount * market.price, currency)} · taxa de rede estimada: {money(fee, currency)}</p>

          {error && <p className="mt-3 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
            Revisar envio <ArrowRight size={15} />
          </button>
        </form>
      )}

      {step === 'review' && (
        <div>
          <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Ativo</span><span>{market.name}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Para</span><span className="font-mono">{truncateMiddle(address.trim())}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Valor</span><span>{numericAmount} {market.symbol}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Taxa de rede</span><span>{money(fee, currency)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-3 font-medium"><span>Total</span><span>{money(numericAmount * market.price, currency)}</span></div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setStep('form')} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:text-white">Voltar</button>
            <button onClick={handleConfirm} className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">Confirmar e enviar</button>
          </div>
        </div>
      )}

      {step === 'pending' && (
        <div className="flex flex-col items-center py-6 text-center">
          <Loader2 className="animate-spin text-white/60" size={32} />
          <p className="mt-4 text-sm text-white/60">Transmitindo transação para a rede...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check size={22} /></div>
          <p className="mt-4 text-sm font-medium">Transação confirmada</p>
          <p className="mt-1 text-xs text-white/40">{numericAmount} {market.symbol} enviado para {truncateMiddle(address.trim())}</p>
          <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 font-mono text-[11px] text-white/40">{truncateMiddle(hash, 10, 8)}</p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">Concluir</button>
        </div>
      )}
    </Modal>
  );
}
