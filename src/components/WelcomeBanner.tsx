/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, X, Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  onDismiss: () => void;
  onLoadSample: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss, onLoadSample }) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              Welcome to the OSINT Recon Dashboard. Paste any raw text, log, or metadata dump below or click &apos;Load Sample Data&apos; to automatically extract IPs, emails, file assets, and domains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={onLoadSample}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer shadow-sm hover:shadow-cyan-500/10"
            aria-label="Load Sample Data"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Load Sample Data
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
