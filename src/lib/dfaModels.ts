/**
 * Formal Finite Automata (DFA) Models & Step Simulator
 * Supports academic Compiler Design visualization
 */

export interface DfaStateNode {
  id: string;
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  isInitial?: boolean;
  isAccepting?: boolean;
  description: string;
}

export interface DfaTransition {
  id: string;
  from: string;
  to: string;
  symbols: string[];
  displaySymbol: string;
  curveOffset?: number; // SVG curve curvature
  description: string;
  matches: (c: string) => boolean;
}

export interface DfaModel {
  id: string;
  title: string;
  tokenType: string;
  description: string;
  formalDefinition: {
    states: string[];
    alphabet: string;
    initialState: string;
    acceptingStates: string[];
  };
  nodes: DfaStateNode[];
  transitions: DfaTransition[];
  presetInputs: { label: string; value: string; expected: 'accept' | 'reject'; notes: string }[];
}

export interface DfaStep {
  stepNumber: number;
  char: string;
  fromStateId: string;
  toStateId: string;
  isAccepted: boolean;
  isRejected: boolean;
  explanation: string;
  transitionId?: string;
}

// 1. Identifier DFA
export const IDENTIFIER_DFA: DfaModel = {
  id: 'identifier',
  title: 'Identifier Recognition DFA',
  tokenType: 'IDENTIFIER',
  description: 'Validates C/Java identifiers matching rule: [a-zA-Z_][a-zA-Z0-9_]*',
  formalDefinition: {
    states: ['q0', 'q1', 'q_trap'],
    alphabet: 'a-z, A-Z, 0-9, _',
    initialState: 'q0',
    acceptingStates: ['q1']
  },
  nodes: [
    {
      id: 'q0',
      label: 'q0',
      subLabel: 'Start',
      x: 100,
      y: 180,
      isInitial: true,
      description: 'Initial start state. Awaiting first character of identifier.'
    },
    {
      id: 'q1',
      label: 'q1',
      subLabel: 'Identifier',
      x: 380,
      y: 180,
      isAccepting: true,
      description: 'Accepting state. Valid identifier scanned so far.'
    },
    {
      id: 'q_trap',
      label: 'q_err',
      subLabel: 'Trap State',
      x: 240,
      y: 320,
      description: 'Non-accepting trap state. Invalid character encountered.'
    }
  ],
  transitions: [
    {
      id: 't-q0-q1',
      from: 'q0',
      to: 'q1',
      symbols: ['[a-zA-Z_]'],
      displaySymbol: '[a-zA-Z_]',
      description: 'Valid starting character: Letter or underscore',
      matches: (c) => /^[a-zA-Z_]$/.test(c)
    },
    {
      id: 't-q1-q1',
      from: 'q1',
      to: 'q1',
      symbols: ['[a-zA-Z0-9_]'],
      displaySymbol: '[a-zA-Z0-9_]',
      curveOffset: -45,
      description: 'Subsequent character: Alphanumeric or underscore',
      matches: (c) => /^[a-zA-Z0-9_]$/.test(c)
    },
    {
      id: 't-q0-trap',
      from: 'q0',
      to: 'q_trap',
      symbols: ['[0-9] / other'],
      displaySymbol: '[0-9] / other',
      description: 'Illegal start character: Numbers and symbols cannot begin an identifier',
      matches: (c) => !/^[a-zA-Z_]$/.test(c)
    },
    {
      id: 't-q1-trap',
      from: 'q1',
      to: 'q_trap',
      symbols: ['other'],
      displaySymbol: 'other',
      description: 'Illegal character inside identifier body',
      matches: (c) => !/^[a-zA-Z0-9_]$/.test(c)
    },
    {
      id: 't-trap-trap',
      from: 'q_trap',
      to: 'q_trap',
      symbols: ['any'],
      displaySymbol: 'any',
      curveOffset: 45,
      description: 'Remains in trap state for all remaining characters',
      matches: () => true
    }
  ],
  presetInputs: [
    { label: 'count_1', value: 'count_1', expected: 'accept', notes: 'Valid identifier with letters, underscore, digit' },
    { label: '_sys_init', value: '_sys_init', expected: 'accept', notes: 'Valid identifier starting with underscore' },
    { label: 'totalSum', value: 'totalSum', expected: 'accept', notes: 'Standard camelCase identifier' },
    { label: '9count', value: '9count', expected: 'reject', notes: 'Invalid: Starts with a digit' },
    { label: 'user-name', value: 'user-name', expected: 'reject', notes: 'Invalid: Hyphen is not permitted' }
  ]
};

// 2. Integer Literal DFA
export const INTEGER_DFA: DfaModel = {
  id: 'integer',
  title: 'Integer Literal DFA (Dec / Hex / Octal)',
  tokenType: 'INTEGER_LITERAL',
  description: 'Recognizes decimal integers (42), hex (0x2F), and octal (0755) constants.',
  formalDefinition: {
    states: ['q0', 'q_zero', 'q_dec', 'q_hex_pre', 'q_hex', 'q_oct', 'q_trap'],
    alphabet: '0-9, x, X, a-f, A-F',
    initialState: 'q0',
    acceptingStates: ['q_zero', 'q_dec', 'q_hex', 'q_oct']
  },
  nodes: [
    { id: 'q0', label: 'q0', subLabel: 'Start', x: 80, y: 190, isInitial: true, description: 'Initial state before scanning digit.' },
    { id: 'q_zero', label: 'q_zero', subLabel: 'Zero / Prefix', x: 250, y: 120, isAccepting: true, description: 'Single 0 or radix prefix base.' },
    { id: 'q_dec', label: 'q_dec', subLabel: 'Decimal Int', x: 250, y: 280, isAccepting: true, description: 'Standard decimal constant (1-9 base).' },
    { id: 'q_hex_pre', label: 'q_hpre', subLabel: 'Hex Prefix', x: 420, y: 60, description: 'Saw 0x or 0X; awaiting hex digit.' },
    { id: 'q_hex', label: 'q_hex', subLabel: 'Hex Int', x: 580, y: 60, isAccepting: true, description: 'Valid hexadecimal integer constant.' },
    { id: 'q_oct', label: 'q_oct', subLabel: 'Octal Int', x: 420, y: 180, isAccepting: true, description: 'Valid octal integer constant.' },
    { id: 'q_trap', label: 'q_err', subLabel: 'Trap State', x: 420, y: 340, description: 'Malformed numeric literal trap.' }
  ],
  transitions: [
    {
      id: 't-q0-zero',
      from: 'q0',
      to: 'q_zero',
      symbols: ['0'],
      displaySymbol: "'0'",
      description: 'Zero digit read. May be 0, hex (0x), or octal (0..)',
      matches: (c) => c === '0'
    },
    {
      id: 't-q0-dec',
      from: 'q0',
      to: 'q_dec',
      symbols: ['[1-9]'],
      displaySymbol: '[1-9]',
      description: 'Non-zero digit read; entered decimal mode',
      matches: (c) => /^[1-9]$/.test(c)
    },
    {
      id: 't-dec-dec',
      from: 'q_dec',
      to: 'q_dec',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      curveOffset: 40,
      description: 'Additional decimal digits',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-zero-hexpre',
      from: 'q_zero',
      to: 'q_hex_pre',
      symbols: ['x', 'X'],
      displaySymbol: "'x' | 'X'",
      description: 'Hexadecimal prefix detected',
      matches: (c) => c === 'x' || c === 'X'
    },
    {
      id: 't-hexpre-hex',
      from: 'q_hex_pre',
      to: 'q_hex',
      symbols: ['[0-9a-fA-F]'],
      displaySymbol: '[0-9a-fA-F]',
      description: 'First hex digit read',
      matches: (c) => /^[0-9a-fA-F]$/.test(c)
    },
    {
      id: 't-hex-hex',
      from: 'q_hex',
      to: 'q_hex',
      symbols: ['[0-9a-fA-F]'],
      displaySymbol: '[0-9a-fA-F]',
      curveOffset: -40,
      description: 'Further hexadecimal digits',
      matches: (c) => /^[0-9a-fA-F]$/.test(c)
    },
    {
      id: 't-zero-oct',
      from: 'q_zero',
      to: 'q_oct',
      symbols: ['[0-7]'],
      displaySymbol: '[0-7]',
      description: 'Octal digit follows leading 0',
      matches: (c) => /^[0-7]$/.test(c)
    },
    {
      id: 't-oct-oct',
      from: 'q_oct',
      to: 'q_oct',
      symbols: ['[0-7]'],
      displaySymbol: '[0-7]',
      curveOffset: 40,
      description: 'Further octal digits',
      matches: (c) => /^[0-7]$/.test(c)
    },
    {
      id: 't-oct-trap',
      from: 'q_oct',
      to: 'q_trap',
      symbols: ['8', '9'],
      displaySymbol: "'8' | '9'",
      description: '8 and 9 are invalid in octal constants',
      matches: (c) => c === '8' || c === '9'
    },
    {
      id: 't-any-trap',
      from: 'q0',
      to: 'q_trap',
      symbols: ['other'],
      displaySymbol: 'other',
      description: 'Not a digit',
      matches: (c) => !/^[0-9]$/.test(c)
    }
  ],
  presetInputs: [
    { label: '42', value: '42', expected: 'accept', notes: 'Decimal integer constant' },
    { label: '0x2F4A', value: '0x2F4A', expected: 'accept', notes: 'Hexadecimal constant' },
    { label: '0755', value: '0755', expected: 'accept', notes: 'Octal constant' },
    { label: '0', value: '0', expected: 'accept', notes: 'Single zero integer' },
    { label: '0789', value: '0789', expected: 'reject', notes: 'Invalid: 8 and 9 are not octal digits' },
    { label: '0xZZ', value: '0xZZ', expected: 'reject', notes: 'Invalid: Z is not a hex digit' }
  ]
};

// 3. Floating-Point Number DFA
export const FLOAT_DFA: DfaModel = {
  id: 'float',
  title: 'Floating-Point Literal DFA',
  tokenType: 'FLOAT_LITERAL',
  description: 'Recognizes fractional decimals (3.1415) and scientific notation (1.5e-10).',
  formalDefinition: {
    states: ['q0', 'q_int', 'q_dot', 'q_frac', 'q_exp', 'q_sign', 'q_eval', 'q_trap'],
    alphabet: '0-9, ., e, E, +, -',
    initialState: 'q0',
    acceptingStates: ['q_frac', 'q_eval']
  },
  nodes: [
    { id: 'q0', label: 'q0', subLabel: 'Start', x: 70, y: 190, isInitial: true, description: 'Start state.' },
    { id: 'q_int', label: 'q_int', subLabel: 'Whole Digits', x: 210, y: 190, description: 'Whole number integer part.' },
    { id: 'q_dot', label: 'q_dot', subLabel: 'Dot Read', x: 350, y: 190, description: 'Decimal point read; requires fractional digits.' },
    { id: 'q_frac', label: 'q_frac', subLabel: 'Float Accept', x: 490, y: 190, isAccepting: true, description: 'Valid floating point literal.' },
    { id: 'q_exp', label: 'q_exp', subLabel: 'Exponent', x: 420, y: 320, description: 'Saw e/E exponential indicator.' },
    { id: 'q_sign', label: 'q_sign', subLabel: 'Exp Sign', x: 560, y: 320, description: 'Saw + or - exponent sign.' },
    { id: 'q_eval', label: 'q_eval', subLabel: 'Sci Float Accept', x: 680, y: 250, isAccepting: true, description: 'Valid float with scientific exponent.' },
    { id: 'q_trap', label: 'q_err', subLabel: 'Trap State', x: 280, y: 340, description: 'Malformed float trap state.' }
  ],
  transitions: [
    {
      id: 't-q0-int',
      from: 'q0',
      to: 'q_int',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      description: 'First digit of whole part',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-int-int',
      from: 'q_int',
      to: 'q_int',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      curveOffset: -40,
      description: 'Subsequent whole part digits',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-int-dot',
      from: 'q_int',
      to: 'q_dot',
      symbols: ['.'],
      displaySymbol: "'.'",
      description: 'Decimal point transition',
      matches: (c) => c === '.'
    },
    {
      id: 't-dot-frac',
      from: 'q_dot',
      to: 'q_frac',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      description: 'Fractional digit read after decimal point',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-frac-frac',
      from: 'q_frac',
      to: 'q_frac',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      curveOffset: -40,
      description: 'Additional fractional digits',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-frac-exp',
      from: 'q_frac',
      to: 'q_exp',
      symbols: ['e', 'E'],
      displaySymbol: "'e' | 'E'",
      description: 'Scientific exponent transition',
      matches: (c) => c === 'e' || c === 'E'
    },
    {
      id: 't-exp-sign',
      from: 'q_exp',
      to: 'q_sign',
      symbols: ['+', '-'],
      displaySymbol: "'+' | '-'",
      description: 'Signed exponent prefix (+ or -)',
      matches: (c) => c === '+' || c === '-'
    },
    {
      id: 't-exp-eval',
      from: 'q_exp',
      to: 'q_eval',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      description: 'Direct exponent digits',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-sign-eval',
      from: 'q_sign',
      to: 'q_eval',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      description: 'Exponent digits after sign',
      matches: (c) => /^[0-9]$/.test(c)
    },
    {
      id: 't-eval-eval',
      from: 'q_eval',
      to: 'q_eval',
      symbols: ['[0-9]'],
      displaySymbol: '[0-9]',
      curveOffset: -40,
      description: 'Additional exponent digits',
      matches: (c) => /^[0-9]$/.test(c)
    }
  ],
  presetInputs: [
    { label: '3.1415', value: '3.1415', expected: 'accept', notes: 'Standard decimal floating-point' },
    { label: '2.5e+3', value: '2.5e+3', expected: 'accept', notes: 'Scientific notation with positive exponent' },
    { label: '1.602e-19', value: '1.602e-19', expected: 'accept', notes: 'Scientific notation with negative exponent' },
    { label: '3.', value: '3.', expected: 'reject', notes: 'Incomplete: Missing digits after decimal point in strict DFA' },
    { label: '3.14.15', value: '3.14.15', expected: 'reject', notes: 'Malformed: Multiple decimal points' }
  ]
};

// 4. Relational Operators DFA
export const RELATIONAL_DFA: DfaModel = {
  id: 'relational',
  title: 'Relational Operators DFA (<, <=, >, >=, ==, !=)',
  tokenType: 'OPERATOR',
  description: 'Models lookahead disambiguation between single and two-character comparison operators.',
  formalDefinition: {
    states: ['q0', 'q_lt', 'q_lte', 'q_gt', 'q_gte', 'q_eq', 'q_eq2', 'q_excl', 'q_neq', 'q_trap'],
    alphabet: '<, >, =, !',
    initialState: 'q0',
    acceptingStates: ['q_lt', 'q_lte', 'q_gt', 'q_gte', 'q_eq2', 'q_neq']
  },
  nodes: [
    { id: 'q0', label: 'q0', subLabel: 'Start', x: 80, y: 220, isInitial: true, description: 'Start state.' },
    { id: 'q_lt', label: 'q_lt', subLabel: "Accept '<'", x: 260, y: 80, isAccepting: true, description: "Less-than operator '<'." },
    { id: 'q_lte', label: 'q_lte', subLabel: "Accept '<='", x: 460, y: 80, isAccepting: true, description: "Less-than-or-equal '<='." },
    { id: 'q_gt', label: 'q_gt', subLabel: "Accept '>'", x: 260, y: 190, isAccepting: true, description: "Greater-than operator '>'." },
    { id: 'q_gte', label: 'q_gte', subLabel: "Accept '>='", x: 460, y: 190, isAccepting: true, description: "Greater-than-or-equal '>='." },
    { id: 'q_eq', label: 'q_eq', subLabel: "Saw '='", x: 260, y: 300, description: "Assignment '=' or start of equality '=='." },
    { id: 'q_eq2', label: 'q_eq2', subLabel: "Accept '=='", x: 460, y: 300, isAccepting: true, description: "Equality relational operator '=='." },
    { id: 'q_excl', label: 'q_excl', subLabel: "Saw '!'", x: 260, y: 400, description: "Logical NOT '!' or start of inequality '!='." },
    { id: 'q_neq', label: 'q_neq', subLabel: "Accept '!='", x: 460, y: 400, isAccepting: true, description: "Inequality relational operator '!='." }
  ],
  transitions: [
    { id: 't-q0-lt', from: 'q0', to: 'q_lt', symbols: ['<'], displaySymbol: "'<'", description: "Read '<'", matches: (c) => c === '<' },
    { id: 't-lt-lte', from: 'q_lt', to: 'q_lte', symbols: ['='], displaySymbol: "'='", description: "Lookahead '=' gives '<='", matches: (c) => c === '=' },
    { id: 't-q0-gt', from: 'q0', to: 'q_gt', symbols: ['>'], displaySymbol: "'>'", description: "Read '>'", matches: (c) => c === '>' },
    { id: 't-gt-gte', from: 'q_gt', to: 'q_gte', symbols: ['='], displaySymbol: "'='", description: "Lookahead '=' gives '>='", matches: (c) => c === '=' },
    { id: 't-q0-eq', from: 'q0', to: 'q_eq', symbols: ['='], displaySymbol: "'='", description: "Read '='", matches: (c) => c === '=' },
    { id: 't-eq-eq2', from: 'q_eq', to: 'q_eq2', symbols: ['='], displaySymbol: "'='", description: "Second '=' gives '=='", matches: (c) => c === '=' },
    { id: 't-q0-excl', from: 'q0', to: 'q_excl', symbols: ['!'], displaySymbol: "'!'", description: "Read '!'", matches: (c) => c === '!' },
    { id: 't-excl-neq', from: 'q_excl', to: 'q_neq', symbols: ['='], displaySymbol: "'='", description: "Lookahead '=' gives '!='", matches: (c) => c === '=' }
  ],
  presetInputs: [
    { label: '<=', value: '<=', expected: 'accept', notes: 'Less than or equal' },
    { label: '==', value: '==', expected: 'accept', notes: 'Equal to comparison' },
    { label: '!=', value: '!=', expected: 'accept', notes: 'Not equal comparison' },
    { label: '>', value: '>', expected: 'accept', notes: 'Strict greater than' },
    { label: '<', value: '<', expected: 'accept', notes: 'Strict less than' }
  ]
};

// 5. Arithmetic & Pointer Operators DFA
export const ARITHMETIC_DFA: DfaModel = {
  id: 'arithmetic',
  title: 'Arithmetic & Structure Pointer DFA (+, ++, +=, -, --, -=, ->)',
  tokenType: 'OPERATOR',
  description: 'Distinguishes addition, increment, compound assignment, and C pointer access (->).',
  formalDefinition: {
    states: ['q0', 'q_plus', 'q_inc', 'q_peq', 'q_minus', 'q_dec', 'q_meq', 'q_arrow'],
    alphabet: '+, -, =, >',
    initialState: 'q0',
    acceptingStates: ['q_plus', 'q_inc', 'q_peq', 'q_minus', 'q_dec', 'q_meq', 'q_arrow']
  },
  nodes: [
    { id: 'q0', label: 'q0', subLabel: 'Start', x: 80, y: 220, isInitial: true, description: 'Start state.' },
    { id: 'q_plus', label: 'q_plus', subLabel: "Accept '+'", x: 260, y: 120, isAccepting: true, description: "Addition operator '+'" },
    { id: 'q_inc', label: 'q_inc', subLabel: "Accept '++'", x: 460, y: 70, isAccepting: true, description: "Pre/post increment '++'" },
    { id: 'q_peq', label: 'q_peq', subLabel: "Accept '+='", x: 460, y: 150, isAccepting: true, description: "Compound addition '+='" },
    { id: 'q_minus', label: 'q_minus', subLabel: "Accept '-'", x: 260, y: 310, isAccepting: true, description: "Subtraction / Negation '-'" },
    { id: 'q_dec', label: 'q_dec', subLabel: "Accept '--'", x: 460, y: 240, isAccepting: true, description: "Decrement operator '--'" },
    { id: 'q_meq', label: 'q_meq', subLabel: "Accept '-='", x: 460, y: 310, isAccepting: true, description: "Compound subtraction '-='" },
    { id: 'q_arrow', label: 'q_arrow', subLabel: "Accept '->'", x: 460, y: 380, isAccepting: true, description: "Structure pointer member access '->'" }
  ],
  transitions: [
    { id: 't-q0-plus', from: 'q0', to: 'q_plus', symbols: ['+'], displaySymbol: "'+'", description: "Read '+'", matches: (c) => c === '+' },
    { id: 't-plus-inc', from: 'q_plus', to: 'q_inc', symbols: ['+'], displaySymbol: "'+'", description: "Second '+' gives '++'", matches: (c) => c === '+' },
    { id: 't-plus-peq', from: 'q_plus', to: 'q_peq', symbols: ['='], displaySymbol: "'='", description: "Followed by '=' gives '+='", matches: (c) => c === '=' },
    { id: 't-q0-minus', from: 'q0', to: 'q_minus', symbols: ['-'], displaySymbol: "'-'", description: "Read '-'", matches: (c) => c === '-' },
    { id: 't-minus-dec', from: 'q_minus', to: 'q_dec', symbols: ['-'], displaySymbol: "'-'", description: "Second '-' gives '--'", matches: (c) => c === '-' },
    { id: 't-minus-meq', from: 'q_minus', to: 'q_meq', symbols: ['='], displaySymbol: "'='", description: "Followed by '=' gives '-='", matches: (c) => c === '=' },
    { id: 't-minus-arrow', from: 'q_minus', to: 'q_arrow', symbols: ['>'], displaySymbol: "'>'", description: "Followed by '>' gives pointer member '->'", matches: (c) => c === '>' }
  ],
  presetInputs: [
    { label: '++', value: '++', expected: 'accept', notes: 'Increment operator' },
    { label: '->', value: '->', expected: 'accept', notes: 'Structure member pointer operator' },
    { label: '+=', value: '+=', expected: 'accept', notes: 'Addition assignment' },
    { label: '--', value: '--', expected: 'accept', notes: 'Decrement operator' },
    { label: '+', value: '+', expected: 'accept', notes: 'Addition operator' }
  ]
};

export const ALL_DFA_MODELS: DfaModel[] = [
  IDENTIFIER_DFA,
  INTEGER_DFA,
  FLOAT_DFA,
  RELATIONAL_DFA,
  ARITHMETIC_DFA
];

// DFA Simulation Execution Function
export function simulateDfa(model: DfaModel, inputStr: string): DfaStep[] {
  const steps: DfaStep[] = [];
  let currentStateId = model.formalDefinition.initialState;
  const chars = Array.from(inputStr);

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const availableTransitions = model.transitions.filter(t => t.from === currentStateId);
    const matchedTransition = availableTransitions.find(t => t.matches(c));

    if (!matchedTransition) {
      // No transition matches -> Transition to trap or reject
      steps.push({
        stepNumber: i + 1,
        char: c,
        fromStateId: currentStateId,
        toStateId: 'q_trap',
        isAccepted: false,
        isRejected: true,
        explanation: `No valid transition from state '${currentStateId}' for input character '${c}'. Input rejected.`
      });
      currentStateId = 'q_trap';
      break;
    }

    const nextStateId = matchedTransition.to;
    const isTrapState = nextStateId === 'q_trap';
    const isLastChar = i === chars.length - 1;
    const isAccepted = isLastChar && model.formalDefinition.acceptingStates.includes(nextStateId);

    steps.push({
      stepNumber: i + 1,
      char: c,
      fromStateId: currentStateId,
      toStateId: nextStateId,
      isAccepted,
      isRejected: isTrapState || (isLastChar && !model.formalDefinition.acceptingStates.includes(nextStateId)),
      explanation: `δ(${currentStateId}, '${c}') → ${nextStateId} : ${matchedTransition.description}`,
      transitionId: matchedTransition.id
    });

    currentStateId = nextStateId;
    if (isTrapState) break;
  }

  return steps;
}
