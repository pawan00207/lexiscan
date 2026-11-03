import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header, ActiveTab } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { CodeEditor } from './components/CodeEditor';
import { TokenTable } from './components/TokenTable';
import { DfaVisualizer } from './components/DfaVisualizer';
import { InputBufferVisualizer } from './components/InputBufferVisualizer';
import { RegexLab } from './components/RegexLab';
import { LearnCompiler } from './components/LearnCompiler';
import { HistoryView } from './components/HistoryView';
import { SAMPLE_PROGRAMS } from './lib/samplePrograms';
import { analyzeSourceCode, SupportedLanguage, LexerResult, Token } from './lib/lexer';
import { HistoryItem } from '../server';
import { BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguage] = useState<SupportedLanguage>('c');
  const [sourceCode, setSourceCode] = useState<string>(SAMPLE_PROGRAMS[0].code);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tableFilter, setTableFilter] = useState<string>('ALL');
  const [liveMode, setLiveMode] = useState<boolean>(true);

  // DFA navigation state from tokens
  const [dfaTargetToken, setDfaTargetToken] = useState<string | undefined>(undefined);
  const [dfaTargetModelId, setDfaTargetModelId] = useState<string | undefined>(undefined);
  
  // Initial analysis result
  const [analysisResult, setAnalysisResult] = useState<LexerResult>(() =>
    analyzeSourceCode(SAMPLE_PROGRAMS[0].code, 'c')
  );

  // History list
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const debounceTimerRef = useRef<number | null>(null);

  // Fetch history from backend
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        }
      }
    } catch {
      // Graceful offline fallback
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Execute Lexical Analysis
  const performAnalysis = useCallback(async (code: string, lang: SupportedLanguage, recordHistory = false) => {
    setIsAnalyzing(true);

    try {
      let finalResult: LexerResult;

      // Call backend API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang })
      });

      if (response.ok) {
        const data = await response.json();
        finalResult = data.result;
      } else {
        // Fallback to in-browser engine if backend error
        finalResult = analyzeSourceCode(code, lang);
      }

      setAnalysisResult(finalResult);

      // Save to backend history if explicitly requested or on manual run
      if (recordHistory) {
        try {
          const saveRes = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: lang,
              fullCode: code,
              result: finalResult
            })
          });
          if (saveRes.ok) {
            const savedData = await saveRes.json();
            if (savedData.item) {
              setHistory((prev) => [savedData.item, ...prev.slice(0, 49)]);
            }
          }
        } catch {
          // Non-fatal
        }
      }

    } catch {
      // In-browser execution fallback
      const fallbackResult = analyzeSourceCode(code, lang);
      setAnalysisResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Handle code change with live mode debouncing
  const handleCodeChange = (newCode: string) => {
    setSourceCode(newCode);

    if (liveMode) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        performAnalysis(newCode, language, false);
      }, 250);
    }
  };

  const handleManualRunAnalysis = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    performAnalysis(sourceCode, language, true);
  };

  // Delete history item
  const handleDeleteHistory = async (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch {
      // Non-fatal
    }
  };

  // Load code from history or sample
  const handleLoadCode = (code: string, lang: string) => {
    setSourceCode(code);
    const validLang: SupportedLanguage = lang === 'java' ? 'java' : 'c';
    setLanguage(validLang);
    performAnalysis(code, validLang, true);
    setActiveTab('dashboard');
  };

  // Cross-link: Click "Trace DFA" from TokenTable
  const handleTraceInDfa = (token: Token) => {
    let modelId = 'identifier';
    if (token.type === 'INTEGER_LITERAL') modelId = 'integer';
    else if (token.type === 'FLOAT_LITERAL') modelId = 'float';
    else if (token.type === 'OPERATOR') {
      if (['<', '<=', '>', '>=', '==', '!='].includes(token.lexeme)) {
        modelId = 'relational';
      } else {
        modelId = 'arithmetic';
      }
    }

    setDfaTargetToken(token.lexeme);
    setDfaTargetModelId(modelId);
    setActiveTab('dfa');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Bar Contract (1 line brand - 5 nav links - 1 primary CTA) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunAnalysis={handleManualRunAnalysis}
        isAnalyzing={isAnalyzing}
        historyCount={history.length}
        liveMode={liveMode}
        onToggleLiveMode={() => setLiveMode(!liveMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Project Overview Banner (Visible across dashboard) */}
        {activeTab === 'dashboard' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Compiler Design · Project Based Learning
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">Phase 1: Lexical Analysis</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                LexiScan Interactive Lexical Analyzer &amp; Tokenization Engine
              </h1>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Processes source code character by character into a formal token stream, classifying keywords,
                identifiers, operators, numeric constants (decimal, hex, octal, float), string/char literals, and comments
                while detecting malformed lexical constructs in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('dfa')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>DFA Models</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('learn')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Compiler Lessons</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Statistics Metric Deck (interactive filter clicks) */}
            <StatsOverview
              stats={analysisResult.stats}
              language={language}
              activeFilter={tableFilter}
              onFilterChange={(cat) => setTableFilter(cat)}
            />

            {/* Two-Column Editor & Token Table Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Code Editor (5 cols) */}
              <div className="lg:col-span-5 h-[620px]">
                <CodeEditor
                  code={sourceCode}
                  onChange={handleCodeChange}
                  language={language}
                  onLanguageChange={(newLang) => {
                    setLanguage(newLang);
                    performAnalysis(sourceCode, newLang, false);
                  }}
                  errors={analysisResult.errors}
                  onAnalyze={handleManualRunAnalysis}
                  selectedLine={selectedToken?.line}
                  tokens={analysisResult.tokens}
                  onTokenAtCursor={(t) => setSelectedToken(t)}
                />
              </div>

              {/* Right Column: Token Table (7 cols) */}
              <div className="lg:col-span-7 h-[620px]">
                <TokenTable
                  tokens={analysisResult.tokens}
                  onSelectToken={(token) => setSelectedToken(token)}
                  selectedTokenId={selectedToken?.tokenId}
                  activeFilter={tableFilter}
                  onFilterChange={(cat) => setTableFilter(cat)}
                  onTraceInDfa={handleTraceInDfa}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dfa' && (
          <DfaVisualizer
            initialInput={dfaTargetToken}
            initialModelId={dfaTargetModelId}
          />
        )}

        {activeTab === 'buffering' && (
          <InputBufferVisualizer editorCode={sourceCode} />
        )}

        {activeTab === 'regex' && <RegexLab />}

        {activeTab === 'learn' && <LearnCompiler />}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onLoadCode={handleLoadCode}
            onDeleteHistoryItem={handleDeleteHistory}
          />
        )}

      </main>

      {/* Professional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">LexiScan</span>
            <span>—</span>
            <span>Compiler Design Project-Based Learning System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Automata Theory</span>
            <span aria-hidden="true">·</span>
            <span>Regular Expressions</span>
            <span aria-hidden="true">·</span>
            <span>Two-Buffer Scheme</span>
            <span aria-hidden="true">·</span>
            <span>Tokenization Algorithms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
