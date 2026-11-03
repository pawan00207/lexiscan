import React, { useState } from 'react';
import { HistoryItem } from '../../server';
import { Token } from '../lib/lexer';
import { History, Trash2, ArrowUpRight, GitCompare, Calendar, Terminal, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onLoadCode: (code: string, language: string) => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onLoadCode,
  onDeleteHistoryItem
}) => {
  const [selectedForCompareA, setSelectedForCompareA] = useState<string | null>(null);
  const [selectedForCompareB, setSelectedForCompareB] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const itemA = history.find((h) => h.id === selectedForCompareA);
  const itemB = history.find((h) => h.id === selectedForCompareB);

  const handleStartCompare = () => {
    if (selectedForCompareA && selectedForCompareB) {
      setShowCompareModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Compare Control */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>Lexical Analysis History & Comparison</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review previous compilation runs, reload past source code, and compare token streams side-by-side.
            </p>
          </div>

          {/* Compare Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!selectedForCompareA || !selectedForCompareB || selectedForCompareA === selectedForCompareB}
              onClick={handleStartCompare}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare 2 Runs</span>
            </button>
          </div>
        </div>

        {/* Selection Hint */}
        <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>
            {history.length} stored {history.length === 1 ? 'analysis' : 'analyses'} in history
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Select checkboxes below to compare two separate analysis runs.
          </span>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
            No analysis history recorded yet. Analyze some code in the Analyzer tab to begin tracking history!
          </div>
        ) : (
          history.map((item) => {
            const isCheckedA = selectedForCompareA === item.id;
            const isCheckedB = selectedForCompareB === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-4 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCheckedA || isCheckedB
                    ? 'border-blue-300 ring-1 ring-blue-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Left: Comparison Checkbox + Metadata */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="pt-0.5 flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCheckedA) setSelectedForCompareA(null);
                        else if (!selectedForCompareA) setSelectedForCompareA(item.id);
                        else if (isCheckedB) setSelectedForCompareB(null);
                        else setSelectedForCompareB(item.id);
                      }}
                      className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] font-bold ${
                        isCheckedA
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isCheckedB
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400 text-transparent'
                      }`}
                      title="Select for side-by-side comparison"
                    >
                      {isCheckedA ? 'A' : isCheckedB ? 'B' : '✓'}
                    </button>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs font-bold uppercase">
                        {item.language}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </span>
                    </div>

                    {/* Code Snippet Preview */}
                    <div className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 truncate max-w-2xl">
                      {item.codeSnippet}
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-sans">
                      <span>Tokens: <strong className="text-slate-800 tabular-nums">{item.tokensCount}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Errors:{' '}
                        <strong className={`tabular-nums ${item.errorsCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {item.errorsCount}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Execution: <strong className="text-slate-800 tabular-nums">{item.executionTimeMs} ms</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => onLoadCode(item.fullCode, item.language)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Load code into active Editor"
                  >
                    <span>Reopen Code</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete history entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comparison Modal */}
      {showCompareModal && itemA && itemB && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Token Stream Comparison (Run A vs Run B)
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Split Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 flex-1 overflow-auto">
              {/* Run A */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-blue-700 text-xs">Run A ({itemA.language.toUpperCase()})</span>
                  <span className="text-[11px] text-slate-500">{new Date(itemA.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Total Tokens: <strong className="text-slate-900">{itemA.tokensCount}</strong> | Errors: <strong className="text-slate-900">{itemA.errorsCount}</strong>
                </div>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
                  {itemA.tokens.map((t) => (
                    <div key={t.tokenId} className="p-1.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                      <span className="font-semibold text-slate-800">{t.lexeme}</span>
                      <span className="text-[11px] text-slate-500 font-sans">{t.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Run B */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-indigo-700 text-xs">Run B ({itemB.language.toUpperCase()})</span>
                  <span className="text-[11px] text-slate-500">{new Date(itemB.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Total Tokens: <strong className="text-slate-900">{itemB.tokensCount}</strong> | Errors: <strong className="text-slate-900">{itemB.errorsCount}</strong>
                </div>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
                  {itemB.tokens.map((t) => (
                    <div key={t.tokenId} className="p-1.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                      <span className="font-semibold text-slate-800">{t.lexeme}</span>
                      <span className="text-[11px] text-slate-500 font-sans">{t.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
