import React from "react";
import { virtualCard } from "../data/mockData";

export default function VirtualCardDisplay() {
  return (
    <div className="card-gradient rounded-2xl aspect-[1.586] p-5 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <p className="text-xs font-semibold text-white">OptiVault Hub</p>
          </div>
          <div className="w-10 h-6 bg-white/20 backdrop-blur-md rounded border border-white/20 flex items-center justify-center">
            <div className="text-[10px] font-bold text-white tracking-wider">NFC</div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] text-white/90 tracking-wide">{virtualCard.cardholderName}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-lg font-mono text-white tracking-[0.15em]">{virtualCard.cardNumber}</p>
            <div className="px-2 py-1 rounded bg-white/10 text-white text-sm font-bold">VISA</div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-2 right-2 text-[8px] text-white/60">Issued by {virtualCard.issuer}</div>
    </div>
  );
}
