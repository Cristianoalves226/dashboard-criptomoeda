import { ArrowDownLeft, ArrowUpRight, History, Repeat } from 'lucide-react';

interface QuickActionsProps {
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
  onHistory: () => void;
}

export default function QuickActions({ onReceive, onSend, onSwap, onHistory }: QuickActionsProps) {
  const actions = [
    { label: 'Receber', icon: ArrowDownLeft, onClick: onReceive },
    { label: 'Pagar', icon: ArrowUpRight, onClick: onSend },
    { label: 'Swap', icon: Repeat, onClick: onSwap },
    { label: 'Transações', icon: History, onClick: onHistory },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:flex sm:gap-3">
      {actions.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:flex-row sm:justify-center sm:gap-2 sm:px-5"
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
