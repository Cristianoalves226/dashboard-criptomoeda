import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Wallet from './pages/Wallet';
import Markets from './pages/Markets';
import Settings from './pages/Settings';
import type { Currency } from './utils';
import { initialHoldings, initialTransactions, generateTxHash, type Holding, type Transaction } from './data';

export type Page = 'overview' | 'wallet' | 'markets' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketsQuery, setMarketsQuery] = useState('');

  // Preferências (gerenciadas em Configurações, usadas em todo o app)
  const [hideBalanceDefault, setHideBalanceDefault] = useState(false);
  const [hideBalance, setHideBalance] = useState(hideBalanceDefault);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  // Saldos e histórico — compartilhados entre Visão geral e Carteira
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  function addTransaction(tx: Transaction) {
    setTransactions(prev => [tx, ...prev]);
  }

  function applyDelta(assetId: string, delta: number) {
    setHoldings(prev => {
      const exists = prev.some(h => h.id === assetId);
      if (exists) {
        return prev.map(h => (h.id === assetId ? { ...h, amount: Math.max(0, h.amount + delta) } : h));
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

  return (
    <div className="min-h-screen bg-[#070a0f] text-white font-sans">
      <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} goToMarkets={goToMarkets} setPage={changePage} />

      <div className="mx-auto flex max-w-[1500px]">
        <Sidebar page={page} setPage={changePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="min-w-0 flex-1 p-4 md:p-8">
          {page === 'overview' && (
            <Overview hideBalance={hideBalance} setHideBalance={setHideBalance} currency={currency} setPage={changePage} holdings={holdings} />
          )}
          {page === 'wallet' && (
            <Wallet
              hideBalance={hideBalance}
              setHideBalance={setHideBalance}
              currency={currency}
              holdings={holdings}
              transactions={transactions}
              onSendConfirm={handleSendConfirm}
              onSwapConfirm={handleSwapConfirm}
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
            />
          )}
        </main>
      </div>
    </div>
  );
}
