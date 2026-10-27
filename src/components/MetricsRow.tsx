/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Network, Mail, FileCode2, Globe } from 'lucide-react';
import { ReconMetrics } from '../utils/parser';

interface MetricsRowProps {
  metrics: ReconMetrics;
  onFilterCategory?: (category: 'ips' | 'emails' | 'files' | 'domains') => void;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* KPI 1: IP Addresses */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Valid IPs</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Network className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.totalIps}
          </span>
          <span className="text-xs text-slate-400">extracted</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-300 border border-emerald-500/30">
            {metrics.internalIps} Internal
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-cyan-500/15 px-1.5 py-0.5 font-medium text-cyan-300 border border-cyan-500/30">
            {metrics.externalIps} External
          </span>
        </div>
      </div>

      {/* KPI 2: Corporate Emails */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Unique Emails</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Mail className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.uniqueEmails}
          </span>
          <span className="text-xs text-slate-400">addresses</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center rounded bg-indigo-500/15 px-1.5 py-0.5 font-medium text-indigo-300 border border-indigo-500/30">
            {metrics.domainGroupsCount} Domain {metrics.domainGroupsCount === 1 ? 'Group' : 'Groups'}
          </span>
          <span>with pattern inference</span>
        </div>
      </div>

      {/* KPI 3: Sensitive Files */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Sensitive Files Found</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.sensitiveFilesCount}
          </span>
          <span className="text-xs text-slate-400">dork assets</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-amber-400/90 font-medium">
            .sql, .env, .bak, .pdf, .xlsx
          </span>
        </div>
      </div>

      {/* KPI 4: Unique Domains */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Unique Domains</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.uniqueDomainsCount}
          </span>
          <span className="text-xs text-slate-400">hostnames</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center rounded bg-cyan-500/15 px-1.5 py-0.5 font-medium text-cyan-300 border border-cyan-500/30">
            {metrics.rootDomainsCount} Root {metrics.rootDomainsCount === 1 ? 'Domain' : 'Domains'}
          </span>
          <span>identified</span>
        </div>
      </div>
    </div>
  );
};
