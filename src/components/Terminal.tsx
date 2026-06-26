import React from 'react';
import { BuildError } from '../types';
import { AlertCircle, Terminal as TerminalIcon, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalProps {
  errors: BuildError[];
  onFix: () => void;
  isFixing: boolean;
}

export function Terminal({ errors, onFix, isFixing }: TerminalProps) {
  const hasCritical = errors.some(e => e.severity === 'error');

  return (
    <div className="flex flex-col h-full bg-[#0d1117] font-mono text-sm border-t border-slate-800">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <TerminalIcon size={14} />
          <span>TERMINAL</span>
        </div>
        <AnimatePresence>
          {hasCritical && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onFix}
              disabled={isFixing}
              className="flex items-center gap-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
              <Wrench size={12} />
              {isFixing ? 'FIXING...' : 'FIX ERRORS'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {errors.length > 0 ? (
          errors.map((error, i) => (
            <div key={i} className="flex gap-3 text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-300">[{error.severity.toUpperCase()}]</span>{' '}
                <span className="text-slate-300">{error.file}</span>
                {error.line && <span className="text-slate-500">:{error.line}</span>}
                <p className="mt-1 text-slate-400">{error.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic">No issues detected. Ready to build.</div>
        )}
        <div className="text-indigo-400 mt-2">$ _</div>
      </div>
    </div>
  );
}
