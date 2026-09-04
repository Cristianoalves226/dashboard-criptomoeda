import { useEffect, useState } from 'react';
import Toggle from '../components/Toggle';
import type { Currency } from '../utils';
import type { UserProfile } from './AuthPage';

interface SettingsProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  hideBalanceDefault: boolean;
  setHideBalanceDefault: (v: boolean) => void;
  priceAlerts: boolean;
  setPriceAlerts: (v: boolean) => void;
  emailUpdates: boolean;
  setEmailUpdates: (v: boolean) => void;
  user?: UserProfile | null;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export default function Settings({
  currency, setCurrency,
  hideBalanceDefault, setHideBalanceDefault,
  priceAlerts, setPriceAlerts,
  emailUpdates, setEmailUpdates,
  user,
  onUpdateUser,
}: SettingsProps) {
  const [name, setName] = useState(user?.name || 'Cristiano Alves');
  const [email, setEmail] = useState(user?.email || 'cristiano@exemplo.com');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ name: name.trim(), email: email.trim() });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-white/40">Conta e preferências</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Configurações</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleSave} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="font-semibold">Perfil</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
              {name.split(' ').map(p => p[0]).slice(0, 2).join('')}
            </div>
            <div className="text-sm text-white/40">Iniciais geradas a partir do nome</div>
          </div>
          <label className="mt-5 block text-xs text-white/40">Nome</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-white/25"
          />
          <label className="mt-4 block text-xs text-white/40">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-white/25"
          />
          <button type="submit" className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
            Salvar alterações
          </button>
          {saved && <span className="ml-3 text-xs text-emerald-300">Alterações salvas.</span>}
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="font-semibold">Moeda de exibição</h2>
          <p className="mt-1 text-xs text-white/40">Afeta todos os valores mostrados no painel.</p>
          <div className="mt-4 flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
            {(['USD', 'BRL'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-md px-4 py-1.5 text-xs ${currency === c ? 'bg-white text-black' : 'text-white/45'}`}
              >
                {c === 'USD' ? 'Dólar (USD)' : 'Real (BRL)'}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/25">Conversão demonstrativa a uma taxa fixa; não reflete cotação real.</p>

          <div className="mt-6 border-t border-white/10 pt-4 divide-y divide-white/5">
            <Toggle
              checked={hideBalanceDefault}
              onChange={setHideBalanceDefault}
              label="Ocultar saldo por padrão"
              description="Os valores começam ocultos ao abrir o painel."
            />
            <Toggle
              checked={priceAlerts}
              onChange={setPriceAlerts}
              label="Alertas de preço"
              description="Notificar sobre variações relevantes de preço."
            />
            <Toggle
              checked={emailUpdates}
              onChange={setEmailUpdates}
              label="Resumo semanal por e-mail"
              description="Receber um resumo da carteira toda semana."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <h2 className="font-semibold">Aparência</h2>
        <p className="mt-1 text-xs text-white/40">Mais temas chegam em breve — o modo escuro é o único disponível nesta versão demo.</p>
        <div className="mt-4 flex gap-3">
          <div className="flex h-16 w-24 items-center justify-center rounded-xl border-2 border-white bg-[#070a0f] text-xs text-white/60">Escuro</div>
          <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-white/25 cursor-not-allowed">Claro</div>
        </div>
      </div>
    </>
  );
}
