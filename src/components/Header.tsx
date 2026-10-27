/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Download, Copy, Check, Radar, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onDownloadCsv: () => void;
  onCopyAll: () => void;
  onReset: () => void;
  hasArtifacts: boolean;
  copiedAll: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onDownloadCsv,
  onCopyAll,
  onReset,
  hasArtifacts,
  copiedAll,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
            <Radar className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                OSINT Recon & Metadata Analyzer
              </h1>
              <span className="hidden md:inline-flex items-center rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-mono font-medium text-cyan-400">
                v2.6 SEC-OPS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Cybersecurity Intelligence Extraction & Artifact Deduplication Engine
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {hasArtifacts && (
            <>
              <button
                type="button"
                onClick={onCopyAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                aria-label="Copy All Artifacts"
                title="Copy all extracted artifacts to clipboard"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied All</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Copy All</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onDownloadCsv}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-3 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm transition-all cursor-pointer"
                aria-label="Download CSV Report"
                title="Download categorized spreadsheet report"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>Download CSV Report</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition cursor-pointer"
            title="Reset All"
            aria-label="Reset All"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
