import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Modal from './Modal';
import QRCodeView from './QRCodeView';
import { receiveAddresses } from '../data';

interface ReceiveModalProps {
  onClose: () => void;
}

export default function ReceiveModal({ onClose }: ReceiveModalProps) {
  const [selected, setSelected] = useState(receiveAddresses[0]);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(selected.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponível
    }
  }

  return (
    <Modal title="Receber" onClose={onClose}>
      <label className="block text-xs text-white/40">Rede</label>
      <select
        value={selected.network}
        onChange={e => setSelected(receiveAddresses.find(a => a.network === e.target.value)!)}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-white/25"
      >
        {receiveAddresses.map(addr => (
          <option key={addr.network} value={addr.network} className="bg-[#0b0f16]">{addr.network} ({addr.symbol})</option>
        ))}
      </select>

      <div className="mt-5 flex justify-center">
        <QRCodeView value={selected.address} size={180} />
      </div>

      <p className="mt-4 break-all rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center font-mono text-xs text-white/70">
        {selected.address}
      </p>

      <button
        onClick={handleCopy}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          copied ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Endereço copiado' : 'Copiar endereço'}
      </button>

      <p className="mt-4 text-center text-xs text-white/30">
        Envie apenas {selected.symbol} pela rede {selected.network} para este endereço.
        Endereço de demonstração — não use para transferências reais.
      </p>
    </Modal>
  );
}
