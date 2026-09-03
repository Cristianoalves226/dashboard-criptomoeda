import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Modal from './Modal';
import { markets, generateTxHash, type Transaction } from '../data';

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (tx: Transaction, adjustBalance: boolean) => void;
  defaultAssetId?: string;
}

function toDatetimeLocal(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AddTransactionModal({ onClose, onAdd, defaultAssetId = 'usdt' }: AddTransactionModalProps) {
  const [type, setType] = useState<'receive' | 'send'>('receive');
  const [assetId, setAssetId] = useState(defaultAssetId);
  const [amount, setAmount] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [status, setStatus] = useState<Transaction['status']>('confirmed');
  const [when, setWhen] = useState(() => toDatetimeLocal(Date.now()));
  const [adjustBalance, setAdjustBalance] = useState(true);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) { setError('Informe um valor maior que zero.'); return; }

    const tx: Transaction = {
      id: `manual-${Date.now()}`,
      type,
      assetId,
      amount: numericAmount,
      counterparty: counterparty.trim() || undefined,
      hash: generateTxHash(),
      status,
      timestamp: new Date(when).getTime() || Date.now(),
    };
    onAdd(tx, adjustBalance);
    onClose();
  }

  return (
    <Modal title="Nova transação (demonstração)" onClose={onClose}>
      <p className="mb-4 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
        Uso interno para testes/demonstração. Os valores inseridos aqui não representam movimentações reais.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'receive' | 'send')}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25"
            >
              <option value="receive" className="bg-[#0b0f16]">Recebido</option>
              <option value="send" className="bg-[#0b0f16]">Enviado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40">Ativo</label>
            <select
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25"
            >
              {markets.map(m => <option key={m.id} value={m.id} className="bg-[#0b0f16]">{m.symbol}</option>)}
            </select>
          </div>
        </div>

        <label className="mt-4 block text-xs text-white/40">Valor</label>
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          inputMode="decimal"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-white/25"
        />

        <label className="mt-4 block text-xs text-white/40">Endereço (opcional)</label>
        <input
          value={counterparty}
          onChange={e => setCounterparty(e.target.value)}
          placeholder="Endereço de origem/destino"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-mono outline-none focus:border-white/25"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40">Data e hora</label>
            <input
              type="datetime-local"
              value={when}
              onChange={e => setWhen(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Transaction['status'])}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-white/25"
            >
              <option value="confirmed" className="bg-[#0b0f16]">Confirmada</option>
              <option value="pending" className="bg-[#0b0f16]">Pendente</option>
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <input type="checkbox" checked={adjustBalance} onChange={e => setAdjustBalance(e.target.checked)} className="h-3.5 w-3.5 rounded border-white/20 bg-transparent" />
          Também atualizar o saldo da carteira
        </label>

        {error && <p className="mt-3 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

        <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
          <PlusCircle size={16} /> Adicionar transação
        </button>
      </form>
    </Modal>
  );
}
