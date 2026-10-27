/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

interface ToastProps {
  message: string;
  subMessage?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, subMessage }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-white">{message}</p>
        {subMessage && <p className="text-[11px] text-slate-400">{subMessage}</p>}
      </div>
    </div>
  );
};
