import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Bell, ChevronDown, Eye, EyeOff, Home, Menu, PieChart, Search, Settings, Wallet, X } from 'lucide-react';
import { motion } from 'motion/react';

const assets = [
  { name: 'Bitcoin', symbol: 'BTC', price: 109842.31, change: 2.84, amount: 0.1842, icon: '₿' },
  { name: 'Ethereum', symbol: 'ETH', price: 4268.72, change: 1.92, amount: 1.842, icon: 'Ξ' },
  { name: 'Solana', symbol: 'SOL', price: 204.38, change: -0.74, amount: 12.5, icon: 'S' },
  { name: 'USD Coin', symbol: 'USDC', price: 1, change: 0.01, amount: 1250, icon: '$' },
];

const chart = [38, 42, 39, 48, 45, 52, 49, 61, 58, 64, 59, 72, 69, 78, 75, 88, 83, 94, 91, 100];

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
}

export default function App() {
  const [hideBalance, setHideBalance] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [period, setPeriod] = useState('7D');
  const [selected, setSelected] = useState('Bitcoin');

  const portfolio = useMemo(() => assets.reduce((sum, asset) => sum + asset.amount * asset.price, 0), []);

  return (
    <div className="min-h-screen bg-[#070a0f] text-white font-sans">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 hover:bg-white/10 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-black">₿</div>
            <div className="text-lg font-bold tracking-tight">Crypto<span className="text-white/50">Desk</span></div>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 w-80"><Search size={17} /><span>Buscar ativo...</span></div>
          <div className="flex items-center gap-2"><button className="rounded-xl p-2.5 text-white/60 hover:bg-white/10 hover:text-white"><Bell size={19} /></button><div className="hidden sm:block h-9 w-px bg-white/10" /><div className="flex items-center gap-2 rounded-xl border border-white/10 px-2.5 py-1.5"><div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold">CA</div><span className="hidden sm:block text-sm">Minha conta</span><ChevronDown size={15} className="text-white/40" /></div></div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className={`${mobileOpen ? 'fixed inset-y-16 left-0 z-20 block' : 'hidden'} md:block w-64 shrink-0 border-r border-white/10 bg-[#070a0f] p-4`}>
          <nav className="space-y-1">
            {[['Visão geral', Home], ['Carteira', Wallet], ['Mercados', PieChart], ['Configurações', Settings]].map(([label, Icon]: any, i) => (
              <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${i === 0 ? 'bg-white text-black font-semibold' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon size={18} />{label}</button>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-white/40">MODO DEMONSTRAÇÃO</p><p className="mt-2 text-sm text-white/70">Todos os valores desta plataforma são fictícios.</p></div>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm text-white/40">Quarta-feira, 2 de setembro</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Visão geral</h1></div><div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">● Mercado simulado ativo</div></div>

          <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6">
              <div className="flex items-center justify-between"><span className="text-sm text-white/45">Patrimônio total</span><button onClick={() => setHideBalance(!hideBalance)} className="text-white/40 hover:text-white">{hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              <div className="mt-3 text-4xl font-bold tracking-tight">{hideBalance ? '••••••' : money(portfolio)}</div>
              <div className="mt-3 flex items-center gap-2 text-sm"><span className="flex items-center gap-1 rounded-lg bg-emerald-400/10 px-2 py-1 text-emerald-300"><ArrowUpRight size={15} /> +3,42%</span><span className="text-white/35">últimos 7 dias</span></div>
            </motion.div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><span className="text-sm text-white/45">Saldo disponível</span><div className="mt-4 text-2xl font-semibold">{hideBalance ? '••••••' : money(5840.25)}</div><p className="mt-2 text-xs text-white/35">USD virtual</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><span className="text-sm text-white/45">Resultado acumulado</span><div className="mt-4 text-2xl font-semibold text-emerald-300">{hideBalance ? '••••••' : '+$1.284,76'}</div><p className="mt-2 text-xs text-white/35">desde o início</p></div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><span className="text-2xl">₿</span><div><h2 className="font-semibold">{selected}</h2><p className="text-xs text-white/35">BTC / USD</p></div></div><div className="mt-3 text-2xl font-bold">$109,842.31 <span className="ml-2 text-sm font-medium text-emerald-300">+2.84%</span></div></div><div className="flex gap-1 rounded-lg bg-white/5 p-1">{['1D','7D','1M','1Y'].map(p => <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs ${period === p ? 'bg-white text-black' : 'text-white/45'}`}>{p}</button>)}</div></div>
              <div className="mt-6 h-64 w-full"><svg viewBox="0 0 800 250" className="h-full w-full overflow-visible"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopOpacity=".24" /><stop offset="100%" stopOpacity="0" /></linearGradient></defs><path d={`M 0 250 L ${chart.map((v,i)=>`${i*(800/(chart.length-1))} ${250-v*2.25}`).join(' L ')} L 800 250 Z`} fill="url(#fill)" /><path d={`M ${chart.map((v,i)=>`${i*(800/(chart.length-1))} ${250-v*2.25}`).join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="3" className="text-white" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Minha carteira</h2><button className="text-xs text-white/40 hover:text-white">Ver tudo</button></div><div className="mt-5 space-y-2">{assets.map((asset, i) => <button key={asset.symbol} onClick={() => setSelected(asset.name)} className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${selected === asset.name ? 'bg-white/10' : 'hover:bg-white/5'}`}><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-bold">{asset.icon}</div><div><p className="text-sm font-medium">{asset.name}</p><p className="text-xs text-white/35">{asset.amount} {asset.symbol}</p></div></div><div className="text-right"><p className="text-sm font-medium">{money(asset.amount * asset.price)}</p><p className={`text-xs ${asset.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{asset.change >= 0 ? '+' : ''}{asset.change}%</p></div></button>)}</div></div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Mercados em destaque</h2><button className="text-xs text-white/40">Atualização simulada em tempo real</button></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{assets.map(asset => <div key={asset.symbol} className="rounded-xl border border-white/10 bg-black/10 p-4"><div className="flex items-center justify-between"><span className="font-medium">{asset.symbol}/USD</span><span className={`text-xs ${asset.change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{asset.change >= 0 ? '+' : ''}{asset.change}%</span></div><p className="mt-3 text-lg font-semibold">{money(asset.price)}</p><div className="mt-3 h-1 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-white/70" /></div></div>)}</div></section>

          <footer className="py-8 text-center text-xs text-white/25">CryptoDesk • Plataforma demonstrativa • Sem operações financeiras reais</footer>
        </main>
      </div>
    </div>
  );
}
