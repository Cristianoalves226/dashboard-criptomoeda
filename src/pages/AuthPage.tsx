import { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile, isNewUser?: boolean) => void;
}

const USERS_KEY = 'cryptodesk-registered-users-v1';

export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUser(user: UserProfile) {
  const users = getRegisteredUsers().filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    if (!password || password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        if (!cleanName) {
          setError('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setLoading(false);
          return;
        }

        const newUser: UserProfile = {
          id: `u_${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          createdAt: Date.now(),
        };

        saveRegisteredUser(newUser);
        setLoading(false);
        onLoginSuccess(newUser, true);
      } else {
        const existingUsers = getRegisteredUsers();
        const found = existingUsers.find(u => u.email.toLowerCase() === cleanEmail);

        const user: UserProfile = found || {
          id: `u_${Date.now()}`,
          name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: cleanEmail,
          createdAt: Date.now(),
        };

        if (!found) {
          saveRegisteredUser(user);
        }

        setLoading(false);
        onLoginSuccess(user, false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#070a0f] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Luz de fundo decorativa */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[600px] rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[350px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo e cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 shadow-lg shadow-black/40">
            <img
              src={`${import.meta.env.BASE_URL}assets/kast-logo.png`}
              alt="KAST"
              className="h-7 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'register' ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === 'register'
              ? 'Cadastre-se para acessar o painel de criptomoedas.'
              : 'Acesse sua conta para visualizar seus saldos e ativos.'}
          </p>
        </div>

        {/* Card do formulário */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          {/* Seletor de abas Cadastro / Entrar */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Entrar
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative flex items-center">
                  <UserIcon size={17} className="absolute left-3.5 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Cristiano Alves"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                E-mail
              </label>
              <div className="relative flex items-center">
                <Mail size={17} className="absolute left-3.5 text-white/40 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Senha
              </label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-white/40 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative flex items-center">
                  <Lock size={17} className="absolute left-3.5 text-white/40 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Criar minha conta' : 'Entrar na conta'}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Destaque de segurança */}
          <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-center gap-2 text-xs text-white/40">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Dados salvos localmente no seu navegador</span>
          </div>
        </div>
      </div>
    </div>
  );
}
