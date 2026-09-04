import { useMemo, useState } from 'react';
import { Check, CreditCard, Loader2, QrCode, Building2, ShoppingBag } from 'lucide-react';
import Modal from './Modal';
import { markets, getMarket } from '../data';
import { money, BRL_RATE, type Currency } from '../utils';

interface BuyModalProps {
  onClose: () => void;
  onConfirm: (assetId: string, cryptoAmount: number, fiatAmount: number, paymentMethod: string) => void;
  currency: Currency;
  initialAssetId?: string;
}

type Step = 'form' | 'pending' | 'done';
type PaymentMethod = 'pix' | 'card' | 'transfer';

const paymentOptions: { id: PaymentMethod; label: string; desc: string; icon: typeof QrCode }[] = [
  { id: 'pix', label: 'Pix Instantâneo', desc: 'Aprovação imediata (0% taxa)', icon: QrCode },
  { id: 'card', label: 'Cartão de Crédito', desc: 'Visa / Mastercard em até 12x', icon: CreditCard },
  { id: 'transfer', label: 'Transferência / TED', desc: 'Compensação bancária', icon: Building2 },
];

export default function BuyModal({ onClose, onConfirm, currency, initialAssetId }: BuyModalProps) {
  const [assetId, setAssetId] = useState(initialAssetId || markets[0]?.id || 'btc');
  const [fiatInput, setFiatInput] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');

  const selectedMarket = getMarket(assetId);
  const numFiat = parseFloat(fiatInput.replace(',', '.')) || 0;

  // Converte valor digitado (na moeda atual) para USD para calcular crypto
  const fiatInUsd = currency === 'BRL' ? numFiat / BRL_RATE : numFiat;
  const cryptoAmount = useMemo(() => {
    if (!fiatInUsd || selectedMarket.price <= 0) return 0;
    return fiatInUsd / selectedMarket.price;
  }, [fiatInUsd, selectedMarket.price]);

  const quickPresets = currency === 'BRL' ? [100, 250, 500, 1000, 2500] : [20, 50, 100, 250, 500];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (numFiat <= 0) {
      setError('Informe um valor de compra válido.');
      return;
    }

    setStep('pending');
    setTimeout(() => {
      const methodName = paymentOptions.find(p => p.id === paymentMethod)?.label || 'Pix Instantâneo';
      onConfirm(assetId, cryptoAmount, numFiat, methodName);
      setStep('done');
    }, 1500);
  }

  return (
    <Modal title="Comprar Criptomoeda" onClose={onClose}>
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção do Ativo */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Criptomoeda que deseja receber
            </label>
            <select
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30"
            >
              {markets.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.symbol}) — {money(m.price, currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Valor da Compra em Moeda Fiduciária */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/50">
                Quanto você quer investir? ({currency})
              </label>
              <span className="text-xs text-white/40">
                1 {selectedMarket.symbol} = {money(selectedMarket.price, currency)}
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-semibold text-white/40">
                {currency === 'BRL' ? 'R$' : '$'}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={fiatInput}
                onChange={e => setFiatInput(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-white/30"
              />
            </div>

            {/* Presets Rápidos */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickPresets.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setFiatInput(preset.toString())}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    numFiat === preset
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {currency === 'BRL' ? `R$ ${preset}` : `$ ${preset}`}
                </button>
              ))}
            </div>
          </div>

          {/* Prévia de recebimento */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-sm">
                {selectedMarket.icon}
              </div>
              <div>
                <p className="text-xs text-white/60">Você vai receber aproximadamente:</p>
                <p className="text-sm font-bold text-emerald-300">
                  {cryptoAmount > 0 ? cryptoAmount.toFixed(6) : '0.000000'} {selectedMarket.symbol}
                </p>
              </div>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Forma de pagamento
            </label>
            <div className="space-y-2">
              {paymentOptions.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === id
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={paymentMethod === id ? 'text-white' : 'text-white/40'} />
                    <div>
                      <p className="text-sm font-medium leading-none">{label}</p>
                      <p className="mt-1 text-xs text-white/40">{desc}</p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === id ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'
                    }`}
                  >
                    {paymentMethod === id && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-[0.99] transition-all"
          >
            <ShoppingBag size={17} />
            <span>Confirmar e Comprar</span>
          </button>
        </form>
      )}

      {step === 'pending' && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Loader2 size={38} className="animate-spin text-emerald-400" />
          <p className="mt-4 text-base font-semibold">Processando transação...</p>
          <p className="mt-1 text-xs text-white/40">
            Processando pagamento via {paymentOptions.find(p => p.id === paymentMethod)?.label}
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
            <Check size={28} />
          </div>
          <h3 className="text-lg font-bold">Compra realizada com sucesso!</h3>
          <p className="mt-2 text-sm text-white/70">
            Foi creditado <span className="font-semibold text-emerald-300">{cryptoAmount.toFixed(6)} {selectedMarket.symbol}</span> na sua carteira.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left w-full text-xs space-y-1.5">
            <div className="flex justify-between text-white/50">
              <span>Valor pago:</span>
              <span className="text-white font-medium">{currency === 'BRL' ? `R$ ${numFiat.toFixed(2)}` : `$ ${numFiat.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Método:</span>
              <span className="text-white font-medium">{paymentOptions.find(p => p.id === paymentMethod)?.label}</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Status:</span>
              <span className="text-emerald-400 font-medium">Confirmado na rede</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
          >
            Concluir
          </button>
        </div>
      )}
    </Modal>
  );
}
