import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ReceiveAddress } from '../data';

export default function AddressRow({ network, symbol, address }: ReceiveAddress) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponível neste ambiente — sem ação
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{network}</p>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/50">{symbol}</span>
        </div>
        <p className="mt-1 truncate font-mono text-xs text-white/40">{address}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
          copied ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/10 text-white/60 hover:text-white'
        }`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
