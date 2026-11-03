import React, { useState, useMemo } from 'react';
import { REGEX_PATTERNS, RegexPattern } from '../lib/regexModels';
import { Sparkles, CheckCircle2, XCircle, Info, Code, Edit3, RotateCcw } from 'lucide-react';

export const RegexLab: React.FC = () => {
  const [selectedPatternId, setSelectedPatternId] = useState<string>(REGEX_PATTERNS[0].id);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  
  const activePreset: RegexPattern =
    REGEX_PATTERNS.find((p) => p.id === selectedPatternId) || REGEX_PATTERNS[0];

  const [customPattern, setCustomPattern] = useState<string>(activePreset.pattern);
  const [testString, setTestString] = useState<string>(activePreset.sampleMatches[0] || '');

  const patternToUse = isCustomMode ? customPattern : activePreset.pattern;

  // Perform live regex evaluation and extract match data
  const testRegex = useMemo(() => {
    try {
      const reg = new RegExp(patternToUse);
      const isMatch = reg.test(testString);
      const execResult = reg.exec(testString);

      return {
        isValidPattern: true,
        isMatch,
        matchedText: execResult ? execResult[0] : null,
        matchIndex: execResult ? execResult.index : -1,
        groups: execResult && execResult.length > 1 ? Array.from(execResult).slice(1) : [],
        error: null
      };
    } catch (e: any) {
      return {
        isValidPattern: false,
        isMatch: false,
        matchedText: null,
        matchIndex: -1,
        groups: [],
        error: e.message
      };
    }
  }, [patternToUse, testString]);

  const handleSelectPreset = (id: string) => {
    setSelectedPatternId(id);
    setIsCustomMode(false);
    const pat = REGEX_PATTERNS.find((p) => p.id === id);
    if (pat) {
      setCustomPattern(pat.pattern);
      if (pat.sampleMatches.length > 0) {
        setTestString(pat.sampleMatches[0]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Regular Expression Token Laboratory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live regex evaluator with character-level match detection, Thompson’s construction mapping, and custom pattern mode.
            </p>
          </div>

          {/* Mode Switch & Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {REGEX_PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  !isCustomMode && selectedPatternId === p.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.name}
              </button>
            ))}

            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                isCustomMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Custom Regex</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Testing Deck */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Active Regex Pattern Input / Display */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{isCustomMode ? 'Edit Custom Regular Expression:' : 'Active Pattern:'}</span>
              {isCustomMode && (
                <button
                  onClick={() => setCustomPattern(activePreset.pattern)}
                  className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to preset</span>
                </button>
              )}
            </div>

            {isCustomMode ? (
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                placeholder="e.g. ^[a-z]+[0-9]*$"
                className="w-full p-2.5 bg-slate-900 text-emerald-400 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            ) : (
              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-sm rounded-lg flex items-center justify-between overflow-x-auto shadow-inner">
                <span>{activePreset.pattern}</span>
                <span className="text-xs text-slate-400 font-sans ml-2 shrink-0">
                  {activePreset.category}
                </span>
              </div>
            )}

            {!testRegex.isValidPattern && (
              <div className="mt-1 text-xs text-red-600 font-mono">
                Regex Syntax Error: {testRegex.error}
              </div>
            )}
          </div>

          {/* Test Custom String Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Test Custom String:</span>
              <div className="flex items-center gap-1">
                {testRegex.isMatch ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>MATCHED (Valid Token)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>NO MATCH (Rejected)</span>
                  </span>
                )}
              </div>
            </div>

            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Type string to test against pattern..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* Match details tag */}
            {testRegex.isMatch && testRegex.matchedText && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Matched Span: <strong className="text-slate-800 font-mono">&quot;{testRegex.matchedText}&quot;</strong></span>
                <span aria-hidden="true">·</span>
                <span>Offset: <strong className="text-slate-800 font-mono">{testRegex.matchIndex}</strong></span>
                {testRegex.groups.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Captured Groups: <strong className="text-blue-700 font-mono">{testRegex.groups.join(', ')}</strong></span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preset Sample Badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Matching Presets:</span>
            {activePreset.sampleMatches.map((m) => (
              <button
                key={m}
                onClick={() => setTestString(m)}
                className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-mono text-xs hover:bg-emerald-100 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Non-matching Examples:</span>
            {activePreset.sampleNonMatches.map((nm) => (
              <button
                key={nm}
                onClick={() => setTestString(nm)}
                className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-800 rounded font-mono text-xs hover:bg-red-100 transition-colors"
              >
                {nm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Stage: Component Breakdown & Thompson Construction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Component-by-Component Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Regular Expression Component Decomposition</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            How individual regex segments map to formal language definitions and parser tokens.
          </p>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Segment</th>
                  <th className="py-2.5 px-3">Syntactic Role</th>
                  <th className="py-2.5 px-3">Automaton Mapping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activePreset.components.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 bg-blue-50/30">
                      {comp.segment}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {comp.meaning}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {comp.automatonEffect}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thompson's Construction & Formal Theory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Thompson’s Construction Algorithm</span>
          </h3>

          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              In compiler engineering (e.g. tools like <em>Lex</em> or <em>Flex</em>), regular expressions are not evaluated through regex engine backtracking. Instead, they are compiled into <strong>Deterministic Finite Automata (DFA)</strong> via two classic algorithms:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700 font-medium">
              <li>
                <strong>Thompson’s Construction:</strong> Converts the regular expression into an equivalent ε-NFA (Non-deterministic Finite Automaton) in linear time O(r).
              </li>
              <li>
                <strong>Subset Construction (Powerset Construction):</strong> Converts the NFA into a DFA by computing ε-closures over sets of states.
              </li>
              <li>
                <strong>DFA Minimization:</strong> Combines indistinguishable states using Hopcroft’s algorithm to yield the minimal state machine.
              </li>
            </ol>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs">
            <div className="font-semibold text-blue-900 mb-1">
              Automaton Synthesis for &ldquo;{activePreset.name}&rdquo;:
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              {activePreset.thompsonExplanation}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
