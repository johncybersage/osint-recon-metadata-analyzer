/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, ChevronDown, Terminal, FileText, Check } from 'lucide-react';
import { PRESET_SAMPLES, PRIMARY_SAMPLE_DUMP } from '../data/sampleDumps';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  onExtract: () => void;
  onClear: () => void;
  onLoadSample: (content: string) => void;
  hasExtracted: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  setInputText,
  onExtract,
  onClear,
  onLoadSample,
  hasExtracted,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('primary');
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [justLoadedSample, setJustLoadedSample] = useState<boolean>(false);

  const lineCount = inputText ? inputText.split('\n').length : 0;
  const charCount = inputText.length;

  const handleLoadSample = (content: string, presetId = 'primary') => {
    onLoadSample(content);
    setSelectedPresetId(presetId);
    setShowPresets(false);
    setJustLoadedSample(true);
    setTimeout(() => setJustLoadedSample(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onExtract();
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Top Header / Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Raw Intelligence Ingestion Buffer
          </span>
          <span className="hidden sm:inline-block rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400 border border-slate-700">
            {lineCount} lines · {charCount.toLocaleString()} chars
          </span>
        </div>

        {/* Preset Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition cursor-pointer"
            aria-expanded={showPresets}
            aria-label="Select sample preset"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Preset Samples</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showPresets && (
            <div className="absolute right-0 z-20 mt-1.5 w-72 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-md">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Choose Sample Dataset
              </div>
              {PRESET_SAMPLES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadSample(preset.content, preset.id)}
                  className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                    selectedPresetId === preset.id
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{preset.name}</span>
                    {selectedPresetId === preset.id && <Check className="h-3 w-3 text-cyan-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative p-3">
        <textarea
          id="raw-recon-dump-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste server access logs, FOCA metadata leaks, Google Dork links, firewall dumps, or raw OSINT notes here...&#10;&#10;Or click 'Load Sample Recon Dump' below to test with authentic mock reconnaissance data."
          rows={7}
          className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-3 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors leading-relaxed selection:bg-cyan-500/30"
          aria-label="Raw reconnaissance text dump input"
        />

        {/* Floating Quick Action Overlay if empty */}
        {!inputText && (
          <div className="pointer-events-none absolute inset-x-6 inset-y-8 flex flex-col items-center justify-center text-center opacity-60">
            <span className="text-xs text-slate-500">
              Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px] text-slate-300">Ctrl</kbd> + <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px] text-slate-300">Enter</kbd> to extract instantly
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-950/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample(PRIMARY_SAMPLE_DUMP, 'primary')}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors cursor-pointer"
            aria-label="Load Sample Recon Dump"
          >
            {justLoadedSample ? (
              <>
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sample Loaded!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Load Sample Recon Dump</span>
              </>
            )}
          </button>

          {inputText && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              aria-label="Clear raw input"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExtract}
            disabled={!inputText.trim()}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
              inputText.trim()
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
            }`}
            aria-label="Extract Artifacts"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Extract Artifacts</span>
            {hasExtracted && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
