import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  Search,
  Wallet,
  Clock,
  Check,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { UserProfile } from '../lib/database';
import {
  listAllProfiles,
  deleteProfile,
  fetchHoldings,
  fetchTransactions,
  applyHoldingDelta,
  insertTransaction,
  resetUserWallet,
} from '../lib/database';
import { markets, getMarket, generateTxHash, type Holding } from '../data';
import { money, formatRelativeTime, type Currency } from '../utils';
import Modal from '../components/Modal';

interface AdminProps {
  currency: Currency;
  onRefreshActiveUser?: () => void;
}

export default function Admin({ currency, onRefreshActiveUser }: AdminProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedHoldings, setSelectedHoldings] = useState<Holding[]>([]);
  const [selectedTxCount, setSelectedTxCount] = useState(0);

  // Stats cache: userId -> { totalValue, txCount, holdings }
  const [userStats, setUserStats] = useState<
    Record<string, { totalValue: number; txCount: number; holdings: Holding[] }>
  >({});

  const [selectedAssetId, setSelectedAssetId] = useState('usdt');
  const [operationType, setOperationType] = useState<'credit' | 'debit'>('credit');
  const [amountInput, setAmountInput] = useState('1000');
  const [reason, setReason] = useState('Depósito Aprovado');
  const [successMsg, setSuccessMsg] = useState('');
  const [applying, setApplying] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await listAllProfiles();
      setUsers(profiles);

      // Carrega stats de cada usuário em paralelo (limitado)
      const stats: Record<string, { totalValue: number; txCount: number; holdings: Holding[] }> = {};

      await Promise.all(
        profiles.map(async (u) => {
          const [holdings, txs] = await Promise.all([
            fetchHoldings(u.id),
            fetchTransactions(u.id),
          ]);
          const totalValue = holdings.reduce((sum, h) => {
            try {
              return sum + h.amount * getMarket(h.id).price;
            } catch {
              return sum;
            }
          }, 0);
          stats[u.id] = { totalValue, txCount: txs.length, holdings };
        })
      );

      setUserStats(stats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const platformStats = useMemo(() => {
    let totalValue = 0;
    let totalTransactions = 0;

    Object.values(userStats).forEach((s) => {
      totalValue += s.totalValue;
      totalTransactions += s.txCount;
    });

    return {
      totalUsers: users.length,
      totalValue,
      totalTransactions,
    };
  }, [users, userStats]);

  async function handleOpenManager(user: UserProfile) {
    setSelectedUser(user);
    setSuccessMsg('');
    setAmountInput('1000');
    setReason('Depósito Aprovado');

    const holdings = await fetchHoldings(user.id);
    const txs = await fetchTransactions(user.id);
    setSelectedHoldings(holdings);
    setSelectedTxCount(txs.length);
  }

  async function handleApplyBalanceAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || applying) return;

    const numAmount = parseFloat(amountInput.replace(',', '.')) || 0;
    if (numAmount <= 0) return;

    setApplying(true);
    try {
      const delta = operationType === 'credit' ? numAmount : -numAmount;

      await applyHoldingDelta(selectedUser.id, selectedAssetId, delta);

      await insertTransaction(selectedUser.id, {
        type: operationType === 'credit' ? 'receive' : 'send',
        assetId: selectedAssetId,
        amount: numAmount,
        counterparty: `Admin • ${reason}`,
        hash: generateTxHash(),
        status: 'confirmed',
        timestamp: Date.now(),
      });

      // Atualiza holdings do modal
      const updatedHoldings = await fetchHoldings(selectedUser.id);
      setSelectedHoldings(updatedHoldings);

      // Atualiza stats
      setUserStats((prev) => {
        const current = prev[selectedUser.id] || { totalValue: 0, txCount: 0, holdings: [] };
        const totalValue = updatedHoldings.reduce((sum, h) => {
          try {
            return sum + h.amount * getMarket(h.id).price;
          } catch {
            return sum;
          }
        }, 0);
        return {
          ...prev,
          [selectedUser.id]: {
            totalValue,
            txCount: current.txCount + 1,
            holdings: updatedHoldings,
          },
        };
      });

      setSuccessMsg(
        `Saldo de ${numAmount} ${getMarket(selectedAssetId).symbol} ${
          operationType === 'credit' ? 'creditado' : 'debitado'
        } com sucesso!`
      );

      if (onRefreshActiveUser) {
        onRefreshActiveUser();
      }
    } finally {
      setApplying(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Deseja realmente remover este usuário da plataforma? (remove apenas o perfil)')) {
      return;
    }

    const ok = await deleteProfile(userId);
    if (ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    }
  }

  async function handleResetUserWallet(userId: string) {
    if (!confirm('Deseja zerar a carteira deste usuário?')) return;

    const ok = await resetUserWallet(userId);
    if (ok) {
      setSelectedHoldings([]);
      setSelectedTxCount(0);
      setUserStats((prev) => ({
        ...prev,
        [userId]: { totalValue: 0, txCount: 0, holdings: [] },
      }));
      setSuccessMsg('Carteira do usuário foi zerada.');
      if (onRefreshActiveUser) onRefreshActiveUser();
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          
          <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-white/50">
            Gerencie os clientes cadastrados e credite ou debite saldos diretamente nas carteiras.
          </p>
        </div>
      </div>

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

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg">Contas de Clientes</h2>
            <p className="text-xs text-white/40">
              Selecione um cliente para inserir ou modificar valores na carteira dele.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-white/40">Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
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
                {filteredUsers.map((user) => {
                  const stats = userStats[user.id] || {
                    totalValue: 0,
                    txCount: 0,
                    holdings: [],
                  };

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-white">
                            {user.name
                              .split(' ')
                              .map((p) => p[0])
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
                        <p className="font-semibold text-white">{money(stats.totalValue, currency)}</p>
                        <p className="text-xs text-white/40">
                          {stats.holdings.filter((h) => h.amount > 0).length} ativos
                        </p>
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

      {selectedUser && (
        <Modal
          title={`Gerenciar Carteira: ${selectedUser.name}`}
          onClose={() => setSelectedUser(null)}
        >
          <div className="space-y-5">
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

            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Saldos Atuais do Cliente</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-36 overflow-y-auto pr-1">
                {markets.slice(0, 6).map((m) => {
                  const holding = selectedHoldings.find((h) => h.id === m.id);
                  const amount = holding?.amount || 0;
                  return (
                    <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-emerald-400">{m.symbol}</span>
                        <span className="text-[10px] text-white/40 truncate">{m.name}</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">
                        {amount} {m.symbol}
                      </p>
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

            <form
              onSubmit={handleApplyBalanceAdjustment}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4"
            >
              <p className="text-xs font-semibold text-white uppercase tracking-wider">
                Novo Lançamento / Ajuste
              </p>

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

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Ativo / Criptomoeda
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-3.5 py-2 text-sm text-white outline-none focus:border-white/30"
                >
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.symbol}) — Cotação: {money(m.price, currency)}
                    </option>
                  ))}
                </select>
              </div>

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
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Depósito Aprovado"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
              >
                {applying ? 'Aplicando...' : 'Confirmar Lançamento'}
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
