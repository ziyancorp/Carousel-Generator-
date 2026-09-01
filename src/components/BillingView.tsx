import React, { useState } from 'react';
import { 
  CreditCard, Zap, CheckCircle2, Sparkles, ArrowRight, 
  History, ShieldCheck, RefreshCw
} from 'lucide-react';
import { PRICING_PLANS } from '../data';
import { UserProfile } from '../types';

interface BillingViewProps {
  user: UserProfile;
  onAddCredits: (amount: number) => void;
  onUpgradePlan: (tierName: 'free' | 'pro' | 'brand') => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  user,
  onAddCredits,
  onUpgradePlan
}) => {
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  const handleDemoTopUp = () => {
    onAddCredits(25);
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-900/30 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <CreditCard className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-cyan-400 uppercase">Payload Credits & Allocation</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            SYSTEM RESOURCE MANAGEMENT // RENDERING CREDIT BALANCES & TIER AUTHORIZATION
          </p>
        </div>
      </div>

      {/* CURRENT STATUS BANNER */}
      <div className="bg-[#0e1217] border border-cyan-500/40 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden font-mono shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-center md:justify-start">
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
            ACCOUNT TIER LEVEL: <span className="text-white ml-1.5 font-bold uppercase">{user.tier}</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start space-x-3 tracking-wider">
            <span>{user.credits} VIDEO CREDITS REMAINING</span>
          </div>
          <p className="text-xs text-slate-400">
            IMAGE & CAROUSEL GENERATION: <span className="text-emerald-400 font-bold">100% UNLIMITED / ZERO COST</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDemoTopUp}
            className="py-2.5 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/60 text-cyan-300 font-bold rounded text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>ALLOCATE +25 CREDITS (DEMO)</span>
          </button>
        </div>
      </div>

      {topUpSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          SUCCESSFULLY PROVISIONED +25 VIDEO CREDITS TO SYSTEM ACCOUNT
        </div>
      )}

      {/* PRICING PLANS */}
      <div className="space-y-4 font-mono">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">SUBSCRIPTION TIERS & RESOURCE CAPACITY</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING_PLANS.map(plan => {
            const isCurrent = (user.tier === 'free' && plan.id === 'plan_starter') ||
                              (user.tier === 'pro' && plan.id === 'plan_pro') ||
                              (user.tier === 'brand' && plan.id === 'plan_brand');

            return (
              <div
                key={plan.id}
                className={`rounded-lg p-5 border transition-all flex flex-col justify-between relative overflow-hidden ${
                  plan.isPopular
                    ? 'bg-[#0e1217] border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                    : 'bg-[#0e1217]/70 border-cyan-900/30 hover:border-slate-700'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-bold px-2.5 py-0.5 rounded-bl uppercase tracking-wider">
                    RECOMMENDED
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">{plan.name}</div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500">/ {plan.period}</span>
                  </div>
                  <div className="text-xs text-cyan-300 font-semibold bg-[#05070a] p-2 rounded border border-slate-800 text-center">
                    CAPACITY: {plan.credits} AI VIDEO CREDITS
                  </div>

                  <div className="space-y-2 pt-1">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800">
                  <button
                    disabled={isCurrent}
                    onClick={() => onUpgradePlan(plan.id === 'plan_starter' ? 'free' : plan.id === 'plan_pro' ? 'pro' : 'brand')}
                    className={`w-full py-2.5 rounded text-xs font-bold transition-all uppercase ${
                      isCurrent
                        ? 'bg-slate-800/80 text-slate-500 cursor-default border border-slate-700/50'
                        : plan.isPopular
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-[#05070a] hover:bg-[#0a0f18] text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isCurrent ? 'CURRENT AUTHORIZED TIER' : `UPGRADE TO ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
