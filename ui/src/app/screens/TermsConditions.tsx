import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { Check, FileText, Building2, CreditCard, Zap, Lock } from "lucide-react";

interface ConsentCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  subtitle?: string;
  linkText?: string;
  checked: boolean;
  onToggle: () => void;
}

function ConsentCard({ icon, title, description, subtitle, linkText, checked, onToggle }: ConsentCardProps) {
  return (
    <div className="bg-surface border border-optivault rounded-2xl p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-primary">{title}</h3>
          <p className="mt-2 text-[13px] text-secondary leading-relaxed">{description}</p>
          {subtitle && (
            <p className="mt-2 text-[11px] text-muted">{subtitle}</p>
          )}
          {linkText && (
            <button className="mt-2 text-xs text-optivault-emerald font-semibold hover:underline">
              {linkText}
            </button>
          )}
        </div>

        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-optivault-emerald border-optivault-emerald' : 'border-optivault'
            }`}
        >
          {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}

export default function TermsConditions() {
  const [consents, setConsents] = useState({
    terms: false,
    openBanking: false,
    paymentCard: false,
    optimisation: false
  });

  const allChecked = Object.values(consents).every(Boolean);

  return (
    <div className="min-h-screen bg-optivault-navy">
      <div className="mobile-container px-4 sm:px-6 py-6 sm:py-8 pb-32">
        <ProgressBar current={1} total={6} />

        <h1 className="text-xl sm:text-2xl font-bold text-primary mt-6">Before we begin</h1>
        <p className="mt-2 text-sm text-secondary">Review and accept the following to use OptiVault</p>

        <div className="mt-8 space-y-4">
          <ConsentCard
            icon={<FileText className="w-5 h-5 text-optivault-emerald" />}
            title="Terms of Service & Privacy Policy"
            description="I agree to OptiVault's Terms of Service and Privacy Policy"
            linkText="Read full terms →"
            checked={consents.terms}
            onToggle={() => setConsents({ ...consents, terms: !consents.terms })}
          />

          <ConsentCard
            icon={<Building2 className="w-5 h-5 text-optivault-cyan" />}
            title="Open Banking & Variable Recurring Payments"
            description="I authorise OptiVault to connect to my UK bank accounts via Open Banking to view balances and transactions, and to initiate transfers between my accounts using Variable Recurring Payments (VRPs). I will set my own limits for each account — OptiVault cannot exceed them."
            subtitle="FCA regulated · TrueLayer provider · Revoke anytime"
            checked={consents.openBanking}
            onToggle={() => setConsents({ ...consents, openBanking: !consents.openBanking })}
          />

          <ConsentCard
            icon={<CreditCard className="w-5 h-5 text-[#A78BFA]" />}
            title="Payment Card Linking"
            description="I authorise OptiVault to charge my linked credit and debit cards as purchase transactions via our regulated EMI partner, in order to fund payments from the optimal source."
            subtitle="Same model as Curve · No cash advance charges"
            checked={consents.paymentCard}
            onToggle={() => setConsents({ ...consents, paymentCard: !consents.paymentCard })}
          />

          <ConsentCard
            icon={<Zap className="w-5 h-5 text-optivault-amber" />}
            title="Automatic Payment Optimisation"
            description="I authorise OptiVault to automatically route my payments to the most cost-effective funding source based on my preferences and limits. High-fee transactions will always require my approval."
            subtitle="You set the rules · Full control · Override anytime"
            checked={consents.optimisation}
            onToggle={() => setConsents({ ...consents, optimisation: !consents.optimisation })}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/80 backdrop-blur-md border-t border-optivault px-4 sm:px-6 py-4 z-50">
        <div className="mobile-container">
          <Button
            to="/onboarding/banks"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!allChecked}
            className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0"
          >
            Continue
          </Button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted">
            <Lock className="w-3 h-3" />
            <span>Bank-level 256-bit encryption · FCA regulated</span>
          </div>
        </div>
      </div>
    </div>
  );
}