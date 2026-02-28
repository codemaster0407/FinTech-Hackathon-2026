import { ArrowLeft, Clock, MapPin, Tag, Info, ShoppingCart, Zap, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function TransactionDetail() {
  const navigate = useNavigate();
  const [showEngineDetails, setShowEngineDetails] = useState(false);
  
  // Example: Sainsbury's transaction
  const transaction = {
    icon: ShoppingCart,
    merchant: "Sainsbury's",
    amount: "£112.40",
    date: "Today at 14:15",
    category: "Groceries",
    type: "Domestic GBP",
    optimization: {
      step: "Step 2: Rewards Arbitrage",
      explanation: "Your Amex Gold earns 1% cashback on the 'groceries' merchant category. Since you pay your Amex statement in full each month, there's no interest cost. The engine routed this to Amex for a net benefit of +£1.12.",
      flow: ["Step 1: Primary has funds ✓", "Step 2: Cashback applies? ✓ Amex 1% on groceries", "ROUTE TO AMEX"]
    },
    allocation: [
      { source: "Amex Gold", amount: "£112.40", fee: "£0.00", benefit: "+£1.12 cashback", color: "#006FCF" }
    ],
    comparison: {
      default: { source: "Santander", amount: "£112.40", fee: "£0.00", cashback: "£0.00" },
      message: "You would have missed £1.12 in cashback"
    },
    savings: "£1.12",
    projection: "~£58 from grocery optimisation alone",
    engineCalc: [
      "Santander cost: £0.000 per pound (no cashback in groceries)",
      "Amex Gold cost: -£0.010 per pound (1% cashback = negative cost)",
      "Amex wins by: £0.010/£ × £112.40 = £1.12",
      "Credit utilisation check: 30% → 31.4% (under 90% limit ✓)"
    ]
  };
  
  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-12">
      {/* Header */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 p-2 hover:bg-surface rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 text-secondary" />
      </button>
      
      {/* Transaction Card */}
      <div className="bg-surface border border-optivault rounded-2xl p-5 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-alt flex items-center justify-center text-3xl mb-3">
            <ShoppingCart className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-[22px] font-bold text-white mb-1">{transaction.merchant}</h1>
          <p className="text-[36px] font-mono font-bold text-white mb-2">{transaction.amount}</p>
          <p className="text-xs text-secondary mb-3">{transaction.date}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-alt text-muted text-xs">{transaction.category}</span>
            <span className="px-3 py-1 rounded-full bg-surface-alt text-muted text-xs">{transaction.type}</span>
          </div>
        </div>
      </div>
      
      {/* Decision Card */}
      <div className="bg-status-amber-dim border-l-4 border-optivault-amber rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded-md bg-optivault-amber/20 text-optivault-amber text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Auto-Optimised
          </span>
        </div>
        
        <h3 className="text-sm font-bold text-white mb-2">{transaction.optimization.step}</h3>
        <p className="text-xs text-secondary leading-relaxed mb-4">{transaction.optimization.explanation}</p>
        
        <div className="bg-surface/50 rounded-lg p-3">
          <p className="text-[10px] text-muted uppercase tracking-wide mb-2">Decision Path:</p>
          <div className="space-y-1">
            {transaction.optimization.flow.map((step, idx) => (
              <p key={idx} className="text-xs text-white">{step}</p>
            ))}
          </div>
        </div>
      </div>
      
      {/* Allocation Card */}
      <div className="bg-surface border border-optivault rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Payment Allocation</h3>
        
        <div className="h-2 bg-surface-alt rounded-full overflow-hidden mb-4">
          <div className="h-full" style={{ backgroundColor: transaction.allocation[0].color, width: '100%' }} />
        </div>
        
        {transaction.allocation.map((alloc, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
            <div className="flex-1">
              <p className="text-sm text-white font-semibold">{alloc.source}</p>
              <p className="text-xs text-secondary">Amount: {alloc.amount} · Fee: {alloc.fee}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-optivault-emerald">{alloc.benefit}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Comparison Card */}
      <div className="bg-status-red-dim border border-[#EF4444]/30 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Without OptiVault</h3>
        <div className="bg-surface/50 rounded-lg p-3 mb-2">
          <p className="text-xs text-secondary">
            Default {transaction.comparison.default.source}: {transaction.comparison.default.amount} · Fee: {transaction.comparison.default.fee} · Cashback: {transaction.comparison.default.cashback}
          </p>
        </div>
        <p className="text-xs text-[#EF4444]">{transaction.comparison.message}</p>
      </div>
      
      {/* Savings Card */}
      <div className="bg-optivault-emerald-dim border border-optivault-emerald/30 rounded-xl p-5 mb-6 text-center">
        <p className="text-sm text-secondary mb-1">You saved</p>
        <p className="text-[24px] font-bold text-optivault-emerald mono mb-2">{transaction.savings}</p>
        <p className="text-xs text-secondary">Annual projection: {transaction.projection}</p>
      </div>
      
      {/* Engine Details (Collapsible) */}
      <div className="bg-surface border border-optivault rounded-xl overflow-hidden">
        <button
          onClick={() => setShowEngineDetails(!showEngineDetails)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold text-white">Engine Calculation Details</h3>
          <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${showEngineDetails ? 'rotate-180' : ''}`} />
        </button>
        
        {showEngineDetails && (
          <div className="px-4 pb-4 border-t border-optivault pt-4">
            <p className="text-xs text-secondary mb-3">Model calculation:</p>
            <div className="bg-surface-alt rounded-lg p-3 space-y-2">
              {transaction.engineCalc.map((calc, idx) => (
                <p key={idx} className="text-xs text-white font-mono">{calc}</p>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button className="text-sm text-secondary hover:text-white transition-colors">Dispute</button>
        <span className="text-muted">·</span>
        <button className="text-sm text-secondary hover:text-white transition-colors">Share</button>
      </div>
    </div>
  );
}