import { useState } from "react";
import { ArrowLeft, Info, AlertTriangle, Lightbulb, Minus, Plus, Lock } from "lucide-react";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";

interface VRPLimit {
  perTransaction: number;
  perMonth: number;
  usedThisMonth: number;
}

interface Account {
  id: string;
  bank: string;
  type: string;
  balance: string;
  color: string;
  logo: string;
  isPrimary?: boolean;
  badge?: string;
  limits: VRPLimit;
  allowVRP: boolean;
}

function VRPLimitCard({ account, onUpdate }: { account: Account; onUpdate: (updates: Partial<Account>) => void }) {
  const progressPercent = (account.limits.usedThisMonth / account.limits.perMonth) * 100;

  return (
    <div className="bg-surface border border-optivault rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: account.color }}
        >
          {account.logo}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{account.bank} {account.type}</h3>
            {account.isPrimary && (
              <span className="px-2 py-0.5 rounded-md bg-optivault-emerald-dim text-optivault-emerald text-[10px] font-semibold">
                PRIMARY
              </span>
            )}
            {account.badge && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${account.badge === "SAVINGS" ? "bg-blue-500/10 text-blue-400" :
                account.badge === "ISA" ? "bg-purple-500/10 text-purple-400" : ""
                }`}>
                {account.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted font-mono">{account.balance}</p>
        </div>
      </div>

      {account.isPrimary ? (
        <div className="bg-surface-alt rounded-lg p-3">
          <p className="text-xs text-secondary leading-relaxed">
            This is your primary account. Payments are made FROM this account. VRP allows other accounts to transfer INTO this account.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted">Allow incoming VRP transfers</span>
            <button
              onClick={() => onUpdate({ allowVRP: !account.allowVRP })}
              className={`w-12 h-6 rounded-full transition-colors ${account.allowVRP ? 'bg-optivault-emerald' : 'bg-surface'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${account.allowVRP ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {account.badge === "ISA" && !account.allowVRP ? (
            <div className="bg-status-amber-dim border border-optivault-amber/30 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-optivault-amber font-semibold">Allow VRP transfers from ISA</span>
                <button
                  onClick={() => onUpdate({ allowVRP: true })}
                  className="w-12 h-6 rounded-full bg-surface"
                >
                  <div className="w-5 h-5 rounded-full bg-white translate-x-0.5" />
                </button>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-optivault-amber flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-secondary">
                  Withdrawing from an ISA may affect your annual allowance. OptiVault will always alert you before using ISA funds.
                </p>
              </div>
            </div>
          ) : (
            <>
              <h4 className="text-xs font-semibold text-white mb-3">Outgoing VRP Limits</h4>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-secondary">Max per transfer</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate({ limits: { ...account.limits, perTransaction: Math.max(100, account.limits.perTransaction - 100) } })}
                        className="w-7 h-7 rounded-lg bg-surface-alt hover:bg-elevated transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 text-secondary" />
                      </button>
                      <span className="text-sm font-mono text-white w-16 text-center">£{account.limits.perTransaction}</span>
                      <button
                        onClick={() => onUpdate({ limits: { ...account.limits, perTransaction: account.limits.perTransaction + 100 } })}
                        className="w-7 h-7 rounded-lg bg-surface-alt hover:bg-elevated transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 text-secondary" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted">OptiVault can move up to this amount in a single transfer</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-secondary">Max per month</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate({ limits: { ...account.limits, perMonth: Math.max(500, account.limits.perMonth - 500) } })}
                        className="w-7 h-7 rounded-lg bg-surface-alt hover:bg-elevated transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 text-secondary" />
                      </button>
                      <span className="text-sm font-mono text-white w-16 text-center">£{account.limits.perMonth.toLocaleString()}</span>
                      <button
                        onClick={() => onUpdate({ limits: { ...account.limits, perMonth: account.limits.perMonth + 500 } })}
                        className="w-7 h-7 rounded-lg bg-surface-alt hover:bg-elevated transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 text-secondary" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted">Total OptiVault can move from this account per calendar month</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-optivault">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-secondary">Used this month:</span>
                  <span className="text-xs font-mono text-white">£{account.limits.usedThisMonth} of £{account.limits.perMonth.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-optivault-emerald transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {account.badge === "SAVINGS" && (
                <div className="mt-3 bg-status-blue-dim rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-secondary leading-relaxed">
                      Savings VRP is useful for overdraft prevention — OptiVault can auto-top-up your primary account when upcoming direct debits would push it negative.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function SetVRPLimits() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "santander-current",
      bank: "Santander",
      type: "Current Account",
      balance: "£3,820.15",
      color: "#EC0000",
      logo: "S",
      isPrimary: true,
      limits: { perTransaction: 0, perMonth: 0, usedThisMonth: 0 },
      allowVRP: true
    },
    {
      id: "monzo-current",
      bank: "Monzo",
      type: "Current Account",
      balance: "£1,240.50",
      color: "#FF5A5F",
      logo: "M",
      limits: { perTransaction: 500, perMonth: 2000, usedThisMonth: 0 },
      allowVRP: true
    },
    {
      id: "lloyds-current",
      bank: "Lloyds",
      type: "Current Account",
      balance: "£680.30",
      color: "#006A4D",
      logo: "L",
      limits: { perTransaction: 300, perMonth: 1000, usedThisMonth: 0 },
      allowVRP: true
    },
    {
      id: "santander-savings",
      bank: "Santander",
      type: "Easy Access Savings",
      balance: "£4,200.00",
      color: "#EC0000",
      logo: "S",
      badge: "SAVINGS",
      limits: { perTransaction: 1000, perMonth: 3000, usedThisMonth: 0 },
      allowVRP: true
    },
    {
      id: "lloyds-isa",
      bank: "Lloyds",
      type: "Cash ISA",
      balance: "£8,500.00",
      color: "#006A4D",
      logo: "L",
      badge: "ISA",
      limits: { perTransaction: 0, perMonth: 0, usedThisMonth: 0 },
      allowVRP: false
    }
  ]);

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(accounts.map(acc =>
      acc.id === id ? { ...acc, ...updates } : acc
    ));
  };

  const totalCapacity = accounts
    .filter(acc => !acc.isPrimary && acc.allowVRP)
    .reduce((sum, acc) => sum + acc.limits.perMonth, 0);

  return (
    <div className="min-h-screen bg-optivault-navy">
      <div className="mobile-container px-4 sm:px-6 py-6 sm:py-8 pb-56">
        <ProgressBar current={3} total={6} />

        <h1 className="text-xl sm:text-2xl font-bold text-white mt-6">Set Your Transfer Limits</h1>
        <p className="mt-2 text-sm text-secondary leading-relaxed">
          Control exactly how much OptiVault can move from each account. Your bank enforces these limits — we physically cannot exceed them.
        </p>

        <div className="mt-6 bg-optivault-emerald-dim border border-optivault-emerald/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-optivault-emerald flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white mb-1">VRP Limits — Your Protection</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Variable Recurring Payments let OptiVault transfer money between your accounts automatically (e.g., moving savings to cover a shortfall). You set a maximum per transaction and a maximum per month for each account. These limits are enforced by your bank at the infrastructure level — OptiVault cannot override or exceed them, even if our system were compromised.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {accounts.map(account => (
            <VRPLimitCard
              key={account.id}
              account={account}
              onUpdate={(updates) => updateAccount(account.id, updates)}
            />
          ))}
        </div>

        <div className="mt-6 bg-surface border border-optivault rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Presets</h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Conservative", perTx: 200, perMonth: 500 },
              { label: "Balanced", perTx: 500, perMonth: 2000 },
              { label: "Flexible", perTx: 2000, perMonth: 5000 }
            ].map(preset => (
              <button
                key={preset.label}
                className="px-4 py-2 rounded-lg bg-surface-alt hover:bg-elevated border border-optivault text-xs text-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/80 backdrop-blur-md border-t border-optivault px-4 sm:px-6 py-4 z-50">
        <div className="mobile-container">
          <div className="mb-3 bg-surface rounded-lg p-3 text-center border border-optivault">
            <p className="text-xs text-secondary">Total monthly VRP capacity:</p>
            <p className="text-lg font-mono font-bold text-optivault-emerald">£{totalCapacity.toLocaleString()}</p>
            <p className="text-[10px] text-muted mt-1">across {accounts.filter(a => !a.isPrimary && a.allowVRP).length} accounts</p>
          </div>

          <Button to="/onboarding/credit-cards" variant="primary" size="lg" fullWidth className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
            Continue
          </Button>
          <p className="text-xs text-center text-muted mt-2">You can change these limits anytime in Settings</p>
        </div>
      </div>
    </div>
  );
}