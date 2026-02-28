import { BottomNav } from "./Home";
import { Plus, ChevronRight, Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

// Bank logo map — served from /public/logos/
const bankLogoMap: Record<string, string> = {
  "Santander": "/logos/santander.png",
  "Monzo": "/logos/monzo.png",
  "Lloyds": "/logos/lloyds.png",
  "Barclays": "/logos/barclays.png",
  "Amex Gold": "/logos/amex.png",
  "Chase UK": "/logos/chase.png",
  "Capital One": "/logos/capitalone.png",
  "State Bank of India": "/logos/sbi.png",
};

function BankLogo({ bank, color, fallback }: { bank: string; color?: string; fallback: string }) {
  const src = bankLogoMap[bank];
  if (src) {
    return (
      <div
        className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white border border-optivault"
      >
        <img src={src} alt={bank} className="w-full h-full object-contain" />
      </div>
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {fallback}
    </div>
  );
}

export default function Accounts() {
  const navigate = useNavigate();
  const accounts = {
    uk: [
      { bank: "Santander", type: "Current", balance: "£3,820.16", vrp: true, badge: "VRP ON", synced: "2m ago", color: "#EC0000", logo: "S", isPrimary: true },
      { bank: "Monzo", type: "Current", balance: "£1,521.00", vrp: true, badge: "VRP ON", synced: "2m ago", color: "#FF5A5F", logo: "M" },
      { bank: "Lloyds", type: "Saver", balance: "£4,480.00", vrp: false, badge: "VRP OFF", synced: "5m ago", color: "#006A4D", logo: "L" },
      { bank: "Barclays", type: "ISA", balance: "£6,420.00", vrp: false, badge: "ISA · VRP OFF", synced: "5m ago", color: "#00AEEF", logo: "B" }
    ],
    creditCards: [
      { bank: "Amex Gold", type: "Credit", balance: "£3,400 available", linked: true, utilisation: 15, cashback: "4.4% cashback", color: "#002663", logo: "A" },
      { bank: "Chase UK", type: "Credit", balance: "£4,500 available", linked: true, utilisation: 5, cashback: "1% cashback", color: "#117ACA", logo: "C" },
      { bank: "Capital One", type: "Credit", balance: "£1,500 available", linked: true, utilisation: 0, fx: "0% FX", color: "#003A6C", logo: "C" }
    ],
    international: [
      { icon: Globe, bank: "State Bank of India", type: "Savings", balance: "₹1,85,000", badge: "Account Aggregator ✓", synced: "2m ago" },
    ]
  };

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </button>
          <h1 className="text-2xl font-bold text-white">My Accounts</h1>
        </div>
      </div>

      {/* UK Accounts */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase tracking-widest text-muted mb-3">UK ACCOUNTS — Open Banking</h2>
        <div className="space-y-2">
          {accounts.uk.map((account, idx) => (
            <div key={idx} className="bg-surface border border-optivault rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BankLogo bank={account.bank} color={account.color} fallback={account.logo} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{account.bank}</h3>
                    {account.isPrimary && (
                      <span className="px-2 py-0.5 rounded-md bg-optivault-emerald-dim text-optivault-emerald text-[10px] font-semibold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary mb-2">{account.type}</p>
                  <p className="text-base font-mono text-white mb-2">{account.balance}</p>
                  {account.vrp && (
                    <p className="text-xs text-optivault-emerald">VRP: {account.vrp}</p>
                  )}
                  <p className="text-[10px] text-muted mt-1">Synced {account.synced}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Cards */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase tracking-widest text-muted mb-3">CREDIT CARDS — Open Banking + Card linked</h2>
        <div className="space-y-2">
          {accounts.creditCards.map((card, idx) => (
            <div key={idx} className="bg-surface border border-optivault rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BankLogo bank={card.bank} color={card.color} fallback={card.logo} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{card.bank}</h3>
                    {card.linked && (
                      <span className="px-2 py-0.5 rounded-md bg-optivault-emerald-dim text-optivault-emerald text-[10px] font-semibold">
                        Card linked ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary mb-2">{card.type}</p>
                  <p className="text-base font-mono text-white mb-2">{card.balance}</p>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-secondary">Utilisation: {card.utilisation}%</span>
                    </div>
                    <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${card.utilisation}%` }} />
                    </div>
                  </div>

                  {card.cashback && (
                    <p className="text-xs text-optivault-emerald">{card.cashback}</p>
                  )}
                  {card.fx && (
                    <p className="text-xs text-optivault-cyan">{card.fx}</p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* International */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase tracking-widest text-muted mb-3">INTERNATIONAL</h2>
        <div className="space-y-2">
          {accounts.international.map((account, idx) => {
            return (
              <div key={idx} className="bg-surface border border-optivault rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <BankLogo bank={account.bank} color="#1C4587" fallback="IN" />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-1">{account.bank}</h3>
                    <p className="text-xs text-secondary mb-2">{account.type}</p>
                    <p className="text-base font-mono text-white mb-2">{account.balance}</p>
                    <p className="text-xs text-optivault-emerald mb-1">{account.badge}</p>
                    <p className="text-[10px] text-muted">Synced {account.synced}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-optivault-emerald shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-40">
        <Plus className="w-6 h-6 text-white" strokeWidth={3} />
      </button>

      {/* Bottom Navigation */}
      <BottomNav active="account" />
    </div>
  );
}