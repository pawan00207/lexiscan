import React, { useState, useMemo, useEffect } from 'react';
import { Token, TokenType } from '../lib/lexer';
import { Search, Download, Copy, Check, ArrowUpDown, ChevronUp, ChevronDown, Filter, GitMerge, Info, ExternalLink } from 'lucide-react';

interface TokenTableProps {
  tokens: Token[];
  onSelectToken?: (token: Token) => void;
  selectedTokenId?: number | null;
  activeFilter?: string;
  onFilterChange?: (cat: string) => void;
  onTraceInDfa?: (token: Token) => void;
}

type SortField = 'tokenId' | 'lexeme' | 'type' | 'line' | 'column';
type SortOrder = 'asc' | 'desc';

export const TokenTable: React.FC<TokenTableProps> = ({
  tokens,
  onSelectToken,
  selectedTokenId,
  activeFilter = 'ALL',
  onFilterChange,
  onTraceInDfa
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>(activeFilter);
  const [sortField, setSortField] = useState<SortField>('tokenId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copied, setCopied] = useState(false);
  const [inspectToken, setInspectToken] = useState<Token | null>(null);

  // Sync external filter from StatsOverview
  useEffect(() => {
    setSelectedType(activeFilter);
  }, [activeFilter]);

  const handleTypeSelect = (cat: string) => {
    setSelectedType(cat);
    if (onFilterChange) onFilterChange(cat);
  };

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    let result = [...tokens];

    // Filter by type
    if (selectedType !== 'ALL') {
      if (selectedType === 'INTEGER_LITERAL') {
        // Match constants group
        result = result.filter(
          (t) =>
            t.type === 'INTEGER_LITERAL' ||
            t.type === 'FLOAT_LITERAL' ||
            t.type === 'STRING_LITERAL' ||
            t.type === 'CHAR_LITERAL'
        );
      } else {
        result = result.filter((t) => t.type === selectedType);
      }
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.lexeme.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          t.subType.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tokens, selectedType, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Token Number', 'Lexeme', 'Token Type', 'Sub Type', 'Line Number', 'Column Number'];
    const rows = filteredTokens.map((t) => [
      t.tokenId,
      `"${t.lexeme.replace(/"/g, '""')}"`,
      t.type,
      `"${t.subType}"`,
      t.line,
      t.column
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lexiscan_tokens_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(filteredTokens, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Badge styling for different token types
  const getTypeBadgeStyle = (type: TokenType) => {
    switch (type) {
      case 'KEYWORD':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IDENTIFIER':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'OPERATOR':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'INTEGER_LITERAL':
      case 'FLOAT_LITERAL':
      case 'STRING_LITERAL':
      case 'CHAR_LITERAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SEPARATOR':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'COMMENT':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'PREPROCESSOR':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const isDfaTraced = (type: TokenType) => {
    return (
      type === 'IDENTIFIER' ||
      type === 'INTEGER_LITERAL' ||
      type === 'FLOAT_LITERAL' ||
      type === 'OPERATOR'
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lexeme or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter by Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'KEYWORD', label: 'Keywords' },
            { id: 'IDENTIFIER', label: 'Identifiers' },
            { id: 'OPERATOR', label: 'Operators' },
            { id: 'INTEGER_LITERAL', label: 'Constants' },
            { id: 'SEPARATOR', label: 'Separators' },
            { id: 'COMMENT', label: 'Comments' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleTypeSelect(cat.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedType === cat.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Export & Copy Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJSON}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Copy tokens as JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export tokens to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto min-h-[350px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-500 select-none">
            <tr>
              <th
                onClick={() => handleSort('tokenId')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 w-16"
              >
                <div className="flex items-center gap-1">
                  <span>#</span>
                  {sortField === 'tokenId' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                </div>
              </th>

              <th
                onClick={() => handleSort('lexeme')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 min-w-[120px]"
              >
                <div className="flex items-center gap-1">
                  <span>Lexeme</span>
                  {sortField === 'lexeme' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                </div>
              </th>

              <th
                onClick={() => handleSort('type')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 min-w-[130px]"
              >
                <div className="flex items-center gap-1">
                  <span>Token Type</span>
                  {sortField === 'type' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold min-w-[130px]">
                Sub-classification
              </th>

              <th
                onClick={() => handleSort('line')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 w-16 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Line</span>
                  {sortField === 'line' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                </div>
              </th>

              <th
                onClick={() => handleSort('column')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 w-16 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Col</span>
                  {sortField === 'column' ? (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold text-center w-24">
                Automaton
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                  {tokens.length === 0
                    ? 'No tokens generated yet. Click "Analyze Code" above.'
                    : 'No tokens match current search/filter criteria.'}
                </td>
              </tr>
            ) : (
              filteredTokens.map((t) => {
                const isSelected = selectedTokenId === t.tokenId;
                const canTraceDfa = isDfaTraced(t.type);

                return (
                  <tr
                    key={t.tokenId}
                    onClick={() => onSelectToken && onSelectToken(t)}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-400 tabular-nums">
                      {t.tokenId}
                    </td>

                    <td className="py-2 px-3 text-slate-900">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 break-all">
                        {t.lexeme}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getTypeBadgeStyle(t.type)}`}>
                        {t.type}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-slate-600 font-sans text-[11px]">
                      {t.subType}
                    </td>

                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                      {t.line}
                    </td>

                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                      {t.column}
                    </td>

                    <td className="py-2 px-3 text-center">
                      {canTraceDfa && onTraceInDfa ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTraceInDfa(t);
                          }}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded text-[10px] font-sans font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
                          title="Simulate this token in the DFA visualizer"
                        >
                          <GitMerge className="w-3 h-3" />
                          <span>Trace DFA</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-sans">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <strong className="text-slate-800 tabular-nums">{filteredTokens.length}</strong> of{' '}
          <strong className="text-slate-800 tabular-nums">{tokens.length}</strong> tokens
        </span>
        <span className="text-[11px] text-slate-400">
          Click any row to jump to code · Click &quot;Trace DFA&quot; to test state transitions
        </span>
      </div>
    </div>
  );
};
