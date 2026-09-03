import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Wallet from './pages/Wallet';
import Markets from './pages/Markets';
import Settings from './pages/Settings';
import type { Currency } from './utils';

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

  return (
    <div className="min-h-screen bg-[#070a0f] text-white font-sans">
      <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} goToMarkets={goToMarkets} setPage={changePage} />

      <div className="mx-auto flex max-w-[1500px]">
        <Sidebar page={page} setPage={changePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="min-w-0 flex-1 p-4 md:p-8">
          {page === 'overview' && (
            <Overview hideBalance={hideBalance} setHideBalance={setHideBalance} currency={currency} setPage={changePage} />
          )}
          {page === 'wallet' && (
            <Wallet hideBalance={hideBalance} setHideBalance={setHideBalance} currency={currency} />
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
