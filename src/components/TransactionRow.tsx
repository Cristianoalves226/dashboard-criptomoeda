import { ArrowDownLeft, ArrowUpRight, Check, Clock, Copy, Repeat } from 'lucide-react';
import { useState } from 'react';
import { getMarket, type Transaction } from '../data';
import { formatRelativeTime, truncateMiddle } from '../utils';

const statusMeta: Record<Transaction['status'], { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'bg-emerald-400/10 text-emerald-300' },
  pending: { label: 'Pendente', className: 'bg-amber-400/10 text-amber-300' },
  failed: { label: 'Falhou', className: 'bg-red-400/10 text-red-300' },
};

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const [copied, setCopied] = useState(false);
  const asset = getMarket(tx.assetId);
  const toAsset = tx.toAssetId ? getMarket(tx.toAssetId) : null;
  const status = statusMeta[tx.status];

  const icon = tx.type === 'receive' ? <ArrowDownLeft size={16} /> : tx.type === 'send' ? <ArrowUpRight size={16} /> : <Repeat size={15} />;
  const iconClass = tx.type === 'receive' ? 'bg-emerald-400/10 text-emerald-300' : tx.type === 'send' ? 'bg-white/10 text-white/70' : 'bg-sky-400/10 text-sky-300';

  const title = tx.type === 'receive'
    ? `Recebido ${asset.symbol}`
    : tx.type === 'send'
    ? `Enviado ${asset.symbol}`
    : `Swap ${asset.symbol} → ${toAsset?.symbol}`;

  const subtitle = tx.type === 'swap'
    ? `${tx.amount} ${asset.symbol} por ${tx.toAmount?.toFixed(6)} ${toAsset?.symbol}`
    : tx.counterparty
    ? (tx.type === 'receive' ? `De ${truncateMiddle(tx.counterparty)}` : `Para ${truncateMiddle(tx.counterparty)}`)
    : '';

  const amountLabel = tx.type === 'send' ? `-${tx.amount} ${asset.symbol}` : tx.type === 'receive' ? `+${tx.amount} ${asset.symbol}` : `+${tx.toAmount?.toFixed(4)} ${toAsset?.symbol}`;
  const amountClass = tx.type === 'send' ? 'text-white/80' : 'text-emerald-300';

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(tx.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponível
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 p-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-white/35">{subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className={`text-sm font-medium ${amountClass}`}>{amountLabel}</p>
          <div className="mt-0.5 flex items-center justify-end gap-1.5">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${status.className}`}>{status.label}</span>
            <span className="flex items-center gap-1 text-[10px] text-white/25"><Clock size={10} />{formatRelativeTime(tx.timestamp)}</span>
          </div>
        </div>
        <button onClick={copyHash} className="hidden shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/40 hover:text-white sm:flex">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {truncateMiddle(tx.hash, 6, 4)}
        </button>
      </div>
    </div>
  );
}
