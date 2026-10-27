/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Copy, Check, Search, ShieldCheck } from 'lucide-react';
import { ExtractedDomain } from '../utils/parser';

interface DomainsCardProps {
  domains: ExtractedDomain[];
  onCopyList: (items: string[], label: string) => void;
}

export const DomainsCard: React.FC<DomainsCardProps> = ({ domains, onCopyList }) => {
  const [filterType, setFilterType] = useState<'all' | 'root' | 'subdomain'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredDomains = domains.filter((d) => {
    if (filterType === 'root' && d.isSubdomain) return false;
    if (filterType === 'subdomain' && !d.isSubdomain) return false;
    if (searchTerm && !d.domain.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCopy = () => {
    const list = filteredDomains.map((d) => d.domain);
    onCopyList(list, 'Domains');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rootCount = domains.filter((d) => !d.isSubdomain).length;
  const subCount = domains.filter((d) => d.isSubdomain).length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Domains & Hostnames</h3>
            <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-xs font-mono font-medium text-cyan-300">
              {domains.length}
            </span>
          </div>
        </div>

        {domains.length > 0 && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy List of domains"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy List</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      {domains.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 bg-slate-950/40 px-3.5 py-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({domains.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('root')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                filterType === 'root'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              Root ({rootCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('subdomain')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                filterType === 'subdomain'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              Subdomains ({subCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter domain..."
              className="w-28 sm:w-36 rounded-md border border-slate-800 bg-slate-900 pl-6 pr-2 py-0.5 text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Body List */}
      <div className="flex-1 p-3 overflow-y-auto max-h-80">
        {domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-500 mb-2">
              <Globe className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              No artifacts detected in this category
            </p>
            <span className="text-[11px] text-slate-600 mt-0.5">
              Discovers root domains and infrastructure subdomains.
            </span>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No domains match the selected filter.
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredDomains.map((domain) => (
              <div
                key={domain.domain}
                className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5 transition hover:border-slate-700 hover:bg-slate-950"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-semibold text-slate-200 truncate select-all">
                    {domain.domain}
                  </span>
                  {domain.isSubdomain ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.2 text-[10px] font-medium text-indigo-400">
                      Subdomain
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 text-[10px] font-medium text-cyan-400">
                      Root Domain
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono" title="Occurrences in dump">
                    x{domain.occurrences}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopyList([domain.domain], domain.domain)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
                    aria-label={`Copy domain ${domain.domain}`}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
