import { useState } from "react";
import { Home as HomeIcon, CreditCard, BarChart3, User, Zap, ChevronDown, ChevronRight, ArrowRight, Info, CheckCircle } from "lucide-react";
import { Link } from "react-router";

function BottomNav({ active }: { active: string }) {
  const tabs = [
    { id: "home", label: "Home", icon: HomeIcon, path: "/home" },
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

interface OptimizationResult {
  user_id: string;
  user_name: string;
  transaction_id: string | null;
  description: string;
  amount_original: number;
  currency: string;
  amount_gbp: number;
  category: string;
  merchant: string;
  decision: string;
  decision_label: string;
  ui_hints: {
    headline: string;
    earn_label: string;
    comparison: string;
    card_badge: string;
    savings_nudge: string;
    net_benefit_gbp: number;
    total_points_earned: number;
    reward_type: string;
  };
  allocation: Array<{
    card_id: string;
    card_name: string;
    tier: number;
    tier_label: string;
    amount_gbp: number;
    cashback_earned: number;
    reward_points_earned: number;
    reward_type: string;
    interest_opportunity_lost: number;
    fx_cost: number;
    net_benefit: number;
    pending_auto_debits_reserved: number;
    card_badge: string;
  }>;
  eom_impact: {
    total_cashback_earned: number;
    total_interest_opportunity_lost: number;
    total_fx_costs: number;
    net_eom_benefit: number;
  };
  savings_interest_context: {
    weighted_avg_savings_rate_annual: number;
    weighted_avg_savings_rate_monthly: number;
    per_account_monthly_interest: Record<string, {
      balance: number;
      annual_rate: number;
      monthly_interest: number;
    }>;
    remaining_monthly_interest_after_txn: number;
  };
  updated_balances: any;
  virtual_card: {
    id: string;
    name: string;
    is_active: boolean;
    logic: string;
  };
  llm_explanation: string;
  user_friendly_summary: string;
}

export default function Simulator() {
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("GBP");
  const [category, setCategory] = useState<string>("travel");
  const [isInternational, setIsInternational] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  const currencies = ["GBP", "EUR", "USD"];
  const categories = [
    { value: "travel", label: "Travel" },
    { value: "groceries", label: "Groceries" },
    { value: "fuel", label: "Fuel" },
    { value: "hotel", label: "Hotel" }
  ];

  const demoScenarios = [
    { name: "Paris Travel", amount: "200", currency: "EUR", category: "travel", international: true },
    { name: "Tesco Groceries", amount: "100", currency: "GBP", category: "groceries", international: false },
    { name: "Fuel Purchase", amount: "80", currency: "GBP", category: "fuel", international: false }
  ];

  const runOptimization = async () => {
    if (!amount) return;

    setIsOptimizing(true);

    const amountNum = parseFloat(amount);
    const isInternational = currency !== "GBP";

    const payload = {
      user_id: "usr_001",
      amount: amountNum,
      currency: currency,
      category: category,
      merchant: "HMRC Tax",
      is_international: isInternational
    };

    try {
      // Attempt to hit the actual teammate backend
      const response = await fetch("http://localhost:8000/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setIsOptimizing(false);
        return;
      } else {
        console.warn("Backend API returned an error, falling back to mock data.");
      }
    } catch (err) {
      console.warn("Backend API not reachable, falling back to mock data.", err);
    }

    // Fallback Mock Logic (simulates network delay)
    setTimeout(() => {
      // If amount isn't exactly the mock's 4000, we can still use the mock but scale the values or just return the hardcoded JSON
      // We will inject the standard mock provided by the teammate directly as proof-of-concept for the new schema
      setResult({
        user_id: "usr_001",
        user_name: "Amanda Clarke",
        transaction_id: null,
        description: isInternational ? "International Transfer" : "HMRC Tax",
        amount_original: amountNum,
        currency: currency,
        amount_gbp: currency === "USD" ? amountNum * 0.78 : currency === "EUR" ? amountNum * 0.85 : amountNum,
        category: category,
        merchant: "HMRC Tax",
        decision: "fallback_international",
        decision_label: "Optimized route selected",
        ui_hints: {
          headline: "Highest Net Benefit Selected",
          earn_label: "Cashback and points optimized",
          comparison: "Costs £0.50 more than ideal, but no better option available",
          card_badge: "Best for Luxury & Travel",
          savings_nudge: "Consider increasing your credit safety cap to preserve more savings interest.",
          net_benefit_gbp: ((amountNum * 0.45 * 0.01) + (amountNum * 0.36 * 0.015)) - (((amountNum * 0.075) * (0.01 / 365) * 30) + ((amountNum * 0.035) * (0.02 / 365) * 30)) - (isInternational ? amountNum * 0.08 * 0.01 : 0),
          total_points_earned: Math.floor(amountNum * 0.45 * 1.5),
          reward_type: "points"
        },
        allocation: [
          {
            card_id: "amex_amanda",
            card_name: "Amex Platinum",
            tier: 1,
            tier_label: "Credit Card",
            amount_gbp: amountNum * 0.45,
            cashback_earned: amountNum * 0.45 * 0.01, // 1%
            reward_points_earned: Math.floor(amountNum * 0.45 * 1.5),
            reward_type: "points",
            interest_opportunity_lost: 0,
            fx_cost: 0,
            net_benefit: amountNum * 0.45 * 0.01,
            pending_auto_debits_reserved: 0,
            card_badge: "Best for Luxury & Travel"
          },
          {
            card_id: "chase_amanda",
            card_name: "Chase Freedom",
            tier: 1,
            tier_label: "Credit Card",
            amount_gbp: amountNum * 0.36,
            cashback_earned: amountNum * 0.36 * 0.015, // 1.5%
            reward_points_earned: 0,
            reward_type: "cashback",
            interest_opportunity_lost: 0,
            fx_cost: 0,
            net_benefit: amountNum * 0.36 * 0.015,
            pending_auto_debits_reserved: 0,
            card_badge: "Best for Dining & Grocery"
          },
          {
            card_id: "santander_amanda",
            card_name: "Santander Current",
            tier: 2,
            tier_label: "Debit Account",
            amount_gbp: amountNum * 0.075,
            cashback_earned: 0,
            reward_points_earned: 0,
            reward_type: "cashback",
            interest_opportunity_lost: (amountNum * 0.075) * (0.01 / 365) * 30, // Rough 1% APY over 30 days
            fx_cost: 0,
            net_benefit: -((amountNum * 0.075) * (0.01 / 365) * 30),
            pending_auto_debits_reserved: 0,
            card_badge: ""
          },
          {
            card_id: "barclays_amanda",
            card_name: "Barclays Everyday",
            tier: 2,
            tier_label: "Debit Account",
            amount_gbp: amountNum * 0.035,
            cashback_earned: 0,
            reward_points_earned: 0,
            reward_type: "cashback",
            interest_opportunity_lost: (amountNum * 0.035) * (0.02 / 365) * 30, // 2% APY roughly
            fx_cost: 0,
            net_benefit: -((amountNum * 0.035) * (0.02 / 365) * 30),
            pending_auto_debits_reserved: 0,
            card_badge: ""
          },
          {
            card_id: "revolut_amanda",
            card_name: "Revolut Premium",
            tier: 3,
            tier_label: "Intl Backup",
            amount_gbp: amountNum * 0.08,
            cashback_earned: 0,
            reward_points_earned: 0,
            reward_type: "cashback",
            interest_opportunity_lost: 0,
            fx_cost: isInternational ? amountNum * 0.08 * 0.01 : 0, // 1% FX fee
            net_benefit: isInternational ? -(amountNum * 0.08 * 0.01) : 0,
            pending_auto_debits_reserved: 0,
            card_badge: ""
          }
        ],
        eom_impact: {
          total_cashback_earned: (amountNum * 0.45 * 0.01) + (amountNum * 0.36 * 0.015),
          total_interest_opportunity_lost: ((amountNum * 0.075) * (0.01 / 365) * 30) + ((amountNum * 0.035) * (0.02 / 365) * 30),
          total_fx_costs: isInternational ? amountNum * 0.08 * 0.01 : 0,
          net_eom_benefit: ((amountNum * 0.45 * 0.01) + (amountNum * 0.36 * 0.015)) - (((amountNum * 0.075) * (0.01 / 365) * 30) + ((amountNum * 0.035) * (0.02 / 365) * 30)) - (isInternational ? amountNum * 0.08 * 0.01 : 0)
        },
        savings_interest_context: {
          weighted_avg_savings_rate_annual: 0.034348,
          weighted_avg_savings_rate_monthly: 0.002862,
          per_account_monthly_interest: {
            santander_amanda: { balance: 500, annual_rate: 0.01, monthly_interest: 0.4167 },
            barclays_amanda: { balance: 400, annual_rate: 0.02, monthly_interest: 0.6667 },
            monzo_amanda: { balance: 400, annual_rate: 0.04, monthly_interest: 1.3333 },
            marcus_amanda: { balance: 1000, annual_rate: 0.05, monthly_interest: 4.1667 }
          },
          remaining_monthly_interest_after_txn: 6.0834
        },
        updated_balances: null,
        virtual_card: {
          id: "v_hub_amanda",
          name: "OptiFin Virtual Hub",
          is_active: true,
          logic: "minimize_interest_loss"
        },
        llm_explanation: "No technical explanation available.",
        user_friendly_summary: `We used your ${isInternational ? "*Revolut Premium*" : "*Amex Platinum*"} for the bulk of this purchase because it delivers the highest net benefit—about *£${((amountNum * 0.45 * 0.01) + (amountNum * 0.36 * 0.015)).toFixed(2)}* in reward value—so you get the most “cash‑back‑like” payoff.\n\nThe other options didn’t stack up: *Chase Freedom* would have saved only ~£${(amountNum * 0.36 * 0.015).toFixed(2)}, *Santander Current* and *Barclays Everyday* would actually lose ~£${((amountNum * 0.075) * (0.01 / 365) * 30).toFixed(2)} each due to interest opportunity costs, and *Revolut Premium* offers ${isInternational ? `a *£${(amountNum * 0.08 * 0.01).toFixed(2)}* FX savings` : "no benefit at all"}, so they were passed over or used as secondary splits.`
      });

      setIsOptimizing(false);
    }, 1200);
  };

  const loadDemoScenario = (scenario: typeof demoScenarios[0]) => {
    setAmount(scenario.amount);
    setCurrency(scenario.currency);
    setCategory(scenario.category);
    setIsInternational(scenario.international);

    // Auto-run after setting values
    setTimeout(() => {
      runOptimization();
    }, 100);
  };

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy pb-24 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-optivault-navy/95 backdrop-blur-sm px-6 py-6 border-b border-optivault">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Payment Simulator</h1>
          <p className="text-sm text-secondary mt-1">See how we optimize your transaction in real time</p>
        </div>
      </div>

      {/* Demo Scenarios */}
      {demoMode && (
        <div className="px-6 py-4 bg-surface-alt border-b border-optivault">
          <p className="text-xs text-secondary mb-2">Quick Scenarios:</p>
          <div className="flex gap-2 overflow-x-auto">
            {demoScenarios.map((scenario, idx) => (
              <button
                key={idx}
                onClick={() => loadDemoScenario(scenario)}
                className="px-4 py-2 bg-surface border border-optivault rounded-lg text-xs text-primary whitespace-nowrap hover:bg-elevated transition-colors"
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        {/* Input Panel */}
        <div className="bg-surface rounded-2xl p-6 border border-optivault shadow-sm">
          <h2 className="text-sm font-semibold text-primary mb-4">Transaction Details</h2>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="text-xs text-secondary mb-2 block">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-secondary">£</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-optivault rounded-lg text-xl font-semibold text-primary placeholder:text-muted focus:outline-none focus:border-optivault-emerald [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Merchant Category */}
          <div className="mb-4">
            <label className="text-xs text-secondary mb-2 block">Merchant Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-surface-alt border border-optivault rounded-lg text-base text-primary focus:outline-none focus:border-optivault-emerald appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* International Toggle */}
          <div className="flex items-center justify-between mb-6">
            <label className="text-sm text-primary">International Transaction</label>
            <button
              onClick={() => setIsInternational(!isInternational)}
              className={`w-11 h-6 rounded-full transition-colors relative ${isInternational ? 'bg-[#0080FF]' : 'bg-[#CBD5E1]'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isInternational ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* CTA Button */}
          <button
            onClick={runOptimization}
            disabled={!amount || isOptimizing}
            className="w-full py-4 bg-[#0080FF] text-white rounded-xl font-semibold text-base hover:bg-[#0066CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Run Optimization
              </>
            )}
          </button>
        </div>

        {/* Optimization Result */}
        {result && (
          <div className="space-y-4 animate-fadeIn">
            {/* Allocation Visualization */}
            <div>
              <p className="text-xs text-secondary mb-2 px-1">Payment Allocation</p>
              <div className="bg-surface rounded-2xl p-5 border border-optivault shadow-sm">
                <div className="w-full h-10 bg-surface-alt rounded-lg overflow-hidden flex mb-3">
                  {result.allocation.map((alloc, idx) => {
                    const percentage = (alloc.amount_gbp / result.amount_gbp) * 100;
                    return (
                      <div
                        key={idx}
                        className={`h-full flex items-center justify-center text-white text-[10px] font-medium border-l border-optivault-navy/30 first:border-0`}
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: idx === 0 ? '#10B981' : idx === 1 ? '#0080FF' : idx === 2 ? '#EAB308' : idx === 3 ? '#A78BFA' : '#64748B'
                        }}
                      >
                        {percentage > 10 ? `${percentage.toFixed(0)}%` : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {result.allocation.map((alloc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-optivault last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: idx === 0 ? '#10B981' : idx === 1 ? '#0080FF' : idx === 2 ? '#EAB308' : idx === 3 ? '#A78BFA' : '#64748B' }} />
                        <div>
                          <p className="text-primary font-semibold">{alloc.card_name}</p>
                          <p className="text-[10px] text-secondary">{alloc.tier_label} {alloc.card_badge ? `· ${alloc.card_badge}` : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-mono">£{alloc.amount_gbp.toFixed(2)}</p>
                        <p className={`text-[10px] ${alloc.net_benefit > 0 ? 'text-optivault-emerald' : alloc.net_benefit < 0 ? 'text-status-red' : 'text-muted'}`}>
                          {alloc.net_benefit > 0 ? '+' : ''}{alloc.net_benefit !== 0 ? `£${alloc.net_benefit.toFixed(2)} net` : 'Neutral'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Impact */}
            <div className="bg-surface rounded-2xl p-5 border-2 border-optivault-emerald/30 shadow-sm">
              <h3 className="text-sm font-semibold text-primary mb-4">Expected Savings</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Interest Opportunity Lost</span>
                  <span className="text-sm font-semibold text-status-red">-£{Math.abs(result.eom_impact.total_interest_opportunity_lost).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">FX Costs</span>
                  <span className="text-sm font-semibold text-primary">£{result.eom_impact.total_fx_costs.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Cashback & Points Value</span>
                  <span className="text-sm font-semibold text-optivault-emerald">£{result.eom_impact.total_cashback_earned.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-optivault flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Total Net Benefit</span>
                <span className="text-2xl font-bold text-optivault-emerald">
                  {result.eom_impact.net_eom_benefit > 0 ? '+' : ''}£{result.eom_impact.net_eom_benefit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* AI Decision Explainability */}
            <div className="bg-surface rounded-2xl border border-optivault shadow-sm overflow-hidden">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-alt transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-optivault-emerald" />
                  <span className="text-sm font-semibold text-primary">OptiVault AI Decision</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
              </button>

              {showExplanation && (
                <div className="px-5 pb-5 border-t border-optivault animate-slideDown pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-primary">{result.ui_hints.headline}</h3>
                      <p className="text-xs text-secondary mt-0.5">{result.decision_label}</p>
                    </div>
                    <div className="px-3 py-1 bg-optivault-emerald/10 rounded-full">
                      <span className="text-xs font-semibold text-optivault-emerald">{result.ui_hints.earn_label}</span>
                    </div>
                  </div>

                  <div className="text-sm text-secondary leading-relaxed bg-surface-alt p-3 rounded-lg border border-optivault mb-4">
                    {result.user_friendly_summary.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*(.*?)\*/g, '<span class="text-white font-semibold">$1</span>') }} />
                    ))}
                  </div>

                  {result.ui_hints.savings_nudge && (
                    <div className="flex items-center gap-2 bg-status-blue-dim p-3 rounded-lg border border-status-blue/30 mt-2">
                      <Info className="w-4 h-4 text-status-blue flex-shrink-0" />
                      <p className="text-xs text-status-blue">{result.ui_hints.savings_nudge}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="simulator" />
    </div>
  );
}