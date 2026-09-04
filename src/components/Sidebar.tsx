import { Home, PieChart, Settings, Wallet } from 'lucide-react';
import type { Page } from '../App';

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const items: { key: Page; label: string; icon: typeof Home }[] = [
  { key: 'overview', label: 'Visão geral', icon: Home },
  { key: 'wallet', label: 'Carteira', icon: Wallet },
  { key: 'markets', label: 'Mercados', icon: PieChart },
  { key: 'settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ page, setPage, mobileOpen, setMobileOpen }: SidebarProps) {
  return (
    <aside className={`${mobileOpen ? 'fixed inset-y-16 left-0 z-20 block' : 'hidden'} md:block w-64 shrink-0 border-r border-white/10 bg-[#070a0f] p-4`}>
      <nav className="space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setPage(key); setMobileOpen(false); }}
            aria-current={page === key ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
              page === key ? 'bg-white text-black font-semibold' : 'text-white/55 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
