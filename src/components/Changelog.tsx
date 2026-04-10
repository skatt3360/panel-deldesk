import React, { useState } from 'react';
import { ScrollText, X, Sparkles, Wrench, TrendingUp } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';

const TYPE_CONFIG = {
  feat:    { label: 'Nowość',    color: 'bg-cdv-gold/15 text-cdv-gold border border-cdv-gold/25',      icon: <Sparkles size={10} /> },
  fix:     { label: 'Naprawa',   color: 'bg-red-500/15 text-red-300 border border-red-400/25',          icon: <Wrench size={10} /> },
  improve: { label: 'Poprawa',   color: 'bg-blue-500/15 text-blue-300 border border-blue-400/25',       icon: <TrendingUp size={10} /> },
};

const Changelog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const latest = CHANGELOG[0];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-white/35 hover:text-white/70 border border-white/8 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
        title="Lista zmian"
      >
        <ScrollText size={12} />
        <span className="hidden lg:inline">Lista zmian</span>
        <span className="px-1 py-0.5 rounded-md bg-cdv-gold/20 text-cdv-gold text-[9px] font-bold">
          v{latest.version}
        </span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0D0A1A] border border-white/12 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cdv-gold/15 border border-cdv-gold/25">
                  <ScrollText size={15} className="text-cdv-gold" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-white">Lista zmian</h2>
                  <p className="text-[11px] text-white/40">CDV IT Helpdesk — Patch Notes</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0">
              {CHANGELOG.map((entry, i) => (
                <div key={entry.version} className="relative">
                  {/* Version badge */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                      i === 0
                        ? 'bg-cdv-gold/20 text-cdv-gold border-cdv-gold/30'
                        : 'bg-white/5 text-white/50 border-white/10'
                    }`}>
                      v{entry.version}
                      {i === 0 && <span className="text-[9px]">NAJNOWSZA</span>}
                    </div>
                    <span className="text-[11px] text-white/30 font-mono">{entry.date}</span>
                  </div>

                  {/* Changes list */}
                  <ul className="space-y-1.5">
                    {entry.changes.map((change, j) => {
                      const cfg = TYPE_CONFIG[change.type];
                      return (
                        <li key={j} className="flex items-start gap-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold flex-shrink-0 mt-0.5 ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                          <span className="text-[13px] text-white/70 leading-snug">{change.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {i < CHANGELOG.length - 1 && (
                    <div className="mt-5 border-b border-white/[0.06]" />
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02]">
              <p className="text-[11px] text-white/25 text-center">Collegium Da Vinci IT Helpdesk — zmiany są wdrażane automatycznie</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Changelog;
