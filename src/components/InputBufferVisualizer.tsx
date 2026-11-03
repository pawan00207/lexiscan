import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, StepForward, CornerDownLeft, RefreshCw, Cpu, Layers, ArrowDownCircle } from 'lucide-react';

interface TokenEmission {
  id: number;
  lexeme: string;
  type: string;
}

interface InputBufferVisualizerProps {
  editorCode?: string;
}

export const InputBufferVisualizer: React.FC<InputBufferVisualizerProps> = ({
  editorCode
}) => {
  const BUFFER_SIZE = 16;
  const defaultSource = 'int count = 42; if (count >= 10) return count;';

  const [sourceCode, setSourceCode] = useState<string>(editorCode || defaultSource);
  // Source offset pointer into the raw source code
  const [sourceIndex, setSourceIndex] = useState<number>(0);
  
  // Buffers (each holds BUFFER_SIZE chars plus 1 sentinel char)
  const [buffer1, setBuffer1] = useState<string[]>([]);
  const [buffer2, setBuffer2] = useState<string[]>([]);
  
  // Pointers: index from 0 to 33 (0-16 is Buffer1, 17-33 is Buffer2)
  const [lexemeBegin, setLexemeBegin] = useState<number>(0);
  const [forward, setForward] = useState<number>(0);
  
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [emittedTokens, setEmittedTokens] = useState<TokenEmission[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Initialize and load buffers
  const initializeBuffers = (code: string) => {
    // Replace newlines with spaces for clean linear buffer demonstration
    const normalized = code.replace(/[\r\n\t]+/g, ' ').trim();
    const chars = Array.from(normalized);
    
    // Fill buffer 1
    const b1 = chars.slice(0, BUFFER_SIZE);
    while (b1.length < BUFFER_SIZE) b1.push(' ');
    b1.push('EOF'); // Sentinel at index 16

    // Fill buffer 2
    const b2 = chars.slice(BUFFER_SIZE, BUFFER_SIZE * 2);
    while (b2.length < BUFFER_SIZE) b2.push(' ');
    b2.push('EOF'); // Sentinel at index 33

    setBuffer1(b1);
    setBuffer2(b2);
    setSourceIndex(BUFFER_SIZE * 2);
    setLexemeBegin(0);
    setForward(0);
    setEmittedTokens([]);
    setLogMessages([
      'Initial state: Loaded 16 bytes into Buffer 1 and 16 bytes into Buffer 2.',
      'Sentinels [EOF] placed at index 16 and 33 to prevent boundary overflow.'
    ]);
  };

  useEffect(() => {
    initializeBuffers(sourceCode);
  }, []);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 15)]);
  };

  // Get character at virtual pointer position (0-33)
  const getCharAt = (pos: number): string => {
    if (pos <= 16) {
      return buffer1[pos] || 'EOF';
    } else {
      const idx = pos - 17;
      return buffer2[idx] || 'EOF';
    }
  };

  // Step Forward Scanner Logic
  const handleStepForward = () => {
    let nextForward = forward + 1;
    const currentChar = getCharAt(forward);

    // Check Sentinel at end of Buffer 1 (position 16)
    if (forward === 16) {
      addLog('Sentinel reached at end of Buffer 1! Reloading Buffer 2 and shifting forward to Buffer 2 start (pos 17).');
      const normalized = sourceCode.replace(/[\r\n\t]+/g, ' ').trim();
      const chars = Array.from(normalized);
      const nextSlice = chars.slice(sourceIndex, sourceIndex + BUFFER_SIZE);
      while (nextSlice.length < BUFFER_SIZE) nextSlice.push(' ');
      nextSlice.push('EOF');
      setBuffer2(nextSlice);
      setSourceIndex((prev) => prev + BUFFER_SIZE);
      setForward(17);
      return;
    }

    // Check Sentinel at end of Buffer 2 (position 33)
    if (forward === 33) {
      addLog('Sentinel reached at end of Buffer 2! Reloading Buffer 1 and wrapping forward to Buffer 1 start (pos 0).');
      const normalized = sourceCode.replace(/[\r\n\t]+/g, ' ').trim();
      const chars = Array.from(normalized);
      const nextSlice = chars.slice(sourceIndex, sourceIndex + BUFFER_SIZE);
      while (nextSlice.length < BUFFER_SIZE) nextSlice.push(' ');
      nextSlice.push('EOF');
      setBuffer1(nextSlice);
      setSourceIndex((prev) => prev + BUFFER_SIZE);
      setForward(0);
      return;
    }

    // Check if character is a delimiter (space, semicolon, parenthesis, operator)
    if (currentChar === ' ' || currentChar === ';' || currentChar === '(' || currentChar === ')') {
      emitCurrentLexeme();
    } else {
      addLog(`Forward scanned character '${currentChar}' at buffer offset ${forward}.`);
    }

    setForward(nextForward);
  };

  // Emit token between lexemeBegin and forward
  const emitCurrentLexeme = () => {
    let lexeme = '';
    for (let i = lexemeBegin; i < forward; i++) {
      const c = getCharAt(i);
      if (c !== 'EOF') lexeme += c;
    }

    const trimmed = lexeme.trim();
    if (trimmed) {
      const tokenType = /^(int|if|return|void|float|char|double)$/.test(trimmed)
        ? 'KEYWORD'
        : /^[0-9]+$/.test(trimmed)
        ? 'INTEGER_LITERAL'
        : /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)
        ? 'IDENTIFIER'
        : 'OPERATOR / DELIMITER';

      setEmittedTokens((prev) => [
        ...prev,
        { id: prev.length + 1, lexeme: trimmed, type: tokenType }
      ]);

      addLog(`Token Emitted: [${tokenType}: "${trimmed}"]. Shifted lexeme_begin to ${forward}.`);
    }

    setLexemeBegin(forward);
  };

  // Retract Forward Pointer (demonstrating lookahead rollback)
  const handleRetract = () => {
    if (forward > lexemeBegin) {
      const prevPos = forward - 1;
      setForward(prevPos);
      addLog(`Lookahead Retracted: Decremented forward pointer by 1 (pos ${prevPos}) after scanning delimiter.`);
    }
  };

  // Auto scan timer
  useEffect(() => {
    if (isScanning) {
      timerRef.current = window.setInterval(() => {
        handleStepForward();
      }, 700);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isScanning, forward, lexemeBegin, sourceCode]);

  const handleReset = () => {
    setIsScanning(false);
    initializeBuffers(sourceCode);
  };

  const handleLoadEditorCode = () => {
    if (editorCode) {
      setSourceCode(editorCode);
      initializeBuffers(editorCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>Input Buffering Demonstration (Buffer Pairs & Sentinels)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrating the classic Dragon Book two-buffer scheme with lookahead and sentinel EOF handling.
            </p>
          </div>

          {/* Quick Playback Controls */}
          <div className="flex items-center gap-2">
            {editorCode && (
              <button
                type="button"
                onClick={handleLoadEditorCode}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Load the code currently in the code editor into this buffer simulation"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>Sync From Editor</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset Buffer State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsScanning(!isScanning)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              {isScanning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isScanning ? 'Pause Scan' : 'Auto Scan'}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={isScanning}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step Forward</span>
            </button>

            <button
              onClick={handleRetract}
              disabled={isScanning || forward <= lexemeBegin}
              className="px-3 py-1.5 border border-amber-200 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Retract forward pointer after lookahead overshoot"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Retract Lookahead</span>
            </button>
          </div>
        </div>

        {/* Source Stream Input */}
        <div className="pt-4 flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 shrink-0">
            Source Stream:
          </label>
          <input
            type="text"
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value);
              initializeBuffers(e.target.value);
            }}
            placeholder="Type source code to simulate buffering..."
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Visual Buffer Pairs Deck */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        
        {/* Pointer Legend & Current Coordinates */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-600 ring-2 ring-blue-200" />
              <span className="font-semibold text-slate-800">lexeme_begin</span>
              <span className="text-slate-500 font-mono">(Index: {lexemeBegin})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500 ring-2 ring-amber-200" />
              <span className="font-semibold text-slate-800">forward</span>
              <span className="text-slate-500 font-mono">(Index: {forward})</span>
            </div>
          </div>

          <div className="text-slate-500 text-xs">
            Current Lexeme Window: &quot;
            <strong className="text-blue-700 font-mono">
              {Array.from({ length: Math.max(0, forward - lexemeBegin) })
                .map((_, i) => getCharAt(lexemeBegin + i))
                .filter((c) => c !== 'EOF')
                .join('')}
            </strong>
            &quot;
          </div>
        </div>

        {/* Buffer 1 (Half 1) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Buffer 1 (Capacity: 16 Characters + 1 Sentinel EOF)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Virtual indices 0 – 16</span>
          </div>

          <div className="grid grid-cols-17 gap-1 font-mono text-xs">
            {buffer1.map((char, idx) => {
              const isBegin = lexemeBegin === idx;
              const isFwd = forward === idx;
              const isSentinel = idx === 16;
              const isInWindow = idx >= lexemeBegin && idx < forward;

              return (
                <div
                  key={`b1-${idx}`}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                    isSentinel
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                      : isBegin && isFwd
                      ? 'bg-blue-100 border-blue-500 text-blue-900 font-bold ring-2 ring-amber-400'
                      : isBegin
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold ring-2 ring-blue-300'
                      : isFwd
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-300'
                      : isInWindow
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-[9px] font-sans h-3 select-none">
                    {isBegin && isFwd ? (
                      <span className="text-blue-600 font-bold">▲both</span>
                    ) : isBegin ? (
                      <span className="text-blue-600 font-bold">▲begin</span>
                    ) : isFwd ? (
                      <span className="text-amber-600 font-bold">▲fwd</span>
                    ) : null}
                  </div>

                  <span className="text-sm font-bold my-0.5">
                    {char === ' ' ? '␣' : char}
                  </span>

                  <span className="text-[9px] text-slate-400 font-normal">
                    {idx}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buffer 2 (Half 2) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Buffer 2 (Capacity: 16 Characters + 1 Sentinel EOF)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Virtual indices 17 – 33</span>
          </div>

          <div className="grid grid-cols-17 gap-1 font-mono text-xs">
            {buffer2.map((char, localIdx) => {
              const globalIdx = localIdx + 17;
              const isBegin = lexemeBegin === globalIdx;
              const isFwd = forward === globalIdx;
              const isSentinel = localIdx === 16;
              const isInWindow = globalIdx >= lexemeBegin && globalIdx < forward;

              return (
                <div
                  key={`b2-${localIdx}`}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                    isSentinel
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                      : isBegin && isFwd
                      ? 'bg-blue-100 border-blue-500 text-blue-900 font-bold ring-2 ring-amber-400'
                      : isBegin
                      ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold ring-2 ring-blue-300'
                      : isFwd
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-300'
                      : isInWindow
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-[9px] font-sans h-3 select-none">
                    {isBegin && isFwd ? (
                      <span className="text-blue-600 font-bold">▲both</span>
                    ) : isBegin ? (
                      <span className="text-blue-600 font-bold">▲begin</span>
                    ) : isFwd ? (
                      <span className="text-amber-600 font-bold">▲fwd</span>
                    ) : null}
                  </div>

                  <span className="text-sm font-bold my-0.5">
                    {char === ' ' ? '␣' : char}
                  </span>

                  <span className="text-[9px] text-slate-400 font-normal">
                    {globalIdx}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Two Column Deck: Emitted Tokens & Sentinel Buffering Theory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time Buffer Events Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Buffer Operations & Sentinel Event Log</span>
            </span>
            <span className="text-slate-400">{logMessages.length} events logged</span>
          </div>

          <div className="space-y-1.5 my-3 max-h-56 overflow-y-auto font-mono text-xs">
            {logMessages.map((msg, i) => (
              <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-700">
                {msg}
              </div>
            ))}
          </div>

          {/* Emitted Tokens list */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 mb-2 block">
              Tokens Emitted from Buffer:
            </span>
            <div className="flex flex-wrap gap-2">
              {emittedTokens.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No tokens emitted yet.</span>
              ) : (
                emittedTokens.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-mono text-blue-900"
                  >
                    <strong>{t.lexeme}</strong>
                    <span className="text-[10px] text-blue-600 font-sans">({t.type})</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Academic Dragon Book Theory Callout */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Dragon Book Theory: Why Buffer Pairs with Sentinels?
          </h3>

          <div className="space-y-2 text-slate-600 leading-relaxed">
            <p>
              <strong>1. The I/O Bottleneck:</strong> Reading high-level source programs character-by-character via system calls causes massive kernel transition overhead. Compilers load large memory blocks (typically 4KB) in bulk.
            </p>
            <p>
              <strong>2. Buffer Boundary Spanning:</strong> Keywords or long identifiers frequently cross buffer edges. Using two circular buffer halves (Buffer 1 & Buffer 2) allows <code className="text-blue-700 font-mono">forward</code> to read into the second buffer without losing the token origin at <code className="text-blue-700 font-mono">lexeme_begin</code>.
            </p>
            <p>
              <strong>3. Sentinel Elimination:</strong> Without sentinels, every character read requires <em>two checks</em>: (1) Is it EOF? (2) Has the forward pointer reached the end of the buffer? Placing an explicit <code className="text-rose-700 font-mono font-bold">EOF</code> sentinel at the boundary reduces the inner scanning loop to a <em>single check</em>, multiplying scanner speed!
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800">
            <div>switch (*forward++) &#123;</div>
            <div className="pl-4">case EOF:</div>
            <div className="pl-8">if (forward at end of Buffer 1) reload Buffer 2;</div>
            <div className="pl-8">else if (forward at end of Buffer 2) reload Buffer 1;</div>
            <div className="pl-8">else terminateScan(); // Actual source EOF</div>
            <div className="pl-8">break;</div>
            <div>&#125;</div>
          </div>
        </div>

      </div>
    </div>
  );
};
