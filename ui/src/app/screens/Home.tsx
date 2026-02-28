import { Link, useNavigate } from "react-router";
import { Bell, Settings, Plus, TrendingUp, ArrowUpRight, Zap, Plane, ShoppingCart, ShoppingBag, Home as HomeIconLucide, Smartphone, Snowflake, CreditCard, BarChart3, User, ChevronRight } from "lucide-react";

function BottomNav({ active }: { active: string }) {
  const tabs = [
    { id: "home", label: "Home", icon: HomeIconLucide, path: "/home" },
    { id: "card", label: "Card", icon: CreditCard, path: "/card" },
    { id: "simulator", label: "Simulator", icon: Zap, path: "/simulator" },
    { id: "insights", label: "Insights", icon: BarChart3, path: "/insights" },
    { id: "account", label: "Account", icon: User, path: "/accounts" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-optivault h-[68px] z-50">
      <div className="mobile-container h-full flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-optivault-emerald' : 'text-[#5B6B82]'}`} />
              <span className={`text-[10px] ${isActive ? 'text-optivault-emerald font-semibold' : 'text-[#5B6B82]'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const recentTransactions = [
    {
      id: "1",
      icon: Plane,
      merchant: "British Airways",
      time: "Today 16:42",
      amount: "-£420.50",
      source: "Amex Gold",
      sourceColor: "#006FCF",
      optimization: null
    },
    {
      id: "2",
      icon: ShoppingCart,
      merchant: "Sainsbury's",
      time: "Today 14:15",
      amount: "-£112.40",
      source: "Amex Gold",
      sourceColor: "#006FCF",
      optimization: { type: "cashback", value: "+£1.12 cashback", color: "text-optivault-emerald" }
    },
    {
      id: "3",
      icon: ShoppingBag,
      merchant: "Amazon US",
      time: "Yesterday",
      amount: "-$89.99",
      source: "Capital One",
      sourceColor: "#D03027",
      optimization: { type: "fx", value: "Saved £2.84 on FX", color: "text-optivault-cyan" }
    },
    {
      id: "4",
      icon: HomeIconLucide,
      merchant: "Rent",
      time: "1 Mar",
      amount: "-£1,850.00",
      source: "Santander + Saver",
      sourceColor: "#EC0000",
      optimization: { type: "vrp", value: "Auto-moved £780 via VRP", color: "text-optivault-emerald" }
    },
    {
      id: "5",
      icon: Smartphone,
      merchant: "Netflix",
      time: "3 Mar",
      amount: "-£15.99",
      source: "Santander",
      sourceColor: "#EC0000",
      optimization: null
    }
  ];

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy pb-24 overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-optivault-navy/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-optivault-emerald to-optivault-cyan flex items-center justify-center text-white font-semibold text-sm">
            AM
          </div>
          <div>
            <span className="text-base font-semibold text-white">Hi, Amanda</span>
            <span className="text-xs text-secondary block mt-0.5">Ready to optimize?</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="w-6 h-6 text-secondary" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
          </button>
          <button>
            <Settings className="w-6 h-6 text-secondary" />
          </button>
        </div>
      </div>

      <div className="px-6">
        {/* Total Liquidity Card */}
        <div className="premium-gradient rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-optivault-emerald opacity-[0.08] rounded-full blur-3xl" />

          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-widest text-muted mb-1">TOTAL BALANCE</p>
            <h2 className="text-[40px] font-bold text-white mono leading-tight mb-2">£18,441</h2>
            <p className="text-xs text-secondary mb-4">Across 5 accounts</p>
          </div>
        </div>

        {/* Virtual Card */}
        <div className="mb-6">
          {/* Virtual Card Front */}
          <div className="relative card-gradient rounded-2xl aspect-[1.586] p-5 flex flex-col justify-between overflow-hidden">
            {/* Glass reflection */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <p className="text-xs font-semibold text-white">OptiVault Hub</p>
              </div>
              <div className="w-10 h-6 bg-white/20 backdrop-blur-md rounded border border-white/20 flex items-center justify-center">
                <div className="text-[10px] font-bold text-white tracking-wider">NFC</div>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[11px] text-white/90 tracking-wide">AMANDA</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-mono text-white tracking-[0.15em]">**** <span className="text-white/50">****</span> <span className="text-white/50">****</span> 9421</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500/80 mix-blend-multiply" />
                  <div className="w-6 h-6 rounded-full bg-yellow-500/80 mix-blend-multiply" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button className="flex-1 h-9 rounded-lg border border-optivault bg-transparent text-xs text-white hover:bg-surface transition-colors">
              View Details
            </button>
            <button className="flex-1 h-9 rounded-lg border border-optivault bg-transparent text-xs text-white hover:bg-surface transition-colors flex items-center justify-center gap-1.5">
              <Snowflake className="w-4 h-4 text-[#EF4444]" />
              Freeze Card
            </button>
          </div>
        </div>

        {/* Optimisation Status */}
        <button
          onClick={() => navigate('/insights')}
          className="w-full bg-optivault-emerald-dim border border-optivault-emerald/30 rounded-xl p-4 flex items-center gap-3 mb-6 hover:bg-optivault-emerald-mid transition-colors"
        >
          <Zap className="w-8 h-8 text-optivault-emerald" />
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-optivault-emerald">Saved £47.20 this month</p>
            <p className="text-xs text-secondary">12 of 34 transactions optimised</p>
          </div>
          <ChevronRight className="w-5 h-5 text-optivault-emerald" />
        </button>

        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
            <button className="text-xs text-optivault-emerald font-semibold hover:underline">See all →</button>
          </div>

          <div className="space-y-2">
            {recentTransactions.map(tx => {
              const TxIcon = tx.icon;
              return (
                <button
                  key={tx.id}
                  onClick={() => navigate(`/transaction/${tx.id}`)}
                  className="w-full bg-surface border border-optivault rounded-xl p-3 flex items-center gap-3 hover:bg-surface-alt transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-lg flex-shrink-0">
                    <TxIcon className="w-5 h-5 text-secondary" />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm text-white font-medium truncate">{tx.merchant}</p>
                    <p className="text-xs text-muted">{tx.time}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono text-white mb-0.5">{tx.amount}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.sourceColor }} />
                      <span className="text-[10px] text-muted">{tx.source}</span>
                    </div>
                    {tx.optimization && (
                      <p className={`text-[10px] mt-0.5 ${tx.optimization.color}`}>
                        {tx.optimization.value}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Next 28 Hours</h3>
          <div className="bg-surface border border-optivault rounded-xl p-4">
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Council Tax DD · Tomorrow 06:00</span>
                <span className="text-white font-mono">£189</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">Gym DD · Tomorrow 09:00</span>
                <span className="text-white font-mono">£39.99</span>
              </div>
            </div>

            <div className="pt-3 border-t border-optivault">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded-full bg-optivault-emerald/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-optivault-emerald text-[10px]">✓</span>
                </div>
                <p className="text-secondary">After DDs: Santander will have <span className="text-white font-mono">£3,591.16</span></p>
              </div>
              <p className="text-[10px] text-optivault-emerald mt-1 ml-6">No overdraft risk detected</p>
            </div>
          </div>
        </div>

        {/* VRP Usage */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">VRP Transfers This Month</h3>
          <div className="bg-surface border border-optivault rounded-xl p-4 space-y-3">
            {[
              { name: "Monzo", used: 0, total: 2000 },
              { name: "Santander Saver", used: 780, total: 3000 },
              { name: "Lloyds", used: 0, total: 1000 }
            ].map((account, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-secondary">{account.name}</span>
                  <span className="text-xs text-white font-mono">£{account.used} of £{account.total.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-optivault-emerald transition-all"
                    style={{ width: `${(account.used / account.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

export { BottomNav };