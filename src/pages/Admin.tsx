import { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  Search,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Sparkles,
  Check,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { getRegisteredUsers, deleteRegisteredUser, type UserProfile } from './AuthPage';
import { markets, getMarket, generateTxHash, type Holding, type Transaction } from '../data';
import { money, formatRelativeTime, type Currency } from '../utils';
import Modal from '../components/Modal';

interface AdminProps {
  currency: Currency;
  onRefreshActiveUser?: () => void;
}

function getUserStorageKey(userId: string) {
  return `cryptodesk-data-user-${userId}`;
}

function loadUserData(userId: string): { holdings: Holding[]; transactions: Transaction[] } {
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    if (!raw) return { holdings: [], transactions: [] };
    const parsed = JSON.parse(raw);
    return {
      holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    };
  } catch {
    return { holdings: [], transactions: [] };
  }
}

function saveUserData(userId: string, data: { holdings: Holding[]; transactions: Transaction[] }) {
  localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
}

export default function Admin({ currency, onRefreshActiveUser }: AdminProps) {
  const [users, setUsers] = useState<UserProfile[]>(() => getRegisteredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Estados do modal de ajuste de saldo
  const [selectedAssetId, setSelectedAssetId] = useState('usdt');
  const [operationType, setOperationType] = useState<'credit' | 'debit'>('credit');
  const [amountInput, setAmountInput] = useState('1000');
  const [reason, setReason] = useState('Depósito Aprovado');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(
      u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Carrega dados do usuário selecionado no modal
  const selectedUserData = useMemo(() => {
    if (!selectedUser) return { holdings: [], transactions: [] };
    return loadUserData(selectedUser.id);
  }, [selectedUser, successMsg]);

  // Calcula patrimônio total de todos os usuários gerenciados
  const platformStats = useMemo(() => {
    let totalValue = 0;
    let totalTransactions = 0;

    users.forEach(u => {
      const data = loadUserData(u.id);
      totalTransactions += data.transactions.length;
      data.holdings.forEach(h => {
        const m = getMarket(h.id);
        totalValue += h.amount * m.price;
      });
    });

    return {
      totalUsers: users.length,
      totalValue,
      totalTransactions,
    };
  }, [users, successMsg]);

  function handleOpenManager(user: UserProfile) {
    setSelectedUser(user);
    setSuccessMsg('');
    setAmountInput('1000');
    setReason('Depósito Aprovado');
  }

  function handleApplyBalanceAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    const numAmount = parseFloat(amountInput.replace(',', '.')) || 0;
    if (numAmount <= 0) return;

    const currentData = loadUserData(selectedUser.id);
    const delta = operationType === 'credit' ? numAmount : -numAmount;

    // Atualiza saldo do ativo
    const exists = currentData.holdings.some(h => h.id === selectedAssetId);
    let updatedHoldings: Holding[];

    if (exists) {
      updatedHoldings = currentData.holdings.map(h =>
        h.id === selectedAssetId ? { ...h, amount: Math.max(0, h.amount + delta) } : h
      );
    } else {
      updatedHoldings = delta > 0 ? [...currentData.holdings, { id: selectedAssetId, amount: delta }] : currentData.holdings;
    }

    // Cria registro de transação com o motivo
    const newTx: Transaction = {
      id: `t${Date.now()}`,
      type: operationType === 'credit' ? 'receive' : 'send',
      assetId: selectedAssetId,
      amount: numAmount,
      counterparty: `Admin • ${reason}`,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    };

    const updatedTransactions = [newTx, ...currentData.transactions];

    saveUserData(selectedUser.id, {
      holdings: updatedHoldings,
      transactions: updatedTransactions,
    });

    setSuccessMsg(
      `Saldo de ${numAmount} ${getMarket(selectedAssetId).symbol} ${operationType === 'credit' ? 'creditado' : 'debitado'} com sucesso!`
    );

    if (onRefreshActiveUser) {
      onRefreshActiveUser();
    }
  }

  function handleDeleteUser(userId: string) {
    if (confirm('Deseja realmente remover este usuário da plataforma?')) {
      deleteRegisteredUser(userId);
      localStorage.removeItem(getUserStorageKey(userId));
      setUsers(getRegisteredUsers());
      if (selectedUser?.id === userId) setSelectedUser(null);
    }
  }

  function handleResetUserWallet(userId: string) {
    if (confirm('Deseja zerar a carteira deste usuário?')) {
      saveUserData(userId, { holdings: [], transactions: [] });
      setSuccessMsg('Carteira do usuário foi zerada.');
      if (onRefreshActiveUser) onRefreshActiveUser();
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20 mb-2">
            <ShieldCheck size={14} />
            <span>Módulo de Controle Exclusivo do Administrador</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-white/50">
            Gerencie os clientes cadastrados e credite ou debite saldos diretamente nas carteiras.
          </p>
        </div>
      </div>

      {/* Cards de Métricas da Plataforma */}
      <section className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total de Clientes</span>
            <Users size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{platformStats.totalUsers}</p>
          <p className="mt-1 text-xs text-white/40">Usuários registrados no sistema</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Patrimônio Gerenciado</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{money(platformStats.totalValue, currency)}</p>
          <p className="mt-1 text-xs text-white/40">Soma de todos os saldos de clientes</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between text-white/40 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Transações Lançadas</span>
            <Clock size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{platformStats.totalTransactions}</p>
          <p className="mt-1 text-xs text-white/40">Lançamentos confirmados no histórico</p>
        </div>
      </section>

      {/* Tabela de Gestão de Usuários */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg">Contas de Clientes</h2>
            <p className="text-xs text-white/40">Selecione um cliente para inserir ou modificar valores na carteira dele.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-sm text-white/40">
            Nenhum usuário cadastrado encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/40">
                  <th className="pb-3 font-normal">Cliente</th>
                  <th className="pb-3 font-normal">Tipo</th>
                  <th className="pb-3 font-normal">Patrimônio Atual</th>
                  <th className="pb-3 font-normal">Data de Cadastro</th>
                  <th className="pb-3 font-normal text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(user => {
                  const data = loadUserData(user.id);
                  const userTotal = data.holdings.reduce((sum, h) => sum + h.amount * getMarket(h.id).price, 0);

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-white">
                            {user.name
                              .split(' ')
                              .map(p => p[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-white/40">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {user.role === 'admin' ? 'Administrador' : 'Cliente (Usuário)'}
                        </span>
                      </td>

                      <td className="py-4">
                        <p className="font-semibold text-white">{money(userTotal, currency)}</p>
                        <p className="text-xs text-white/40">{data.holdings.filter(h => h.amount > 0).length} ativos</p>
                      </td>

                      <td className="py-4 text-xs text-white/40">
                        {formatRelativeTime(user.createdAt)}
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenManager(user)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90 active:scale-[0.98] transition-all"
                          >
                            <Wallet size={13} />
                            <span>Gerenciar Saldo</span>
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              title="Remover usuário"
                              className="rounded-xl border border-white/10 p-2 text-white/40 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Gestão de Saldo do Usuário Selecionado */}
      {selectedUser && (
        <Modal title={`Gerenciar Carteira: ${selectedUser.name}`} onClose={() => setSelectedUser(null)}>
          <div className="space-y-5">
            {/* Informações do usuário */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">Conta de Acesso</p>
                <p className="text-sm font-semibold text-white">{selectedUser.name}</p>
                <p className="text-xs text-white/50">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleResetUserWallet(selectedUser.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
              >
                <RefreshCw size={12} />
                Zerar Carteira
              </button>
            </div>

            {/* Saldos atuais do usuário */}
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Saldos Atuais do Cliente</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-36 overflow-y-auto pr-1">
                {markets.slice(0, 6).map(m => {
                  const holding = selectedUserData.holdings.find(h => h.id === m.id);
                  const amount = holding?.amount || 0;
                  return (
                    <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-emerald-400">{m.symbol}</span>
                        <span className="text-[10px] text-white/40 truncate">{m.name}</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">{amount} {m.symbol}</p>
                      <p className="text-[10px] text-white/40">{money(amount * m.price, currency)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {successMsg && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Formulário de Lançamento de Saldo */}
            <form onSubmit={handleApplyBalanceAdjustment} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Novo Lançamento / Ajuste</p>

              {/* Tipo de Operação (Creditar ou Debitar) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOperationType('credit')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    operationType === 'credit'
                      ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border border-white/10 bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  <PlusCircle size={15} />
                  Creditar Saldo (+)
                </button>
                <button
                  type="button"
                  onClick={() => setOperationType('debit')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    operationType === 'debit'
                      ? 'border border-red-500 bg-red-500/20 text-red-300'
                      : 'border border-white/10 bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  <MinusCircle size={15} />
                  Debitar Saldo (-)
                </button>
              </div>

              {/* Seleção do Ativo */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Ativo / Criptomoeda</label>
                <select
                  value={selectedAssetId}
                  onChange={e => setSelectedAssetId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-3.5 py-2 text-sm text-white outline-none focus:border-white/30"
                >
                  {markets.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.symbol}) — Cotação: {money(m.price, currency)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade a Lançar */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Quantidade em {getMarket(selectedAssetId).symbol}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  required
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-white outline-none focus:border-white/30"
                />
              </div>

              {/* Motivo do Lançamento */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Motivo / Categoria</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-3.5 py-2 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="Depósito Aprovado">Depósito Aprovado</option>
                  <option value="Rendimento Mensal">Rendimento Mensal</option>
                  <option value="Aporte de Capital">Aporte de Capital</option>
                  <option value="Bônus de Cadastro">Bônus de Cadastro</option>
                  <option value="Ajuste Administrativo">Ajuste Administrativo</option>
                  <option value="Saque Processado">Saque Processado</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-[0.99] transition-all"
              >
                <Sparkles size={16} />
                <span>Confirmar e Atualizar Carteira</span>
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
