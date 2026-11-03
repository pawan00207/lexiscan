import React, { useState, useEffect, useRef } from 'react';
import { ALL_DFA_MODELS, DfaModel, simulateDfa, DfaStep } from '../lib/dfaModels';
import { Play, Pause, RotateCcw, StepForward, CheckCircle2, XCircle, Info, FastForward, Sparkles } from 'lucide-react';

interface DfaVisualizerProps {
  initialInput?: string;
  initialModelId?: string;
}

export const DfaVisualizer: React.FC<DfaVisualizerProps> = ({
  initialInput,
  initialModelId
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || 'identifier');
  const [inputString, setInputString] = useState<string>(initialInput || 'count_1');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(800); // ms per step
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // If initial props change from outside (e.g. user clicked Trace DFA on a token)
  useEffect(() => {
    if (initialModelId) setSelectedModelId(initialModelId);
    if (initialInput) setInputString(initialInput);
    handleReset();
  }, [initialInput, initialModelId]);

  // Active DFA Model
  const model: DfaModel = ALL_DFA_MODELS.find((m) => m.id === selectedModelId) || ALL_DFA_MODELS[0];

  // Simulation steps
  const steps: DfaStep[] = React.useMemo(() => {
    if (!inputString) return [];
    return simulateDfa(model, inputString);
  }, [model, inputString]);

  // Determine current active state
  const activeStateId =
    currentStepIndex === -1
      ? model.formalDefinition.initialState
      : steps[currentStepIndex]?.toStateId || model.formalDefinition.initialState;

  // Active transition
  const activeTransitionId =
    currentStepIndex >= 0 ? steps[currentStepIndex]?.transitionId : undefined;

  // Final simulation result if completed
  const isFinished = currentStepIndex >= 0 && currentStepIndex === steps.length - 1;
  const isAccepted = isFinished && steps[steps.length - 1]?.isAccepted;
  const isRejected = isFinished && steps[steps.length - 1]?.isRejected;

  // Step Forward
  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Reset
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, playSpeed]);

  // Reset when model or input changes
  const handleSelectModel = (id: string) => {
    setSelectedModelId(id);
    const newModel = ALL_DFA_MODELS.find((m) => m.id === id);
    if (newModel && newModel.presetInputs.length > 0) {
      setInputString(newModel.presetInputs[0].value);
    }
    handleReset();
  };

  const handleApplyPreset = (val: string) => {
    setInputString(val);
    handleReset();
  };

  const inspectedNode = model.nodes.find((n) => n.id === inspectedNodeId);

  return (
    <div className="space-y-6">
      {/* Top Configuration & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Interactive Finite Automata (DFA) Simulator</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live token state transitions, formal delta equations, and lookahead disambiguation.
            </p>
          </div>

          {/* Model Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {ALL_DFA_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectModel(m.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedModelId === m.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.tokenType}
              </button>
            ))}
          </div>
        </div>

        {/* Input String & Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          {/* Test Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <label className="text-xs font-semibold text-slate-700 shrink-0">
              Test Input Token:
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => {
                setInputString(e.target.value);
                handleReset();
              }}
              placeholder="Enter string to trace in DFA..."
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium">Presets:</span>
            {model.presetInputs.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleApplyPreset(preset.value)}
                className={`px-2 py-1 border rounded text-xs font-mono transition-colors ${
                  inputString === preset.value
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={preset.notes}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleReset}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset Automaton to Start State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentStepIndex >= steps.length - 1 ? 'Replay' : 'Play'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleStepForward}
              disabled={isPlaying || currentStepIndex >= steps.length - 1}
              className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step</span>
            </button>

            <button
              onClick={() => setPlaySpeed(playSpeed === 800 ? 400 : 800)}
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Toggle Simulation Speed"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{playSpeed === 400 ? '2x' : '1x'}</span>
            </button>
          </div>
        </div>

        {/* Character Tape Inspector */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Input Tape:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono">
            {Array.from(inputString).map((char, idx) => {
              const isCurrent = currentStepIndex === idx;
              const isPast = currentStepIndex > idx;
              return (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold border transition-all ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-300 scale-105'
                      : isPast
                      ? 'bg-slate-100 border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {char}
                </div>
              );
            })}
            {inputString.length === 0 && (
              <span className="text-xs text-slate-400 italic font-sans">
                (Empty input tape)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Stage: Graph Canvas (Left/Top) + Transition & Theory Deck (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Graph Canvas (2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{model.title}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">
                Initial: <code className="text-slate-700">{model.formalDefinition.initialState}</code>
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">
                Accepting: <code className="text-slate-700">{model.formalDefinition.acceptingStates.join(', ')}</code>
              </span>
            </div>

            {/* Verdict Indicator */}
            {isFinished && (
              <div>
                {isAccepted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACCEPTED (Valid Token)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>REJECTED (Lexical Error)</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-[400px] bg-slate-50/40 rounded-lg border border-slate-100 overflow-hidden my-2 flex items-center justify-center">
            <svg
              viewBox="0 0 800 450"
              className="w-full h-full select-none"
              style={{ maxHeight: '100%' }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
                </marker>
              </defs>

              {/* Render Transition Edges */}
              {model.transitions.map((t) => {
                const sourceNode = model.nodes.find((n) => n.id === t.from);
                const targetNode = model.nodes.find((n) => n.id === t.to);
                if (!sourceNode || !targetNode) return null;

                const isActive = activeTransitionId === t.id;
                const isSelfLoop = t.from === t.to;

                if (isSelfLoop) {
                  const loopOffset = t.curveOffset || -45;
                  const pathD = `M ${sourceNode.x - 12} ${sourceNode.y - 20} C ${sourceNode.x - 30} ${
                    sourceNode.y + loopOffset
                  }, ${sourceNode.x + 30} ${sourceNode.y + loopOffset}, ${sourceNode.x + 12} ${
                    sourceNode.y - 20
                  }`;

                  return (
                    <g key={t.id}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isActive ? '#2563eb' : '#94a3b8'}
                        strokeWidth={isActive ? '3' : '1.5'}
                        markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                        className="transition-colors duration-200"
                      />
                      <rect
                        x={sourceNode.x - 28}
                        y={sourceNode.y + loopOffset - 10}
                        width="56"
                        height="18"
                        rx="4"
                        fill="#ffffff"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x={sourceNode.x}
                        y={sourceNode.y + loopOffset + 3}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-bold"
                        fill={isActive ? '#1d4ed8' : '#475569'}
                      >
                        {t.displaySymbol}
                      </text>
                    </g>
                  );
                }

                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) return null;

                const nodeRadius = 26;
                const startX = sourceNode.x + (dx / dist) * nodeRadius;
                const startY = sourceNode.y + (dy / dist) * nodeRadius;
                const endX = targetNode.x - (dx / dist) * nodeRadius;
                const endY = targetNode.y - (dy / dist) * nodeRadius;

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const curveY = midY + (t.curveOffset || 0);

                const pathD =
                  t.curveOffset
                    ? `M ${startX} ${startY} Q ${midX} ${curveY} ${endX} ${endY}`
                    : `M ${startX} ${startY} L ${endX} ${endY}`;

                return (
                  <g key={t.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isActive ? '#2563eb' : '#94a3b8'}
                      strokeWidth={isActive ? '3' : '1.5'}
                      markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                      className="transition-colors duration-200"
                    />
                    <rect
                      x={midX - 28}
                      y={(t.curveOffset ? curveY : midY) - 10}
                      width="56"
                      height="18"
                      rx="4"
                      fill="#ffffff"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={(t.curveOffset ? curveY : midY) + 3}
                      textAnchor="middle"
                      className="text-[11px] font-mono font-bold"
                      fill={isActive ? '#1d4ed8' : '#475569'}
                    >
                      {t.displaySymbol}
                    </text>
                  </g>
                );
              })}

              {/* Render State Nodes */}
              {model.nodes.map((node) => {
                const isActive = activeStateId === node.id;
                const isAccepting = node.isAccepting;
                const isInitial = node.isInitial;
                const isInspected = inspectedNodeId === node.id;

                return (
                  <g
                    key={node.id}
                    onClick={() => setInspectedNodeId(node.id === inspectedNodeId ? null : node.id)}
                    className="cursor-pointer group"
                  >
                    {/* Start arrow for initial state */}
                    {isInitial && (
                      <g>
                        <path
                          d={`M ${node.x - 55} ${node.y} L ${node.x - 30} ${node.y}`}
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="2"
                          markerEnd="url(#arrow)"
                        />
                        <text
                          x={node.x - 60}
                          y={node.y - 6}
                          textAnchor="end"
                          className="text-[10px] font-sans font-semibold"
                          fill="#64748b"
                        >
                          Start
                        </text>
                      </g>
                    )}

                    {/* Outer circle for accepting state */}
                    {isAccepting && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="30"
                        fill="none"
                        stroke={isActive ? '#2563eb' : '#059669'}
                        strokeWidth={isActive ? '2.5' : '1.5'}
                      />
                    )}

                    {/* Active State Halo Pulse */}
                    {isActive && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="34"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Inspected state indicator ring */}
                    {isInspected && !isActive && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="34"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="24"
                      fill={isActive ? '#2563eb' : '#ffffff'}
                      stroke={isActive ? '#1d4ed8' : '#475569'}
                      strokeWidth="2"
                      className="transition-colors duration-200 group-hover:stroke-blue-500"
                    />

                    {/* State Label */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      className="text-xs font-mono font-bold"
                      fill={isActive ? '#ffffff' : '#1e293b'}
                    >
                      {node.label}
                    </text>

                    {/* Sub-label below node */}
                    {node.subLabel && (
                      <text
                        x={node.x}
                        y={node.y + 45}
                        textAnchor="middle"
                        className="text-[10px] font-sans font-medium"
                        fill="#64748b"
                      >
                        {node.subLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Current State Indicator & Inspected state details */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
            <div>
              Active State:{' '}
              <strong className="text-slate-900 font-mono text-sm">{activeStateId}</strong>{' '}
              <span className="text-slate-600 font-sans">
                ({model.nodes.find((n) => n.id === activeStateId)?.description})
              </span>
            </div>
            {inspectedNode && (
              <div className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                Inspected Node {inspectedNode.label}: {inspectedNode.description}
              </div>
            )}
            <div>
              Step:{' '}
              <strong className="text-slate-900 font-mono">
                {currentStepIndex + 1} / {steps.length}
              </strong>
            </div>
          </div>
        </div>

        {/* Transition Trace & Academic Theory Deck (Right Column) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Transition Execution Trace</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time delta state transitions: $\delta(q_i, a) \to q_j$
            </p>

            {/* Trace Step List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {steps.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Enter an input token to trace state transitions.
                </div>
              ) : (
                steps.map((st, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  const isPast = currentStepIndex > idx;

                  return (
                    <div
                      key={st.stepNumber}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-300 font-semibold'
                          : isPast
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-white border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono mb-1">
                        <span>
                          Step {st.stepNumber}: Read &apos;{st.char}&apos;
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 font-semibold text-slate-700">
                          {st.fromStateId} → {st.toStateId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans font-normal">
                        {st.explanation}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Academic Model Definition */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 mb-1">DFA 5-Tuple Definition:</div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 bg-slate-50 p-2 rounded border border-slate-200">
              <div>Q = {'{'}{model.formalDefinition.states.join(', ')}{'}'}</div>
              <div>Σ = {'{'}{model.formalDefinition.alphabet}{'}'}</div>
              <div>q0 = {model.formalDefinition.initialState}</div>
              <div>F = {'{'}{model.formalDefinition.acceptingStates.join(', ')}{'}'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
