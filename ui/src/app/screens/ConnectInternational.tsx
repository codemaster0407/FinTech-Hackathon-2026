import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { Check, ChevronRight, Globe, CheckCircle } from "lucide-react";

export default function ConnectInternational() {
  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-32">
      <ProgressBar current={5} total={6} />

      <h1 className="text-2xl font-bold text-white">Connect International Accounts</h1>
      <p className="mt-2 text-sm text-secondary">Link accounts from home to include them in payment optimisation.</p>

      {/* API Access Countries */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-optivault-emerald" />
          <h2 className="text-sm font-semibold text-white">Direct API Connection</h2>
        </div>
        <p className="text-xs text-secondary mb-4">Regulated Open Banking frameworks — we connect directly to your bank.</p>

        <div className="space-y-2">
          {[
            { country: "India", framework: "Account Aggregator (Setu/Sahamati) · RBI regulated", connected: true },
            { country: "EU / EEA", framework: "PSD2 Open Banking", connected: false },
            { country: "Australia", framework: "Consumer Data Right", connected: false },
            { country: "Brazil", framework: "Open Finance Brasil", connected: false }
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${item.connected ? 'bg-surface border-optivault-emerald' : 'bg-surface border-optivault hover:border-optivault-light'
                }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-secondary" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{item.country}</h3>
                    {item.connected && <Check className="w-4 h-4 text-optivault-emerald" />}
                  </div>
                  <p className="text-xs text-secondary">{item.framework}</p>
                </div>
              </div>
              {!item.connected && <ChevronRight className="w-4 h-4 text-muted" />}
            </button>
          ))}
        </div>

        {/* Connected India accounts */}
        <div className="mt-4 bg-surface border border-optivault rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-semibold text-white">Connected Indian Accounts</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-secondary flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-optivault-emerald" />
                SBI Savings
              </span>
              <span className="text-white font-mono">₹1,85,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-optivault-emerald" />
                HDFC Current
              </span>
              <span className="text-white font-mono">₹92,000</span>
            </div>
            <p className="text-[10px] text-muted mt-2">Account Aggregator · RBI regulated · Read-only · Last synced 2m ago</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-optivault-navy/80 backdrop-blur-md border-t border-optivault px-4 sm:px-6 py-4 z-50">
        <div className="mobile-container">
          <Button to="/onboarding/preferences" variant="primary" size="lg" fullWidth className="bg-[#0080FF] hover:bg-[#0066CC] !text-white border-0">
            Continue
          </Button>
          <button className="w-full mt-2 text-sm text-muted hover:text-secondary transition-colors">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}