import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { ChevronRight, Plane, ShoppingCart, Utensils, ShoppingBag, Hotel, Car, Film, Pill, Smartphone } from "lucide-react";

export default function SetPreferences() {
  const [preferences, setPreferences] = useState({
    overdraftProtection: true,
    autoSavingsTransfers: true,
    cashbackRouting: true,
    payInFull: true,
    fxOptimisation: true,
    internationalUsage: "ask" as "ask" | "auto-under-100" | "never",
    safetyBuffer: 100,
    lookAheadWindow: 28
  });

  const categories = [
    { name: "Travel", icon: Plane, selected: true },
    { name: "Groceries", icon: ShoppingCart, selected: true },
    { name: "Dining", icon: Utensils, selected: true },
    { name: "Shopping", icon: ShoppingBag, selected: false },
    { name: "Hotels", icon: Hotel, selected: true },
    { name: "Transport", icon: Car, selected: false },
    { name: "Entertainment", icon: Film, selected: false },
    { name: "Health", icon: Pill, selected: false },
    { name: "Subscriptions", icon: Smartphone, selected: false }
  ];

  const [selectedCategories, setSelectedCategories] = useState(categories);

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-optivault-emerald' : 'bg-surface'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-optivault-navy">
      <div className="mobile-container px-4 sm:px-6 py-6 sm:py-8 pb-32">
        <ProgressBar current={6} total={6} />

        <h1 className="text-xl sm:text-2xl font-bold text-white mt-6">Your Payment Rules</h1>
        <p className="mt-2 text-sm text-secondary">Tell OptiVault how to optimise. You're always in control.</p>

        <div className="mt-6 space-y-3">
          {/* Primary Account */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <label className="text-xs text-secondary mb-2 block uppercase tracking-wide">Default Payment Account</label>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-alt">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 rounded bg-[#EC0000] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
                <span className="text-sm text-white truncate">Santander Current (£3,820.15)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted flex-shrink-0 ml-2" />
            </button>
            <p className="text-xs text-muted mt-2">Used for simple payments when no optimisation is needed. The engine checks this account first.</p>
          </div>

          {/* Overdraft Protection */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Prevent overdrafts automatically</h3>
                <p className="text-xs text-secondary mt-1">If a payment or upcoming direct debit would push your primary account below £0, OptiVault will auto-transfer from savings or other current accounts via VRP — within your set limits.</p>
              </div>
              <div className="flex-shrink-0">
                <Toggle enabled={preferences.overdraftProtection} onChange={() => setPreferences({ ...preferences, overdraftProtection: !preferences.overdraftProtection })} />
              </div>
            </div>

            {preferences.overdraftProtection && (
              <div className="mt-3 pt-3 border-t border-optivault space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Safety buffer:</span>
                  <input
                    type="number"
                    value={preferences.safetyBuffer}
                    onChange={(e) => setPreferences({ ...preferences, safetyBuffer: parseInt(e.target.value) || 0 })}
                    className="w-20 h-8 px-2 rounded-lg bg-surface-alt border border-optivault text-white text-sm text-right font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted">Keep at least this much in your primary account after any transfer.</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Look-ahead window:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={preferences.lookAheadWindow}
                      onChange={(e) => setPreferences({ ...preferences, lookAheadWindow: parseInt(e.target.value) || 0 })}
                      className="w-16 h-8 px-2 rounded-lg bg-surface-alt border border-optivault text-white text-sm text-right font-mono"
                    />
                    <span className="text-xs text-muted">hours</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted">Engine checks direct debits due in the next 28 hours.</p>
              </div>
            )}
          </div>

          {/* Auto Savings Transfers */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Automatic Savings Transfers</h3>
                <p className="text-xs text-secondary mt-1">Allow OptiVault to pull from savings accounts to cover shortfalls</p>
                <p className="text-[10px] text-muted mt-2">Subject to your VRP limits</p>
              </div>
              <div className="flex-shrink-0">
                <Toggle enabled={preferences.autoSavingsTransfers} onChange={() => setPreferences({ ...preferences, autoSavingsTransfers: !preferences.autoSavingsTransfers })} />
              </div>
            </div>
          </div>

          {/* Cashback Routing */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Credit Card Cashback Routing</h3>
                <p className="text-xs text-secondary mt-1">Route payments to cashback cards when you benefit</p>
              </div>
              <div className="flex-shrink-0">
                <Toggle enabled={preferences.cashbackRouting} onChange={() => setPreferences({ ...preferences, cashbackRouting: !preferences.cashbackRouting })} />
              </div>
            </div>

            {preferences.cashbackRouting && (
              <label className="flex items-start gap-3 mt-3 pt-3 border-t border-optivault">
                <input
                  type="checkbox"
                  checked={preferences.payInFull}
                  onChange={() => setPreferences({ ...preferences, payInFull: !preferences.payInFull })}
                  className="mt-0.5 w-4 h-4 rounded border-optivault bg-surface checked:bg-optivault-emerald flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white">Only if I pay my statement in full each month</span>
                  <p className="text-[10px] text-muted mt-1">OptiVault will never put you into credit card debt. If you carry a balance, credit card routing is disabled.</p>
                </div>
              </label>
            )}
          </div>

          {/* FX Optimisation */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">FX Optimisation</h3>
                <p className="text-xs text-secondary mt-1">Route foreign currency payments to the cheapest FX source</p>
                <p className="text-[10px] text-muted mt-2">Automatically uses Capital One (0%) or multi-currency accounts instead of your bank's 3-4% markup</p>
              </div>
              <div className="flex-shrink-0">
                <Toggle enabled={preferences.fxOptimisation} onChange={() => setPreferences({ ...preferences, fxOptimisation: !preferences.fxOptimisation })} />
              </div>
            </div>
          </div>

          {/* International Funds */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">When should we use international accounts?</h3>
            <div className="space-y-2">
              {[
                { value: "ask", label: "Always ask me first" },
                { value: "auto-under-100", label: "Auto-approve transfers under £100" },
                { value: "never", label: "Never use international funds automatically" }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt hover:bg-elevated cursor-pointer">
                  <input
                    type="radio"
                    checked={preferences.internationalUsage === option.value}
                    onChange={() => setPreferences({ ...preferences, internationalUsage: option.value as any })}
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm text-white">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-muted mt-3">International transfers involve FX fees. We'll always show costs before proceeding.</p>
          </div>

          {/* Spending Categories */}
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Spending Interests</h3>
            <p className="text-xs text-secondary mb-4">Select categories you spend in regularly</p>

            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const updated = [...selectedCategories];
                      updated[idx] = { ...cat, selected: !cat.selected };
                      setSelectedCategories(updated);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 ${cat.selected
                        ? 'bg-optivault-emerald text-white'
                        : 'bg-surface-alt border border-optivault text-secondary'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/80 backdrop-blur-md border-t border-optivault px-4 sm:px-6 py-4 z-50">
        <div className="mobile-container">
          <Button to="/home" variant="primary" size="lg" fullWidth className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
            Launch OptiVault →
          </Button>
          <p className="text-xs text-center text-muted mt-2">You can change any of these settings anytime</p>
        </div>
      </div>
    </div>
  );
}