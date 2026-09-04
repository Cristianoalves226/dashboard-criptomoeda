import { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Wallet from './pages/Wallet';
import Markets from './pages/Markets';
import Settings from './pages/Settings';
import AuthPage, { type UserProfile } from './pages/AuthPage';
import type { Currency } from './utils';
import { generateTxHash, type Holding, type Transaction } from './data';

export type Page = 'overview' | 'wallet' | 'markets' | 'settings';

const AUTH_USER_KEY = 'cryptodesk-active-user-v1';

function getUserStorageKey(userId: string) {
  return `cryptodesk-data-user-${userId}`;
}

function loadActiveUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadUserData(userId: string): { holdings: Holding[]; transactions: Transaction[] } | null {
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.holdings) && Array.isArray(parsed.transactions)) return parsed;
  } catch {
    // fallback
  }
  return null;
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => loadActiveUser());
  const [page, setPage] = useState<Page>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketsQuery, setMarketsQuery] = useState('');
  const [hideBalanceDefault, setHideBalanceDefault] = useState(false);
  const [hideBalance, setHideBalance] = useState(hideBalanceDefault);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    if (!user) return [];
    const saved = loadUserData(user.id);
    return saved?.holdings ?? [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!user) return [];
    const saved = loadUserData(user.id);
    return saved?.transactions ?? [];
  });

  // Salva dados da conta ativa
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(getUserStorageKey(user.id), JSON.stringify({ holdings, transactions }));
    }
  }, [user, holdings, transactions]);

  function handleLoginSuccess(authenticatedUser: UserProfile, isNewUser?: boolean) {
    setUser(authenticatedUser);
    if (isNewUser) {
      // Nova conta inicia com saldos zerados e sem histórico
      setHoldings([]);
      setTransactions([]);
    } else {
      const saved = loadUserData(authenticatedUser.id);
      setHoldings(saved?.holdings ?? []);
      setTransactions(saved?.transactions ?? []);
    }
    setPage('overview');
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setPage('overview');
  }

  function handleUpdateUser(updated: Partial<UserProfile>) {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  }

  function addTransaction(tx: Transaction) {
    setTransactions(prev => [tx, ...prev]);
  }

  function applyDelta(assetId: string, delta: number) {
    setHoldings(prev => {
      const exists = prev.some(h => h.id === assetId);
      if (exists) {
        return prev.map(h => h.id === assetId ? { ...h, amount: Math.max(0, h.amount + delta) } : h);
      }
      return delta > 0 ? [...prev, { id: assetId, amount: delta }] : prev;
    });
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

  function handleBuyConfirm(assetId: string, cryptoAmount: number, fiatAmount: number, paymentMethod: string) {
    applyDelta(assetId, cryptoAmount);
    addTransaction({
      id: `t${Date.now()}`,
      type: 'buy',
      assetId,
      amount: cryptoAmount,
      fiatAmount,
      paymentMethod,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    });
  }

  function handleSendConfirm(assetId: string, amount: number, address: string) {
    applyDelta(assetId, -amount);
    addTransaction({
      id: `t${Date.now()}`,
      type: 'send',
      assetId,
      amount,
      counterparty: address,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    });
  }

  function handleSwapConfirm(fromId: string, fromAmount: number, toId: string, toAmount: number) {
    applyDelta(fromId, -fromAmount);
    applyDelta(toId, toAmount);
    addTransaction({
      id: `t${Date.now()}`,
      type: 'swap',
      assetId: fromId,
      amount: fromAmount,
      toAssetId: toId,
      toAmount,
      hash: generateTxHash(),
      status: 'confirmed',
      timestamp: Date.now(),
    });
  }

  function handleAddManualTransaction(tx: Transaction, adjustBalance: boolean) {
    if (adjustBalance) {
      const delta = tx.type === 'receive' || tx.type === 'buy' ? tx.amount : -tx.amount;
      applyDelta(tx.assetId, delta);
    }
    setTransactions(prev => [tx, ...prev].sort((a, b) => b.timestamp - a.timestamp));
  }

  function handleDeleteTransaction(id: string) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  // Se o usuário não estiver logado/cadastrado, exibe a página de autenticação
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

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
        <Sidebar page={page} setPage={changePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="min-w-0 flex-1 p-4 md:p-8">
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
        </main>
      </div>
    </div>
  );
}

