import { useState } from 'react';
import { Bell, ChevronDown, Menu, Search, X } from 'lucide-react';
import type { Page } from '../App';

interface HeaderProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  goToMarkets: (query: string) => void;
  setPage: (p: Page) => void;
}

const notifications = [
  { title: 'BTC subiu 2,8% nas últimas 24h', time: 'há 12 min' },
  { title: 'SOL caiu abaixo de $205', time: 'há 1h' },
  { title: 'Depósito de 500 USDC confirmado', time: 'há 3h' },
];

export default function Header({ mobileOpen, setMobileOpen, goToMarkets, setPage }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) goToMarkets(query.trim());
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-xl p-2 hover:bg-white/10 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
          <button className="flex items-center gap-3" onClick={() => setPage('overview')}>
            <img src="/assets/kast-logo.png" alt="KAST" className="h-6 w-auto md:h-7" />
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
              className="flex items-center gap-2 rounded-xl border border-white/10 px-2.5 py-1.5"
              onClick={() => { setAccountOpen(!accountOpen); setNotifOpen(false); }}
            >
              <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold">CA</div>
              <span className="hidden sm:block text-sm">Minha conta</span>
              <ChevronDown size={15} className="text-white/40" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0b0f16] p-1.5 shadow-xl">
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
                  onClick={() => { setPage('settings'); setAccountOpen(false); }}
                >
                  Configurações
                </button>
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/40 cursor-not-allowed">
                  Sair (indisponível no modo demo)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
