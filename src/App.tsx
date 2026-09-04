import { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Wallet from './pages/Wallet';
import Markets from './pages/Markets';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AuthPage, { type UserProfile } from './pages/AuthPage';
import type { Currency } from './utils';
import { generateTxHash, type Holding, type Transaction } from './data';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  getProfile,
  updateProfile,
  fetchHoldings,
  fetchTransactions,
  applyHoldingDelta,
  insertTransaction,
  deleteTransaction as dbDeleteTransaction,
} from './lib/database';

export type Page = 'overview' | 'wallet' | 'markets' | 'settings' | 'admin';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [page, setPage] = useState<Page>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketsQuery, setMarketsQuery] = useState('');
  const [hideBalanceDefault, setHideBalanceDefault] = useState(false);
  const [hideBalance, setHideBalance] = useState(hideBalanceDefault);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadUserData = useCallback(async (userId: string) => {
    setDataLoading(true);
    try {
      const [h, t] = await Promise.all([
        fetchHoldings(userId),
        fetchTransactions(userId),
      ]);
      setHoldings(h);
      setTransactions(t);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Restaura sessão do Supabase ao carregar
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoadingSession(false);
      return;
    }

    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase!.auth.getSession();

      if (session?.user && mounted) {
        const profile = await getProfile(session.user.id);
        if (profile && mounted) {
          setUser(profile);
          await loadUserData(profile.id);
        }
      }

      if (mounted) setLoadingSession(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setHoldings([]);
          setTransactions([]);
          setPage('overview');
          return;
        }

        if (session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUser(profile);
            await loadUserData(profile.id);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  async function handleLoginSuccess(authenticatedUser: UserProfile, isNewUser?: boolean) {
    setUser(authenticatedUser);
    if (isNewUser) {
      setHoldings([]);
      setTransactions([]);
    } else {
      await loadUserData(authenticatedUser.id);
    }
    setPage('overview');
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setHoldings([]);
    setTransactions([]);
    setPage('overview');
  }

  async function handleRefreshActiveUser() {
    if (user) {
      await loadUserData(user.id);
    }
  }

  async function handleUpdateUser(updated: Partial<UserProfile>) {
    if (!user) return;

    const result = await updateProfile(user.id, {
      name: updated.name,
      email: updated.email,
    });

    if (result) {
      setUser(result);
    } else {
      // fallback local
      setUser({ ...user, ...updated });
    }
  }

  function handleSetHideBalanceDefault(value: boolean) {
    setHideBalanceDefault(value);
    setHideBalance(value);
  }

  function goToMarkets(query: string) {
    setMarketsQuery(query);
    setPage('markets');
    setMobileOpen(false);
  }

  function changePage(next: Page) {
    setPage(next);
    setMobileOpen(false);
  }

  async function handleBuyConfirm(
    assetId: string,
    cryptoAmount: number,
    fiatAmount: number,
    paymentMethod: string
  ) {
    if (!user) return;

    await applyHoldingDelta(user.id, assetId, cryptoAmount);

    const tx = await insertTransaction(user.id, {
      type: 'buy',
      assetId,
      amount: cryptoAmount,
      fiatAmount,
      paymentMethod,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    });

    if (tx) {
      setTransactions(prev => [tx, ...prev]);
    }

    // Atualiza holdings localmente também
    setHoldings(prev => {
      const exists = prev.some(h => h.id === assetId);
      if (exists) {
        return prev.map(h =>
          h.id === assetId ? { ...h, amount: Math.max(0, h.amount + cryptoAmount) } : h
        );
      }
      return [...prev, { id: assetId, amount: cryptoAmount }];
    });
  }

  async function handleSendConfirm(assetId: string, amount: number, address: string) {
    if (!user) return;

    await applyHoldingDelta(user.id, assetId, -amount);

    const tx = await insertTransaction(user.id, {
      type: 'send',
      assetId,
      amount,
      counterparty: address,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    });

    if (tx) {
      setTransactions(prev => [tx, ...prev]);
    }

    setHoldings(prev =>
      prev
        .map(h => (h.id === assetId ? { ...h, amount: Math.max(0, h.amount - amount) } : h))
        .filter(h => h.amount > 0)
    );
  }

  async function handleSwapConfirm(
    fromId: string,
    fromAmount: number,
    toId: string,
    toAmount: number
  ) {
    if (!user) return;

    await applyHoldingDelta(user.id, fromId, -fromAmount);
    await applyHoldingDelta(user.id, toId, toAmount);

    const tx = await insertTransaction(user.id, {
      type: 'swap',
      assetId: fromId,
      amount: fromAmount,
      toAssetId: toId,
      toAmount,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    });

    if (tx) {
      setTransactions(prev => [tx, ...prev]);
    }

    setHoldings(prev => {
      let next = prev.map(h => {
        if (h.id === fromId) return { ...h, amount: Math.max(0, h.amount - fromAmount) };
        if (h.id === toId) return { ...h, amount: h.amount + toAmount };
        return h;
      });

      if (!next.some(h => h.id === toId)) {
        next = [...next, { id: toId, amount: toAmount }];
      }

      return next.filter(h => h.amount > 0);
    });
  }

  async function handleAddManualTransaction(tx: Transaction, adjustBalance: boolean) {
    if (!user) return;

    if (adjustBalance) {
      const delta = tx.type === 'receive' || tx.type === 'buy' ? tx.amount : -tx.amount;
      await applyHoldingDelta(user.id, tx.assetId, delta);

      setHoldings(prev => {
        const exists = prev.some(h => h.id === tx.assetId);
        if (exists) {
          return prev
            .map(h =>
              h.id === tx.assetId ? { ...h, amount: Math.max(0, h.amount + delta) } : h
            )
            .filter(h => h.amount > 0);
        }
        return delta > 0 ? [...prev, { id: tx.assetId, amount: delta }] : prev;
      });
    }

    const inserted = await insertTransaction(user.id, tx);
    if (inserted) {
      setTransactions(prev => [inserted, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    }
  }

  async function handleDeleteTransaction(id: string) {
    const ok = await dbDeleteTransaction(id);
    if (ok) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-white flex items-center justify-center">
        <div className="text-sm text-white/50">Carregando sessão...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-[#070a0f] text-white font-sans flex flex-col">
      <Header
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        goToMarkets={goToMarkets}
        setPage={changePage}
        user={user}
        onLogout={handleLogout}
      />

      <div className="mx-auto flex max-w-[1500px] flex-1 w-full">
        <Sidebar
          page={page}
          setPage={changePage}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isAdmin={isAdmin}
        />

        <main className="min-w-0 flex-1 p-4 md:p-8">
          {dataLoading && (
            <div className="mb-4 text-xs text-white/40">Atualizando dados...</div>
          )}

          {page === 'overview' && (
            <Overview
              hideBalance={hideBalance}
              setHideBalance={setHideBalance}
              currency={currency}
              setPage={changePage}
              holdings={holdings}
            />
          )}
          {page === 'wallet' && (
            <Wallet
              hideBalance={hideBalance}
              setHideBalance={setHideBalance}
              currency={currency}
              holdings={holdings}
              transactions={transactions}
              isAdmin={isAdmin}
              onBuyConfirm={handleBuyConfirm}
              onSendConfirm={handleSendConfirm}
              onSwapConfirm={handleSwapConfirm}
              onAddManualTransaction={handleAddManualTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
          {page === 'markets' && (
            <div key={marketsQuery}>
              <Markets currency={currency} initialQuery={marketsQuery} />
            </div>
          )}
          {page === 'settings' && (
            <Settings
              currency={currency}
              setCurrency={setCurrency}
              hideBalanceDefault={hideBalanceDefault}
              setHideBalanceDefault={handleSetHideBalanceDefault}
              priceAlerts={priceAlerts}
              setPriceAlerts={setPriceAlerts}
              emailUpdates={emailUpdates}
              setEmailUpdates={setEmailUpdates}
              user={user}
              onUpdateUser={handleUpdateUser}
            />
          )}
          {page === 'admin' && isAdmin && (
            <Admin currency={currency} onRefreshActiveUser={handleRefreshActiveUser} />
          )}
        </main>
      </div>
    </div>
  );
}
