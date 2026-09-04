import { useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings as SettingsIcon, X } from 'lucide-react';
import type { Page } from '../App';
import type { UserProfile } from '../pages/AuthPage';

interface HeaderProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  goToMarkets: (query: string) => void;
  setPage: (p: Page) => void;
  user?: UserProfile | null;
  onLogout?: () => void;
}

const notifications = [
  { title: 'BTC subiu 2,8% nas últimas 24h', time: 'há 12 min' },
  { title: 'SOL caiu abaixo de $205', time: 'há 1h' },
  { title: 'Depósito de 500 USDC confirmado', time: 'há 3h' },
];

export default function Header({ mobileOpen, setMobileOpen, goToMarkets, setPage, user, onLogout }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) goToMarkets(query.trim());
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(p => p[0].toUpperCase())
        .slice(0, 2)
        .join('')
    : 'US';

  const displayName = user?.name || 'Minha conta';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-xl p-2 hover:bg-white/10 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
          <button className="flex items-center gap-3" onClick={() => setPage('overview')}>
            <img src={`${import.meta.env.BASE_URL}assets/kast-logo.png`} alt="KAST" className="h-6 w-auto md:h-7" />
          </button>
        </div>

        <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 w-80 focus-within:border-white/25">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar ativo... (ex: BTC, Solana)"
            className="w-full bg-transparent text-white placeholder:text-white/35 outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="rounded-xl p-2.5 text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => { setNotifOpen(!notifOpen); setAccountOpen(false); }}
            >
              <Bell size={19} />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#0b0f16] p-2 shadow-xl">
                <p className="px-2 py-1.5 text-xs font-medium text-white/40">Notificações</p>
                {notifications.map(n => (
                  <div key={n.title} className="rounded-lg px-2 py-2 hover:bg-white/5">
                    <p className="text-sm text-white/85">{n.title}</p>
                    <p className="mt-0.5 text-xs text-white/35">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:block h-9 w-px bg-white/10" />

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-xl border border-white/10 px-2.5 py-1.5 hover:border-white/20 transition-colors"
              onClick={() => { setAccountOpen(!accountOpen); setNotifOpen(false); }}
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={15} className="text-white/40" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0b0f16] p-2 shadow-2xl">
                {user && (
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                )}
                <button
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 transition-colors"
                  onClick={() => { setPage('settings'); setAccountOpen(false); }}
                >
                  <SettingsIcon size={15} className="text-white/40" />
                  Configurações
                </button>
                {onLogout && (
                  <button
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                    onClick={() => {
                      setAccountOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={15} className="text-red-400" />
                    Sair da conta
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
