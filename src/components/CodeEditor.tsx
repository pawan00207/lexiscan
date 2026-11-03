import React, { useRef, useEffect } from 'react';
import { SupportedLanguage, LexicalError, Token } from '../lib/lexer';
import { SAMPLE_PROGRAMS, SampleProgram } from '../lib/samplePrograms';
import { Copy, Trash2, FolderOpen, AlertCircle, Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  errors: LexicalError[];
  onAnalyze: () => void;
  selectedLine?: number | null;
  tokens?: Token[];
  onTokenAtCursor?: (token: Token | null) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  errors,
  onAnalyze,
  selectedLine,
  tokens = [],
  onTokenAtCursor
}) => {
  const [copied, setCopied] = React.useState(false);
  const [currentErrorIndex, setCurrentErrorIndex] = React.useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Compute lines
  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Set of lines containing lexical errors
  const errorLines = new Set(errors.map((e) => e.line));

  // Sync scrolling between line numbers gutter and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleLoadSample = (sample: SampleProgram) => {
    onChange(sample.code);
    onLanguageChange(sample.language);
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to analyze
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onAnalyze();
    }
    // Handle tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Detect token at current cursor position
  const handleSelectionOrClick = () => {
    if (!textareaRef.current || !onTokenAtCursor) return;
    const cursorPos = textareaRef.current.selectionStart;

    const matchedToken = tokens.find(
      (t) => cursorPos >= t.startIndex && cursorPos <= t.endIndex
    );
    onTokenAtCursor(matchedToken || null);
  };

  // Jump to specific error line
  const handleJumpToError = (index: number) => {
    if (errors.length === 0) return;
    const validIdx = (index + errors.length) % errors.length;
    setCurrentErrorIndex(validIdx);
    const err = errors[validIdx];
    if (err && textareaRef.current) {
      const lineHeight = 24;
      textareaRef.current.scrollTop = Math.max(0, (err.line - 3) * lineHeight);
    }
  };

  // Scroll to selectedLine when requested by token click
  useEffect(() => {
    if (selectedLine && textareaRef.current) {
      const lineHeight = 24;
      textareaRef.current.scrollTop = Math.max(0, (selectedLine - 3) * lineHeight);
    }
  }, [selectedLine]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Editor Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
        {/* Left: Language selector & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span>Source Code Editor</span>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => onLanguageChange('c')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                language === 'c'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              C (C99/C11)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('java')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                language === 'java'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Java
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Sample programs dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Load Example</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-30 hidden group-hover:block group-focus-within:block">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Predefined Programs
              </div>
              {SAMPLE_PROGRAMS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors flex flex-col"
                >
                  <span className="font-medium text-slate-800 text-xs">{sample.title}</span>
                  <span className="text-[11px] text-slate-400 truncate">{sample.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy code */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Clear code */}
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Clear editor code"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Textarea Area with Line Numbers Gutter */}
      <div className="relative flex-1 min-h-[380px] flex bg-white font-mono text-sm leading-6">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 py-3 px-2 bg-slate-50 border-r border-slate-200 select-none overflow-hidden text-right text-slate-400 text-xs shrink-0"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const hasError = errorLines.has(lineNum);
            const isSelected = selectedLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`flex items-center justify-end gap-1 ${
                  hasError
                    ? 'text-red-600 font-bold bg-red-50 -mx-2 px-2'
                    : isSelected
                    ? 'text-blue-600 font-bold bg-blue-50 -mx-2 px-2'
                    : ''
                }`}
              >
                {hasError && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onClick={handleSelectionOrClick}
          onKeyUp={handleSelectionOrClick}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Paste or write C / Java source code here to analyze..."
          spellCheck={false}
          className="flex-1 w-full py-3 px-4 resize-none outline-none font-mono text-xs sm:text-sm text-slate-800 bg-transparent overflow-auto leading-6 whitespace-pre"
        />
      </div>

      {/* Editor Footer Status & Navigation */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span aria-hidden="true">·</span>
          <span>{code.length} chars</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400">Shortcut: <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Ctrl+Enter</kbd></span>
        </div>

        {errors.length > 0 ? (
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.length} lexical {errors.length === 1 ? 'error' : 'errors'}</span>
            <div className="flex items-center gap-1 border-l border-red-200 pl-2">
              <button
                type="button"
                onClick={() => handleJumpToError(currentErrorIndex - 1)}
                className="p-0.5 hover:bg-red-100 rounded text-red-700"
                title="Previous error"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px]">{currentErrorIndex + 1}/{errors.length}</span>
              <button
                type="button"
                onClick={() => handleJumpToError(currentErrorIndex + 1)}
                className="p-0.5 hover:bg-red-100 rounded text-red-700"
                title="Next error"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Lexically valid code</span>
          </div>
        )}
      </div>

      {/* Lexical Error Details Panel */}
      {errors.length > 0 && (
        <div className="border-t border-red-200 bg-red-50/60 p-3 max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-red-800 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Lexical Diagnostic Report:</span>
            </div>
            <span className="text-[11px] text-red-600 font-normal">Click error to jump</span>
          </div>
          <div className="space-y-1.5">
            {errors.map((err, idx) => (
              <div
                key={err.id}
                onClick={() => handleJumpToError(idx)}
                className="text-xs bg-white border border-red-200 hover:border-red-400 cursor-pointer rounded-md p-2 flex flex-col gap-1 text-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-red-700">
                    Line {err.line}, Column {err.column}: [{err.category}]
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    Lexeme: <strong className="text-slate-900">{err.snippet}</strong>
                  </span>
                </div>
                <p className="text-slate-800">{err.message}</p>
                <p className="text-slate-500 text-[11px]">
                  <strong>Suggestion:</strong> {err.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
