import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { Check, Lock, Search } from "lucide-react";

interface Bank {
  id: string;
  name: string;
  color: string;
  logo: string;
  connected: boolean;
  accounts?: Array<{
    type: string;
    balance: string;
    vrpStatus: string;
  }>;
}

function BankCard({ bank, onClick }: { bank: Bank; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[2/1] rounded-xl border-2 transition-all ${bank.connected
        ? 'bg-surface border-optivault-emerald'
        : 'bg-surface border-optivault hover:border-optivault-light'
        }`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2"
          style={{ backgroundColor: bank.color }}
        >
          {bank.logo}
        </div>
        <span className="text-xs text-white font-medium text-center">{bank.name}</span>
        {bank.connected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-optivault-emerald flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}

export default function ConnectBanks() {
  const [banks, setBanks] = useState<Bank[]>([
    { id: "monzo", name: "Monzo", color: "#FF5A5F", logo: "M", connected: true, accounts: [{ type: "Current Account", balance: "£1,240.50", vrpStatus: "Pending setup" }] },
    {
      id: "santander", name: "Santander", color: "#EC0000", logo: "S", connected: true, accounts: [
        { type: "Current Account", balance: "£3,820.15", vrpStatus: "Pending setup" },
        { type: "Easy Access Savings", balance: "£4,200.00", vrpStatus: "Pending setup" }
      ]
    },
    {
      id: "lloyds", name: "Lloyds", color: "#006A4D", logo: "L", connected: true, accounts: [
        { type: "Current Account", balance: "£680.30", vrpStatus: "Pending setup" },
        { type: "Cash ISA", balance: "£8,500.00", vrpStatus: "Pending setup" }
      ]
    },
    { id: "barclays", name: "Barclays", color: "#00AEEF", logo: "B", connected: false }
  ]);

  const connectedBanks = banks.filter(b => b.connected);

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-32">
      <ProgressBar current={2} total={6} />

      <h1 className="text-2xl font-bold text-white">Connect Your UK Banks</h1>
      <p className="mt-2 text-sm text-secondary leading-relaxed">
        We use Open Banking to read your balances and enable Variable Recurring Payments for instant transfers. We never see your login details.
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-white mb-3">Select your banks</h2>
        <div className="grid grid-cols-2 gap-3">
          {banks.map(bank => (
            <BankCard
              key={bank.id}
              bank={bank}
              onClick={() => { }}
            />
          ))}

          <button className="w-full aspect-[2/1] rounded-xl border-2 border-dashed border-optivault bg-surface/50 hover:bg-surface transition-all flex flex-col items-center justify-center gap-2">
            <Search className="w-5 h-5 text-muted" />
            <span className="text-xs text-muted">Search other banks</span>
          </button>
        </div>
      </div>

      {connectedBanks.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-white">Connected accounts</h2>

          {connectedBanks.map(bank => (
            <div key={bank.id} className="bg-surface border border-optivault rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: bank.color }}
                >
                  {bank.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{bank.name}</h3>
                    <span className="text-xs text-optivault-emerald">✓ Connected</span>
                  </div>
                  <p className="text-xs text-muted">{bank.accounts?.length} account{bank.accounts?.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>

              {bank.accounts && (
                <div className="mt-3 space-y-2 border-t border-optivault pt-3">
                  {bank.accounts.map((account, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-secondary">{account.type}</span>
                      <span className="text-white font-mono">{account.balance}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted mt-2">VRP: Pending setup</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-surface border border-optivault rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-4 h-4 text-optivault-cyan flex-shrink-0 mt-0.5" />
        <p className="text-xs text-secondary leading-relaxed">
          Open Banking is regulated by the FCA. Your login details are never shared with OptiVault. We use TrueLayer as our authorised AISP/PISP provider.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/80 backdrop-blur-md border-t border-optivault px-6 py-4 z-50">
        <div className="mobile-container">
          <Button to="/onboarding/vrp-limits" variant="primary" size="lg" fullWidth className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
            Continue
          </Button>
          <button className="w-full mt-2 text-sm text-muted hover:text-secondary transition-colors">
            Skip — I'll add more later
          </button>
        </div>
      </div>
    </div>
  );
}