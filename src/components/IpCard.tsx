/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Network, Copy, Check, Filter, Search } from 'lucide-react';
import { ExtractedIP } from '../utils/parser';

interface IpCardProps {
  ips: ExtractedIP[];
  onCopyList: (items: string[], label: string) => void;
}

export const IpCard: React.FC<IpCardProps> = ({ ips, onCopyList }) => {
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredIps = ips.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchTerm && !item.ip.toLowerCase().includes(searchTerm.toLowerCase()) && !item.classification.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCopy = () => {
    const list = filteredIps.map((i) => i.ip);
    onCopyList(list, 'IP Addresses');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const internalCount = ips.filter((i) => i.type === 'internal').length;
  const externalCount = ips.filter((i) => i.type === 'external').length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Network className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">IP Addresses</h3>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-medium text-emerald-300">
              {ips.length}
            </span>
          </div>
        </div>

        {ips.length > 0 && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy List of IP addresses"
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
      {ips.length > 0 && (
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
              All ({ips.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('internal')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                filterType === 'internal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Internal ({internalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('external')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                filterType === 'external'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              External ({externalCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IP..."
              className="w-28 sm:w-36 rounded-md border border-slate-800 bg-slate-900 pl-6 pr-2 py-0.5 text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Body List or Empty State */}
      <div className="flex-1 p-3 overflow-y-auto max-h-80">
        {ips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-500 mb-2">
              <Network className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              No artifacts detected in this category
            </p>
            <span className="text-[11px] text-slate-600 mt-0.5">
              Only strictly validated IPv4 addresses (0–255) will appear here.
            </span>
          </div>
        ) : filteredIps.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No IPs matching current filters.
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredIps.map((item) => (
              <div
                key={item.ip}
                className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5 transition hover:border-slate-700 hover:bg-slate-950"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-semibold text-slate-100 tracking-wide select-all">
                    {item.ip}
                  </span>
                  {item.type === 'internal' ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                      Internal Network
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">
                      External
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono" title="Occurrences in dump">
                    x{item.occurrences}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopyList([item.ip], item.ip)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
                    aria-label={`Copy ${item.ip}`}
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
