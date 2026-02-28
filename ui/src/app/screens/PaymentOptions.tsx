import { useState } from "react";
import { ArrowLeft, Check, Info, Plane, Zap, AlertTriangle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";

export default function PaymentOptions() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>("b");
  const [showEngineDetails, setShowEngineDetails] = useState(false);

  // Define the PaymentOption type inline since it's missing
  type PaymentOption = {
    id: string;
    name: string;
    tags: { label: string; icon?: any; color: string }[];
    allocations: { source: string; amount: string; fee: string; color: string; note?: string }[];
    total: string;
    totalFees: string;
    warning?: string;
    warningIcon?: any;
    note?: string;
    recommended?: boolean;
  };

  const transaction = {
    icon: Plane,
    merchant: "British Airways",
    amount: "£2,840.00",
    category: "Travel"
  };

  const options: PaymentOption[] = [
    {
      id: "a",
      name: "Use primary account",
      tags: [
        { label: "Instant", icon: Zap, color: "bg-optivault-emerald-dim text-optivault-emerald" },
        { label: "£0 fees", color: "bg-optivault-emerald-dim text-optivault-emerald" }
      ],
      allocations: [
        { source: "Santander", amount: "£2,840.00", fee: "£0", color: "#EC0000" }
      ],
      total: "£2,840.00",
      totalFees: "£0 total fees",
      warning: "Leaves £980 in Santander. You have £229 in DDs in the next 28 hours. Remaining: £751.",
      warningIcon: AlertTriangle,
      note: "No cashback earned"
    },
    {
      id: "b",
      name: "Earn cashback",
      tags: [
        { label: "+£28.40 cashback", color: "bg-purple-500/10 text-[#A78BFA]" },
        { label: "Instant", icon: Zap, color: "bg-optivault-emerald-dim text-optivault-emerald" }
      ],
      allocations: [
        { source: "Amex Gold", amount: "£2,840.00", fee: "£0", color: "#006FCF", note: "1% travel cashback" }
      ],
      total: "£2,840.00",
      totalFees: "£0 fees · +£28.40 earned",
      note: "Pay Amex statement from Santander by 15 Mar. Credit utilisation: 30% → 65.5% (under your 90% limit ✓). Cost per pound: -£0.01 (cashback benefit). Best option by £28.40.",
      recommended: true
    },
    {
      id: "c",
      name: "Use SBI India account",
      tags: [
        { label: "1-2 hrs", color: "bg-status-amber-dim text-optivault-amber" },
        { label: "£8.14 fees", color: "bg-status-amber-dim text-optivault-amber" }
      ],
      allocations: [
        { source: "Santander", amount: "£1,500.00", fee: "£0", color: "#EC0000" },
        { source: "SBI India→GBP", amount: "£1,340.80", fee: "£8.14", color: "#F4A460", note: "2.9% FX + fees" }
      ],
      total: "£2,840.80",
      totalFees: "£8.14 total fees",
      note: "Keeps £2,320 in Santander for upcoming bills. International transfer takes 1-2 hours."
    }
  ];

  const selectedOptionData = options.find(o => o.id === selectedOption);

  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-32">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 p-2 hover:bg-surface rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 text-secondary" />
      </button>

      <h1 className="text-[22px] font-bold text-white mb-2">Choose Payment Strategy</h1>
      <div className="flex items-center gap-2 mb-1">
        <Plane className="w-5 h-5 text-secondary" />
        <p className="text-sm text-white">{transaction.merchant}</p>
        <span className="text-sm text-muted">·</span>
        <p className="text-sm font-mono text-white">{transaction.amount}</p>
      </div>
      <p className="text-xs text-muted mb-6">Engine reached Step 5 — multiple viable strategies</p>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`w-full text-left bg-surface rounded-xl p-4 transition-all ${selectedOption === option.id
              ? 'border-2 border-optivault-emerald'
              : 'border-2 border-optivault hover:border-optivault-light'
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-white">{option.name}</h3>
                  {option.recommended && (
                    <span className="px-2 py-0.5 rounded-md bg-optivault-emerald-dim text-optivault-emerald text-[10px] font-semibold">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.tags.map((tag, idx) => {
                    const TagIcon = tag.icon;
                    return (
                      <span key={idx} className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 ${tag.color}`}>
                        {TagIcon && <TagIcon className="w-3 h-3" />}
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 transition-all ${selectedOption === option.id
                ? 'bg-optivault-emerald border-optivault-emerald'
                : 'border-optivault'
                }`}>
                {selectedOption === option.id && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
            </div>

            {/* Allocations */}
            <div className="space-y-2 mb-3">
              {option.allocations.map((alloc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: alloc.color }} />
                  <span className="text-white flex-1">
                    {alloc.source}: {alloc.amount} · {alloc.fee} fee
                    {alloc.note && <span className="text-muted ml-1">({alloc.note})</span>}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-optivault">
              <p className="text-sm text-white font-mono mb-2">Total: {option.total} · {option.totalFees}</p>
              {option.warning && (
                <p className="text-xs text-optivault-amber mb-2">
                  {option.warningIcon && <option.warningIcon className="w-4 h-4 mr-1" />}
                  {option.warning}
                </p>
              )}
              {option.note && (
                <p className="text-xs text-secondary">{option.note}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Engine Details */}
      <div className="mb-6 bg-surface border border-optivault rounded-xl overflow-hidden">
        <button
          onClick={() => setShowEngineDetails(!showEngineDetails)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold text-white">How the engine calculated these options</h3>
          <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${showEngineDetails ? 'rotate-180' : ''}`} />
        </button>

        {showEngineDetails && (
          <div className="px-4 pb-4 border-t border-optivault pt-4 space-y-3">
            <div>
              <p className="text-xs text-secondary mb-2">Source costs:</p>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-xs text-white font-mono mb-1">Santander: £0/£</p>
                <p className="text-xs text-white font-mono mb-1">Amex: -£0.01/£ (cashback benefit)</p>
                <p className="text-xs text-white font-mono">SBI India: £0.029/£</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-secondary mb-2">Constraints applied:</p>
              <div className="bg-surface-alt rounded-lg p-3 space-y-1">
                <p className="text-xs text-white">• Santander effective balance = £3,820 - £229 DDs = £3,591 available</p>
                <p className="text-xs text-white">• Amex utilisation cap at 90% (£7,200 max)</p>
                <p className="text-xs text-white">• Monzo VRP limit: £500/txn</p>
                <p className="text-xs text-white">• Saver VRP monthly remaining: £2,220</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-secondary mb-2">Recommendation:</p>
              <p className="text-xs text-optivault-emerald font-semibold">Option B (lowest net cost at -£28.40)</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/80 backdrop-blur-md border-t border-optivault px-6 py-4 z-50">
        <div className="mobile-container">
          {selectedOptionData && (
            <div className="mb-3 text-center">
              <p className="text-xs text-secondary mb-1">Selected strategy:</p>
              <p className="text-sm font-semibold text-white">{selectedOptionData.name} · {selectedOptionData.total}</p>
            </div>
          )}

          <Button
            onClick={() => navigate('/home')}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedOption}
            className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0"
          >
            Confirm: Pay {transaction.amount} →
          </Button>
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-2 text-sm text-muted hover:text-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}