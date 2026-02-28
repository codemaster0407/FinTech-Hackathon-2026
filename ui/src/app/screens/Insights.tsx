import { BottomNav } from "./Home";
import { TrendingUp, AlertTriangle, ArrowLeftRight, Star, Shield, Zap } from "lucide-react";

export default function Insights() {
  const savingsBreakdown = [
    { type: "FX optimisation", amount: "£21.48", color: "bg-optivault-cyan-dim", iconColor: "text-optivault-cyan" },
    { type: "Cashback routing", amount: "£18.70", color: "bg-purple-500/20", iconColor: "text-purple-400" },
    { type: "Overdraft prevention", amount: "£6.00", color: "bg-optivault-emerald-dim", iconColor: "text-optivault-emerald" },
    { type: "Auto-VRP transfers", amount: "£1.02", color: "bg-blue-500/20", iconColor: "text-blue-400" }
  ];

  const activityLog = [
    { time: "14:15", merchant: "Sainsbury's £112.40", action: "Step 2: Amex cashback", result: "+£1.12" },
    { time: "08:32", merchant: "Pret £4.50", action: "Step 1: Pass-through", result: "£0 saved" },
    { time: "Yesterday", merchant: "Amazon US $89.99", action: "Step 3: FX optimised", result: "+£2.84" },
    { time: "1 Mar", merchant: "Rent £1,850", action: "Step 4: VRP savings pull", result: "overdraft prevented" }
  ];

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">Insights</h1>

      {/* Monthly Savings Summary */}
      <div className="premium-gradient rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-optivault-emerald opacity-[0.08] rounded-full blur-3xl" />

        <div className="relative z-10">
          <p className="text-xs text-secondary mb-1">February Optimisation</p>
          <h2 className="text-[36px] font-bold text-optivault-emerald mono leading-tight mb-2">£47.20 saved</h2>
          <p className="text-xs text-secondary mb-4">vs. using your default account for everything</p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">34 transactions</span>
            <span className="text-muted">·</span>
            <span className="text-optivault-emerald">12 optimised</span>
            <span className="text-muted">·</span>
            <span className="text-secondary">22 pass-through</span>
          </div>
        </div>
      </div>

      {/* Savings Breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Savings Breakdown</h3>
        <div className="grid grid-cols-2 gap-3">
          {savingsBreakdown.map((item, idx) => {
            const icons = [ArrowLeftRight, Star, Shield, Zap];
            const IconComponent = icons[idx];
            return (
              <div key={idx} className="bg-surface border border-optivault rounded-xl p-4">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                  <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <p className="text-xs text-secondary mb-1">{item.type}</p>
                <p className="text-lg font-mono font-bold text-white mb-1">{item.amount}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engine Activity Log */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Engine Activity Log</h3>
        <div className="bg-surface border border-optivault rounded-xl divide-y divide-optivault">
          {activityLog.map((log, idx) => (
            <div key={idx} className="p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-secondary">{log.time}</p>
                <p className="text-xs text-optivault-emerald font-mono">{log.result}</p>
              </div>
              <p className="text-sm text-white mb-1">{log.merchant}</p>
              <p className="text-xs text-muted">{log.action}</p>
            </div>
          ))}
        </div>
      </div>



      <BottomNav active="insights" />
    </div>
  );
}