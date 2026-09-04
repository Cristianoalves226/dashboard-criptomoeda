import { Home, PieChart, Settings, ShieldCheck, Wallet } from 'lucide-react';
import type { Page } from '../App';

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  isAdmin?: boolean;
}

export default function Sidebar({ page, setPage, mobileOpen, setMobileOpen, isAdmin }: SidebarProps) {
  const items: { key: Page; label: string; icon: typeof Home; adminOnly?: boolean }[] = [
    { key: 'overview', label: 'Visão geral', icon: Home },
    { key: 'wallet', label: 'Carteira', icon: Wallet },
    { key: 'markets', label: 'Mercados', icon: PieChart },
    { key: 'settings', label: 'Configurações', icon: Settings },
    ...(isAdmin ? [{ key: 'admin' as Page, label: 'Painel Admin', icon: ShieldCheck, adminOnly: true }] : []),
  ];

  return (
    <aside className={`${mobileOpen ? 'fixed inset-y-16 left-0 z-20 block' : 'hidden'} md:block w-64 shrink-0 border-r border-white/10 bg-[#070a0f] p-4`}>
      <nav className="space-y-1">
        {items.map(({ key, label, icon: Icon, adminOnly }) => (
          <button
            key={key}
            onClick={() => { setPage(key); setMobileOpen(false); }}
            aria-current={page === key ? 'page' : undefined}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
              page === key
                ? 'bg-white text-black font-semibold'
                : adminOnly
                ? 'text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200'
                : 'text-white/55 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} />
              <span>{label}</span>
            </div>
            {adminOnly && (
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                ADMIN
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
