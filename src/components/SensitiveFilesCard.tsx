/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileCode2, Copy, Check, ExternalLink, Database, KeyRound, FileSpreadsheet, FileText } from 'lucide-react';
import { SensitiveFile } from '../utils/parser';

interface SensitiveFilesCardProps {
  files: SensitiveFile[];
  onCopyList: (items: string[], label: string) => void;
}

export const SensitiveFilesCard: React.FC<SensitiveFilesCardProps> = ({ files, onCopyList }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Assets', count: files.length },
    {
      id: 'Database & Backups',
      label: 'DB & Backups',
      count: files.filter((f) => f.category === 'Database & Backups').length,
    },
    {
      id: 'Configuration & Secrets',
      label: 'Secrets & Configs',
      count: files.filter((f) => f.category === 'Configuration & Secrets').length,
    },
    {
      id: 'Spreadsheets & Data',
      label: 'Spreadsheets',
      count: files.filter((f) => f.category === 'Spreadsheets & Data').length,
    },
    {
      id: 'Documents',
      label: 'Docs & Briefs',
      count: files.filter((f) => f.category === 'Documents').length,
    },
  ].filter((c) => c.id === 'all' || c.count > 0);

  const filteredFiles = files.filter((f) => {
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    return true;
  });

  const handleCopy = () => {
    const list = filteredFiles.map((f) => f.fullMatch);
    onCopyList(list, 'Sensitive Files');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExtensionBadgeColor = (ext: string) => {
    switch (ext) {
      case '.sql':
      case '.bak':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case '.env':
      case '.config':
      case '.conf':
      case '.key':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case '.xlsx':
      case '.xls':
      case '.csv':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case '.pdf':
      case '.docx':
      case '.doc':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  const getCategoryIcon = (category: SensitiveFile['category']) => {
    switch (category) {
      case 'Database & Backups':
        return <Database className="h-3.5 w-3.5 text-rose-400" />;
      case 'Configuration & Secrets':
        return <KeyRound className="h-3.5 w-3.5 text-amber-400" />;
      case 'Spreadsheets & Data':
        return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />;
      case 'Documents':
      default:
        return <FileText className="h-3.5 w-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode2 className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Target Files & Metadata Assets</h3>
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-medium text-amber-300">
              {files.length}
            </span>
          </div>
        </div>

        {files.length > 0 && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            aria-label="Copy List of sensitive files"
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

      {/* Category Pills */}
      {files.length > 0 && categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/60 bg-slate-950/40 px-3.5 py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {/* Body List */}
      <div className="flex-1 p-3 overflow-y-auto max-h-80">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/60 text-slate-500 mb-2">
              <FileCode2 className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              No artifacts detected in this category
            </p>
            <span className="text-[11px] text-slate-600 mt-0.5">
              Looks for .pdf, .docx, .xlsx, .sql, .bak, .env, and .config dork targets.
            </span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No files match the selected filter.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file, idx) => (
              <div
                key={`${file.fullMatch}-${idx}`}
                className="group flex flex-col gap-1 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 transition hover:border-slate-700 hover:bg-slate-950"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{getCategoryIcon(file.category)}</span>
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate select-all">
                      {file.name}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.2 font-mono text-[10px] font-semibold ${getExtensionBadgeColor(
                        file.extension
                      )}`}
                    >
                      {file.extension}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onCopyList([file.fullMatch], file.name)}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition cursor-pointer"
                      title="Copy target URL/path"
                      aria-label={`Copy path for ${file.name}`}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate font-mono text-slate-500" title={file.fullMatch}>
                    {file.fullMatch}
                  </span>
                  <span className="shrink-0 text-slate-500 ml-2 font-mono text-[10px]">
                    {file.occurrences > 1 ? `${file.occurrences} matches` : '1 match'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
