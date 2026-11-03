import React, { useState, useEffect } from 'react';
import { Play, Sparkles, History as HistoryIcon, BookOpen, GitMerge, Cpu, Layers, Menu, X, Activity } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'dfa' | 'buffering' | 'regex' | 'learn' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  historyCount: number;
  liveMode: boolean;
  onToggleLiveMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunAnalysis,
  isAnalyzing,
  historyCount,
  liveMode,
  onToggleLiveMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ online: boolean; pingMs: number }>({
    online: true,
    pingMs: 1
  });

  // Periodically check server ping
  useEffect(() => {
    const checkServer = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const latency = Math.round(performance.now() - start);
          setServerStatus({ online: true, pingMs: Math.max(1, latency) });
        } else {
          setServerStatus({ online: false, pingMs: 0 });
        }
      } catch {
        setServerStatus({ online: false, pingMs: 0 });
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap block">
                  LexiScan
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                  Compiler Lexical Analyzer
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Analyzer</span>
            </button>

            <button
              onClick={() => handleTabClick('dfa')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dfa'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitMerge className="w-4 h-4" />
              <span>DFA Visualizer</span>
            </button>

            <button
              onClick={() => handleTabClick('buffering')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'buffering'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Input Buffering</span>
            </button>

            <button
              onClick={() => handleTabClick('regex')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'regex'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Regex Lab</span>
            </button>

            <button
              onClick={() => handleTabClick('learn')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'learn'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learn Compiler</span>
            </button>

            <button
              onClick={() => handleTabClick('history')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span>History</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                {historyCount}
              </span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Live Mode Toggle + Server Status */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Real-time Server telemetry indicator */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Activity className={`w-3.5 h-3.5 ${serverStatus.online ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="tabular-nums">
                {serverStatus.online ? `${serverStatus.pingMs}ms API` : 'Local Engine'}
              </span>
            </div>

            {/* Live Scan Mode toggle */}
            <button
              type="button"
              onClick={onToggleLiveMode}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                liveMode
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Auto-analyze source code in real time as you type"
            >
              <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Live Scan: {liveMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Primary Analyze CTA Button */}
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-xs"
              title="Run lexical analysis (Ctrl+Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAnalyzing ? 'Scanning...' : 'Analyze Code'}</span>
            </button>

            {/* Mobile Hamburger Menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Lexical Analyzer</span>
          </button>

          <button
            onClick={() => handleTabClick('dfa')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
              activeTab === 'dfa' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>DFA State Visualizer</span>
          </button>

          <button
            onClick={() => handleTabClick('buffering')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
              activeTab === 'buffering' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Input Buffering Demonstration</span>
          </button>

          <button
            onClick={() => handleTabClick('regex')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
              activeTab === 'regex' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Regular Expressions Lab</span>
          </button>

          <button
            onClick={() => handleTabClick('learn')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
              activeTab === 'learn' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn Compiler Design</span>
          </button>

          <button
            onClick={() => handleTabClick('history')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
              activeTab === 'history' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              <span>Analysis History</span>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              {historyCount}
            </span>
          </button>

          {/* Live Mode Toggle on mobile */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs">
            <span className="text-slate-600 font-medium">Real-time Live Scanning</span>
            <button
              onClick={onToggleLiveMode}
              className={`px-3 py-1 rounded font-semibold ${
                liveMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {liveMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
