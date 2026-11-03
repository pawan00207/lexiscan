import React from 'react';
import { LexerStats } from '../lib/lexer';
import { Tag, Key, Binary, Hash, Sliders, MessageSquare, AlertTriangle, Zap } from 'lucide-react';

interface StatsOverviewProps {
  stats: LexerStats;
  language: string;
  activeFilter?: string;
  onFilterChange?: (filterCategory: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  language,
  activeFilter = 'ALL',
  onFilterChange
}) => {
  const cards = [
    { id: 'ALL', label: 'Total Tokens', value: stats.totalTokens, icon: Tag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'KEYWORD', label: 'Keywords', value: stats.keywordsCount, icon: Key, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'IDENTIFIER', label: 'Identifiers', value: stats.identifiersCount, icon: Hash, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: 'OPERATOR', label: 'Operators', value: stats.operatorsCount, icon: Binary, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'INTEGER_LITERAL', label: 'Constants', value: stats.constantsCount, icon: Sliders, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'SEPARATOR', label: 'Separators', value: stats.separatorsCount, icon: Tag, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: 'COMMENT', label: 'Comments', value: stats.commentsCount, icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    {
      id: 'ERRORS',
      label: 'Lexical Errors',
      value: stats.errorsCount,
      icon: AlertTriangle,
      color: stats.errorsCount > 0 ? 'text-red-600' : 'text-slate-400',
      bg: stats.errorsCount > 0 ? 'bg-red-50' : 'bg-slate-50'
    }
  ];

  // Calculate percentages for distribution bar
  const total = stats.totalTokens || 1;
  const kwPct = Math.round((stats.keywordsCount / total) * 100);
  const idPct = Math.round((stats.identifiersCount / total) * 100);
  const opPct = Math.round((stats.operatorsCount / total) * 100);
  const constPct = Math.round((stats.constantsCount / total) * 100);
  const sepPct = Math.round((stats.separatorsCount / total) * 100);
  const commPct = Math.round((stats.commentsCount / total) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Top row metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 uppercase tracking-wider">
            Tokenization Summary
          </span>
          <span aria-hidden="true">·</span>
          <span>Target: <strong className="text-slate-900">{language.toUpperCase()}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Lines: <strong className="text-slate-900 tabular-nums">{stats.linesCount}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Characters: <strong className="text-slate-900 tabular-nums">{stats.charactersCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Execution Time:</span>
          <span className="tabular-nums font-mono text-slate-900">{stats.executionTimeMs} ms</span>
        </div>
      </div>

      {/* Grid of interactive stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 my-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeFilter === card.id;

          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onFilterChange && onFilterChange(card.id)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300'
                  : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title={`Click to filter token table by ${card.label}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 truncate">{card.label}</span>
                <div className={`p-1 rounded ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <span className={`text-xl font-bold font-mono tabular-nums ${card.value > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                {card.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* Token Distribution Bar */}
      {stats.totalTokens > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Lexical Proportions (Click any legend chip to filter)</span>
            <span>{stats.totalTokens} tokens processed</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {kwPct > 0 && (
              <div
                style={{ width: `${kwPct}%` }}
                className="bg-indigo-500 hover:opacity-80 transition-all duration-300 cursor-pointer"
                onClick={() => onFilterChange && onFilterChange('KEYWORD')}
                title={`Keywords: ${stats.keywordsCount} (${kwPct}%)`}
              />
            )}
            {idPct > 0 && (
              <div
                style={{ width: `${idPct}%` }}
                className="bg-violet-500 hover:opacity-80 transition-all duration-300 cursor-pointer"
                onClick={() => onFilterChange && onFilterChange('IDENTIFIER')}
                title={`Identifiers: ${stats.identifiersCount} (${idPct}%)`}
              />
            )}
            {opPct > 0 && (
              <div
                style={{ width: `${opPct}%` }}
                className="bg-amber-500 hover:opacity-80 transition-all duration-300 cursor-pointer"
                onClick={() => onFilterChange && onFilterChange('OPERATOR')}
                title={`Operators: ${stats.operatorsCount} (${opPct}%)`}
              />
            )}
            {constPct > 0 && (
              <div
                style={{ width: `${constPct}%` }}
                className="bg-emerald-500 hover:opacity-80 transition-all duration-300 cursor-pointer"
                onClick={() => onFilterChange && onFilterChange('INTEGER_LITERAL')}
                title={`Constants: ${stats.constantsCount} (${constPct}%)`}
              />
            )}
            {sepPct > 0 && (
              <div
                style={{ width: `${sepPct}%` }}
                className="bg-slate-400 hover:opacity-80 transition-all duration-300 cursor-pointer"
                onClick={() => onFilterChange && onFilterChange('SEPARATOR')}
                title={`Separators: ${stats.separatorsCount} (${sepPct}%)`}
              />
            )}
            {commPct > 0 && (
              <div
                style={{ width: `${commPct}%` }}
                className="bg-cyan-500 hover:opacity-80 transition-all duration-300 cursor-pointer"
                onClick={() => onFilterChange && onFilterChange('COMMENT')}
                title={`Comments: ${stats.commentsCount} (${commPct}%)`}
              />
            )}
          </div>

          {/* Interactive Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
            <button
              onClick={() => onFilterChange && onFilterChange('KEYWORD')}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Keywords ({kwPct}%)</span>
            </button>
            <button
              onClick={() => onFilterChange && onFilterChange('IDENTIFIER')}
              className="flex items-center gap-1.5 hover:text-violet-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span>Identifiers ({idPct}%)</span>
            </button>
            <button
              onClick={() => onFilterChange && onFilterChange('OPERATOR')}
              className="flex items-center gap-1.5 hover:text-amber-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Operators ({opPct}%)</span>
            </button>
            <button
              onClick={() => onFilterChange && onFilterChange('INTEGER_LITERAL')}
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Constants ({constPct}%)</span>
            </button>
            <button
              onClick={() => onFilterChange && onFilterChange('SEPARATOR')}
              className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Separators ({sepPct}%)</span>
            </button>
            {commPct > 0 && (
              <button
                onClick={() => onFilterChange && onFilterChange('COMMENT')}
                className="flex items-center gap-1.5 hover:text-cyan-600 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Comments ({commPct}%)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
