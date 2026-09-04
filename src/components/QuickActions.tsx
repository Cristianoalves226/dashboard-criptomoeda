import { ArrowDownLeft, ArrowUpRight, History, Repeat, ShoppingBag } from 'lucide-react';

interface QuickActionsProps {
  isAdmin?: boolean;
  onBuy: () => void;
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
  onHistory: () => void;
}

export default function QuickActions({
  isAdmin,
  onBuy,
  onReceive,
  onSend,
  onSwap,
  onHistory,
}: QuickActionsProps) {
  const adminActions = [
    { label: 'Comprar', icon: ShoppingBag, onClick: onBuy, primary: true },
    { label: 'Receber', icon: ArrowDownLeft, onClick: onReceive },
    { label: 'Pagar', icon: ArrowUpRight, onClick: onSend },
    { label: 'Swap', icon: Repeat, onClick: onSwap },
    { label: 'Histórico', icon: History, onClick: onHistory },
  ];

  const userActions = [
    { label: 'Endereço para Receber', icon: ArrowDownLeft, onClick: onReceive, primary: true },
    { label: 'Histórico de Movimentações', icon: History, onClick: onHistory },
  ];

  const actions = isAdmin ? adminActions : userActions;

  return (
    <div className={`grid gap-2.5 sm:flex sm:gap-3 ${isAdmin ? 'grid-cols-5' : 'grid-cols-2'}`}>
      {actions.map(({ label, icon: Icon, onClick, primary }) => (
        <button
          key={label}
          onClick={onClick}
          className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs transition-all sm:flex-row sm:justify-center sm:gap-2 sm:px-5 ${
            primary
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-medium'
              : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
