import React, { useState } from 'react';
import { BadgePercent, DollarSign, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HostCalculatorProps {
  onJoinClick?: () => void;
}

export const HostCalculator: React.FC<HostCalculatorProps> = ({ onJoinClick }) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(12000);

  const traditionalFee = Math.round(monthlyRevenue * 0.18);
  const findStayFee = Math.round(monthlyRevenue * 0.06);
  const monthlySavings = traditionalFee - findStayFee;
  const annualSavings = monthlySavings * 12;
  const hostTakeHome = monthlyRevenue - findStayFee;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 mb-3">
            <BadgePercent className="w-3.5 h-3.5" /> Fair Host Monetization
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Calculate Your Host Earnings &amp; Savings
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            See how much more you earn with FindStay’s 6% fair commission compared to 18% middleman agents and international booking engines.
          </p>
        </div>

        {/* Slider Input */}
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <label className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
              Estimated Monthly Bookings Volume
            </label>
            <div className="text-2xl sm:text-3xl font-black text-teal-400">
              GH₵ {monthlyRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
          </div>

          <input
            type="range"
            min="2000"
            max="60000"
            step="1000"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>GH₵ 2,000</span>
            <span>GH₵ 30,000</span>
            <span>GH₵ 60,000+</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Traditional Agents */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-rose-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Traditional Middlemen &amp; OTAs
              </span>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                ~18% Fee
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              - GH₵ {traditionalFee.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              You lose GH₵ {traditionalFee.toLocaleString()} every month to middleman viewing charges and commissions.
            </p>
          </div>

          {/* FindStay Model */}
          <div className="bg-teal-950/40 p-5 rounded-2xl border border-teal-500/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                With FindStay Direct PMS
              </span>
              <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded">
                Only 6%
              </span>
            </div>
            <div className="text-2xl font-black text-teal-400">
              - GH₵ {findStayFee.toLocaleString()}
            </div>
            <p className="text-xs text-teal-200/80 mt-1">
              You take home <strong>GH₵ {hostTakeHome.toLocaleString()}</strong> net via direct Mobile Money disbursements.
            </p>
          </div>
        </div>

        {/* Savings Announcement */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-slate-950/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Your Annual Profit Retained
            </span>
            <div className="text-3xl sm:text-4xl font-black">
              + GH₵ {annualSavings.toLocaleString()}
            </div>
            <p className="text-xs font-semibold text-slate-900 mt-0.5">
              Extra annual earnings back into your property maintenance and expansion.
            </p>
          </div>

          {onJoinClick && (
            <button
              onClick={onJoinClick}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition shrink-0"
            >
              <span>Onboard Your Property</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
