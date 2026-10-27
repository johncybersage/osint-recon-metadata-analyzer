/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Copy, Check, ChevronDown, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { DomainEmailGroup, ExtractedEmail } from '../utils/parser';

interface EmailCardProps {
  emailGroups: DomainEmailGroup[];
  allEmails: ExtractedEmail[];
  onCopyList: (items: string[], label: string) => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ emailGroups, allEmails, onCopyList }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of emailGroups) {
      init[g.domain] = true;
    }
    return init;
  });

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const handleCopy = () => {
    const list = allEmails.map((e) => e.email);
    onCopyList(list, 'Emails');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Mail className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Emails & Inferred Patterns</h3>
            <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono font-medium text-indigo-300">
              {allEmails.length}
            </span>
          </div>
        </div>

        {allEmails.length > 0 && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy List of emails"
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

      {/* Body */}
      <div className="flex-1 p-3 overflow-y-auto max-h-80">
        {allEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-500 mb-2">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              No artifacts detected in this category
            </p>
            <span className="text-[11px] text-slate-600 mt-0.5">
              Paste email records to infer company naming schemes.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {emailGroups.map((group) => {
              const isExpanded = expandedDomains[group.domain] ?? true;
              return (
                <div
                  key={group.domain}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden"
                >
                  {/* Domain Header & Inferred Pattern */}
                  <div className="p-3 border-b border-slate-800/80 bg-slate-900/50">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDomain(group.domain)}
                        className="flex items-center gap-2 text-left cursor-pointer group"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
                        )}
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-mono text-xs font-semibold text-slate-200 group-hover:text-white">
                          {group.domain}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                          {group.emails.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCopyList(group.emails.map((e) => e.email), `@${group.domain}`)}
                        className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition cursor-pointer"
                        title={`Copy emails for @${group.domain}`}
                        aria-label={`Copy emails for @${group.domain}`}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Pattern Inference Box */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1.5 text-[11px]">
                      <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="text-slate-400">Inferred Convention:</span>
                      <code className="font-mono font-medium text-indigo-300 bg-indigo-900/50 px-1.5 py-0.5 rounded">
                        {group.inferredPattern}
                      </code>
                      <span className="ml-auto text-[10px] text-slate-500">
                        Confidence: <span className="text-indigo-300 font-medium">{group.confidence}</span>
                      </span>
                    </div>
                  </div>

                  {/* Email List for this Domain */}
                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-slate-950/30">
                      {group.emails.map((email) => (
                        <div
                          key={email.email}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-slate-900 hover:text-white transition group"
                        >
                          <span className="truncate select-all">{email.email}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {email.occurrences > 1 && (
                              <span className="text-[10px] text-slate-500 font-sans">
                                {email.occurrences}x
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onCopyList([email.email], email.email)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-white transition cursor-pointer"
                              aria-label={`Copy ${email.email}`}
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
