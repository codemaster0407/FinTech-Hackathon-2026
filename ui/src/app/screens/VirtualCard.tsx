import { Zap, Hand, Building2, Store } from "lucide-react";
import { BottomNav } from "./Home";

export default function VirtualCard() {


  return (
    <div className="mobile-container min-h-screen bg-optivault-navy px-6 py-8 overflow-y-auto pb-24">
      {/* Virtual Card */}
      <div className="mb-6">
        <div
          className="card-gradient rounded-2xl aspect-[1.586] p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)'
          }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/90 tracking-wide">OptiVault Virtual Card</span>
                <Zap className="w-3 h-3 text-white" fill="white" />
              </div>
              <svg className="h-6" viewBox="0 0 48 32" fill="white">
                <path d="M17.3 31.9L28.5 0.1h-4.8L12.5 31.9h4.8zM28.2 19.8c0 6.5-5.4 11.8-12 11.8H8.6l2.4-8.4h7.2c2.4 0 4.4-2 4.4-4.4s-2-4.4-4.4-4.4h-7.2l2.4-8.4h7.6c6.6 0 12 5.3 12 11.8 0 .4 0 .7-.1 1 0 .3-.1.7-.1 1z" />
              </svg>
            </div>

            <p className="text-[18px] tracking-[0.15em] font-mono text-white mb-6">4532 8891 2244 7891</p>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-white/90 tracking-wide mb-1">AMANDA</p>
                <p className="text-[10px] text-white/70">EXP 09/28</p>
              </div>
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
          </div>

          <div className="absolute bottom-2 right-2 text-[8px] text-white/60">
            Issued by Modulr · EMI Partner
          </div>
        </div>
      </div>



      {/* How Card Works */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">How Your Card Works</h3>
        <div className="bg-surface border border-optivault rounded-xl p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-optivault-emerald-dim flex items-center justify-center mb-2">
                <Hand className="w-5 h-5 text-optivault-emerald" />
              </div>
              <p className="text-xs text-white">You tap</p>
            </div>

            <div className="text-muted h-10 flex items-center">→</div>

            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-optivault-amber-dim flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-optivault-amber" />
              </div>
              <p className="text-xs text-white">Engine runs</p>
            </div>

            <div className="text-muted h-10 flex items-center">→</div>

            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-optivault-blue-dim flex items-center justify-center mb-2">
                <Building2 className="w-5 h-5 text-optivault-blue" />
              </div>
              <p className="text-xs text-white">Best source</p>
            </div>

            <div className="text-muted h-10 flex items-center">→</div>

            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-optivault-cyan-dim flex items-center justify-center mb-2">
                <Store className="w-5 h-5 text-optivault-cyan" />
              </div>
              <p className="text-xs text-white">Merchant paid</p>
            </div>
          </div>

          <p className="text-xs text-secondary text-center leading-relaxed">
            For simple payments: instant, silent, no interruption. For complex payments: you'll see options on your phone before the charge goes through.
          </p>
        </div>
      </div>

      {/* Card Activity */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Card Activity</h3>
        <div className="bg-surface border border-optivault rounded-xl p-4">
          <div className="mb-4">
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div className="bg-blue-500" style={{ width: '32%' }} />
              <div className="bg-[#F59E0B]" style={{ width: '28%' }} />
              <div className="bg-[#EF4444]" style={{ width: '15%' }} />
              <div className="bg-[#00D4AA]" style={{ width: '12%' }} />
              <div className="bg-surface-alt" style={{ width: '13%' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-secondary">Groceries 32%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
              <span className="text-secondary">Travel 28%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#EF4444]" />
              <span className="text-secondary">Dining 15%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#00D4AA]" />
              <span className="text-secondary">Shopping 12%</span>
            </div>
          </div>

          <p className="text-sm text-white font-mono">£2,847 <span className="text-secondary text-xs font-sans">this month</span></p>
        </div>
      </div>

      <BottomNav active="card" />
    </div >
  );
}