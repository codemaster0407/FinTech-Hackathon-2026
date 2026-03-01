import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import { Check, CreditCard, Info } from "lucide-react";
import { Slider } from "../components/ui/slider";
import VirtualCardDisplay from "../components/VirtualCardDisplay";

interface CreditCardProvider {
  id: string;
  name: string;
  color: string;
  logo: string;
  connected: boolean;
  limit?: number;
  available?: number;
  cashback?: string;
  fxMarkup?: string;
}

function CardProviderButton({ provider, onClick }: { provider: CreditCardProvider; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[2/1] rounded-xl border-2 transition-all ${provider.connected
        ? 'bg-surface border-optivault-emerald'
        : 'bg-surface border-optivault hover:border-optivault-light'
        }`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2"
          style={{ backgroundColor: provider.color }}
        >
          {provider.logo}
        </div>
        <span className="text-xs text-white font-medium text-center">{provider.name}</span>
        {provider.connected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-optivault-emerald flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}

export default function ConnectCreditCards() {
  const [providers, setProviders] = useState<CreditCardProvider[]>([
    { id: "amex", name: "American Express", color: "#006FCF", logo: "A", connected: true, limit: 8000, available: 5600, cashback: "1% groceries, 1% travel" },
    { id: "capital-one", name: "Capital One", color: "#D03027", logo: "C", connected: true, limit: 5000, available: 3800, fxMarkup: "0% FX markup" },
    { id: "barclaycard", name: "Barclaycard", color: "#00AEEF", logo: "B", connected: false },
    { id: "hsbc-credit", name: "HSBC Credit", color: "#DB0011", logo: "H", connected: false }
  ]);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "AMANDA"
  });

  const [linkedCards] = useState([
    { last4: "7234", name: "Amex Gold" },
    { last4: "9812", name: "Capital One" }
  ]);

  const [utilisationLimits, setUtilisationLimits] = useState({
    amex: 90,
    capitalOne: 90
  });

  const connectedProviders = providers.filter(p => p.connected);

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-32">
      <ProgressBar current={4} total={6} />

      <h1 className="text-2xl font-bold text-white">Connect Your Credit Cards</h1>
      <p className="mt-2 text-sm text-secondary leading-relaxed">
        Open Banking reads your balance and cashback rates. Card details let us route payments through them — charging as normal purchases, not cash advances.
      </p>

      <div className="mt-6 mb-6">
        <VirtualCardDisplay />
      </div>

      {/* Section 1: Open Banking */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-white mb-3">Link via Open Banking</h2>
        <p className="text-xs text-secondary mb-3">See your credit card balances and cashback rates</p>

        <div className="grid grid-cols-2 gap-3">
          {providers.map(provider => (
            <CardProviderButton key={provider.id} provider={provider} onClick={() => { }} />
          ))}
        </div>

        {connectedProviders.length > 0 && (
          <div className="mt-4 space-y-2">
            {connectedProviders.map(provider => (
              <div key={provider.id} className="bg-surface border border-optivault rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: provider.color }}
                  >
                    {provider.logo}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{provider.name}</h3>
                  <span className="text-xs text-optivault-emerald">✓</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Available:</span>
                    <span className="text-white font-mono">£{provider.available?.toLocaleString()} of £{provider.limit?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Utilisation:</span>
                    <span className="text-white">{Math.round(((provider.limit! - provider.available!) / provider.limit!) * 100)}%</span>
                  </div>
                  {provider.cashback && (
                    <div className="mt-2 px-2 py-1 bg-optivault-emerald-dim rounded text-optivault-emerald text-[10px]">
                      {provider.cashback}
                    </div>
                  )}
                  {provider.fxMarkup && (
                    <div className="mt-2 px-2 py-1 bg-optivault-cyan-dim rounded text-optivault-cyan text-[10px]">
                      {provider.fxMarkup}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Add Card Details */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-white mb-3">Add Card Details</h2>

        <div className="bg-status-blue-dim border border-status-blue/30 rounded-xl p-4 mb-4">
          <p className="text-xs text-secondary leading-relaxed">
            To route payments through your credit cards — earning you cashback — we need your card details. This is the same as adding a card to Apple Pay. Our EMI partner charges your card as a normal purchase. Your credit card company sees a regular transaction from OptiVault.
          </p>
        </div>

        <div className="space-y-3">
          <InputField
            placeholder="Card number"
            value={cardDetails.number}
            onChange={(value) => setCardDetails({ ...cardDetails, number: value })}
            showScanButton
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(value) => setCardDetails({ ...cardDetails, expiry: value })}
            />
            <InputField
              placeholder="CVV"
              value={cardDetails.cvv}
              onChange={(value) => setCardDetails({ ...cardDetails, cvv: value })}
            />
          </div>

          <InputField
            placeholder="Cardholder name"
            value={cardDetails.name}
            onChange={(value) => setCardDetails({ ...cardDetails, name: value })}
          />

          <Button variant="primary" size="md" fullWidth>
            Add Card
          </Button>
        </div>

        {linkedCards.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-secondary">Linked cards:</p>
            {linkedCards.map(card => (
              <div key={card.last4} className="flex items-center justify-between bg-surface border border-optivault rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-white">{card.name} •••• {card.last4}</span>
                  <span className="px-2 py-0.5 rounded bg-optivault-emerald-dim text-optivault-emerald text-[10px] font-semibold">Linked ✓</span>
                </div>
                <button className="text-xs text-[#EF4444] hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Utilisation Limits */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-white mb-2">Credit Card Utilisation Limits</h2>
        <p className="text-xs text-secondary mb-4">OptiVault will never push your credit utilisation above the percentage you set. This protects your credit score.</p>

        <div className="space-y-4">
          {connectedProviders.map(provider => {
            const current = Math.round(((provider.limit! - provider.available!) / provider.limit!) * 100);
            const maxAllowed = utilisationLimits[provider.id === "amex" ? "amex" : "capitalOne"];
            const maxAmount = Math.round((maxAllowed / 100) * provider.limit!);

            return (
              <div key={provider.id} className="bg-surface border border-optivault rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: provider.color }}
                  >
                    {provider.logo}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{provider.name}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">Max utilisation:</span>
                    <span className="text-white font-semibold">{maxAllowed}% (£{maxAmount.toLocaleString()} of £{provider.limit?.toLocaleString()})</span>
                  </div>

                  <Slider
                    value={[maxAllowed]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => {
                      setUtilisationLimits({
                        ...utilisationLimits,
                        [provider.id === "amex" ? "amex" : "capitalOne"]: value[0]
                      });
                    }}
                    className="w-full"
                  />

                  <div className="relative h-2 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 h-full bg-blue-500"
                      style={{ width: `${current}%` }}
                    />
                    <div
                      className="absolute h-full w-0.5 bg-optivault-amber"
                      style={{ left: `${maxAllowed}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-secondary">Current: {current}%</span>
                    <span className="text-muted">Max: {maxAllowed}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/95 backdrop-blur-sm border-t border-optivault px-6 py-4">
        <div className="mobile-container">
          <Button to="/onboarding/international" variant="primary" size="lg" fullWidth className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
            Continue
          </Button>
          <button className="w-full mt-2 text-sm text-muted hover:text-secondary transition-colors">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
