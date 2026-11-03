export interface RegexPattern {
  id: string;
  name: string;
  category: string;
  pattern: string;
  flags: string;
  description: string;
  thompsonExplanation: string;
  components: {
    segment: string;
    meaning: string;
    automatonEffect: string;
  }[];
  sampleMatches: string[];
  sampleNonMatches: string[];
}

export const REGEX_PATTERNS: RegexPattern[] = [
  {
    id: 'regex-id',
    name: 'Identifier Pattern',
    category: 'Syntax Rules',
    pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
    flags: '',
    description: 'Matches variable, function, and class identifiers in C and Java.',
    thompsonExplanation: 'Thompson’s construction generates an initial NFA state with transitions on letters or underscore to state 1, followed by a self-loop on alphanumerics/underscores.',
    components: [
      { segment: '^', meaning: 'Anchor: Start of string or token', automatonEffect: 'Points to Initial Start State q0' },
      { segment: '[a-zA-Z_]', meaning: 'First character must be an uppercase letter, lowercase letter, or underscore', automatonEffect: 'Edge from q0 to accepting state q1' },
      { segment: '[a-zA-Z0-9_]*', meaning: 'Zero or more alphanumeric characters or underscores', automatonEffect: 'Self-loop transition on state q1 using Kleene star' },
      { segment: '$', meaning: 'Anchor: End of string', automatonEffect: 'Verifies state q1 is an accepting state at EOF' }
    ],
    sampleMatches: ['count', '_temp', 'sum10', 'MAX_BUFFER_SIZE', 'idx'],
    sampleNonMatches: ['123var', 'my-var', 'total$', 'class name']
  },
  {
    id: 'regex-dec-int',
    name: 'Decimal Integer Constant',
    category: 'Constants',
    pattern: '^(0|[1-9][0-9]*)[uUlL]{0,2}$',
    flags: '',
    description: 'Matches decimal integers without leading zeros (except single 0), with optional unsigned/long suffixes.',
    thompsonExplanation: 'Splits via alternation (|) into either a standalone 0, or a non-zero digit 1-9 concatenated with a loop over 0-9, leading to an optional suffix state.',
    components: [
      { segment: '0', meaning: 'Single zero digit integer', automatonEffect: 'Direct branch from start state to accept state' },
      { segment: '|', meaning: 'Alternation (OR operator)', automatonEffect: 'Epsilon (ε) branching into two alternative paths' },
      { segment: '[1-9][0-9]*', meaning: 'Non-zero digit followed by arbitrary digits (prohibits octal-like leading zeros)', automatonEffect: 'Requires 1-9 to escape start state, loops on 0-9' },
      { segment: '[uUlL]{0,2}', meaning: 'Optional integer size/sign suffixes (u, U, l, L, ul, LL)', automatonEffect: 'Optional transition to accepting terminal states' }
    ],
    sampleMatches: ['0', '42', '1000', '65535U', '1000000L'],
    sampleNonMatches: ['052 (octal)', '12a', '100.5', '1_000']
  },
  {
    id: 'regex-float',
    name: 'Floating-Point Constant',
    category: 'Constants',
    pattern: '^([0-9]+\\.[0-9]*|[0-9]*\\.[0-9]+)([eE][+-]?[0-9]+)?[fFlL]?$',
    flags: '',
    description: 'Matches real floating-point constants including fractional points and scientific exponential notation.',
    thompsonExplanation: 'Constructs an NFA with fractional dot transitions and an optional branch for exponential powers of 10 with sign evaluation.',
    components: [
      { segment: '[0-9]+\\.[0-9]*', meaning: 'Digits before dot, optional digits after (e.g., 3.14 or 3.)', automatonEffect: 'Scans integer digits then transitions across dot' },
      { segment: '| [0-9]*\\.[0-9]+', meaning: 'Optional digits before dot, mandatory digits after (e.g., .5)', automatonEffect: 'Alternative path starting directly with dot' },
      { segment: '([eE][+-]?[0-9]+)?', meaning: 'Optional exponent section with e/E, optional sign (+/-), and exponent digits', automatonEffect: 'Epsilon skip or mandatory transition through exponent states' },
      { segment: '[fFlL]?', meaning: 'Optional float (f/F) or long double (l/L) type specifier', automatonEffect: 'Final token classification state' }
    ],
    sampleMatches: ['3.14159', '0.5', '.75', '2.5e3', '1.602e-19', '10.0f'],
    sampleNonMatches: ['3', '12.34.56', 'e10', '3.14e']
  },
  {
    id: 'regex-hex',
    name: 'Hexadecimal Constant',
    category: 'Constants',
    pattern: '^0[xX][0-9a-fA-F]+[uUlL]{0,2}$',
    flags: '',
    description: 'Matches hexadecimal integer constants starting with 0x or 0X.',
    thompsonExplanation: 'Linear concatenation of prefix 0, then x/X, followed by at least one hex digit in range 0-9, a-f, or A-F.',
    components: [
      { segment: '0[xX]', meaning: 'Mandatory hexadecimal base prefix 0x or 0X', automatonEffect: 'Two sequential transitions from q0 to prefix state' },
      { segment: '[0-9a-fA-F]+', meaning: 'One or more valid hexadecimal digits', automatonEffect: 'Transition to accepting state, followed by self-loop' },
      { segment: '[uUlL]{0,2}', meaning: 'Optional suffix specifiers', automatonEffect: 'Suffix termination transitions' }
    ],
    sampleMatches: ['0x0', '0x2F4A', '0XFF', '0x1a2bUL', '0xDEADBEEF'],
    sampleNonMatches: ['0x', '0xG12', '123', '0X']
  },
  {
    id: 'regex-relational',
    name: 'Relational Operators',
    category: 'Operators',
    pattern: '^(==|!=|<=|>=|<|>)$',
    flags: '',
    description: 'Matches binary comparison and relational operators.',
    thompsonExplanation: 'Finite set of branches with common lookahead prefix states for <, >, =, and !.',
    components: [
      { segment: '<= | <', meaning: 'Less-than-or-equal or strict less-than', automatonEffect: 'State on < with lookahead on = or delimiter retract' },
      { segment: '>= | >', meaning: 'Greater-than-or-equal or strict greater-than', automatonEffect: 'State on > with lookahead on = or delimiter retract' },
      { segment: '==', meaning: 'Equality test (two consecutive equals)', automatonEffect: 'Two consecutive = transitions' },
      { segment: '!=', meaning: 'Inequality comparison', automatonEffect: 'Transition ! followed by mandatory =' }
    ],
    sampleMatches: ['<', '<=', '>', '>=', '==', '!='],
    sampleNonMatches: ['===', '<>', '!', '=']
  },
  {
    id: 'regex-string',
    name: 'String Literal Pattern',
    category: 'Literals',
    pattern: '^"([^"\\\\\n]|\\\\.)*"$',
    flags: '',
    description: 'Matches double-quoted strings with support for escaped characters (\\n, \\t, \\", \\\\).',
    thompsonExplanation: 'Opening quote leads to loop that consumes non-quotes/non-slashes, or follows backslash into an escape-state before returning to loop, terminating on closing quote.',
    components: [
      { segment: '"', meaning: 'Opening quotation delimiter', automatonEffect: 'Transitions from normal state into in-string state' },
      { segment: '[^"\\\\\n]', meaning: 'Any character except double quote, backslash, or newline', automatonEffect: 'Safe consumption self-loop inside string state' },
      { segment: '\\\\.', meaning: 'Escape sequence: Backslash followed by escaped character', automatonEffect: 'Two-step transition via intermediate escape state' },
      { segment: '"', meaning: 'Closing quotation delimiter', automatonEffect: 'Transitions to accepting string literal token state' }
    ],
    sampleMatches: ['"Hello, World!"', '""', '"Line 1\\nLine 2"', '"Contains \\"quotes\\""'],
    sampleNonMatches: ['"Unclosed string', 'Single \'quotes\'', '"Multiline\nwithout escape"']
  },
  {
    id: 'regex-comment',
    name: 'Comment Tokens (Single & Multi-line)',
    category: 'Comments',
    pattern: '^(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)$',
    flags: '',
    description: 'Matches single-line comments (//...) and multi-line comments (/*...*/).',
    thompsonExplanation: 'Slash leads to lookahead. Slash + slash absorbs until newline. Slash + star absorbs until star + slash.',
    components: [
      { segment: '\\/\\/.*', meaning: 'Double slash followed by arbitrary characters until end of line', automatonEffect: 'Consumes line buffer without emitting program tokens' },
      { segment: '\\/\\*[\\s\\S]*?\\*\\/', meaning: 'Multi-line comment enclosed between /* and */', automatonEffect: 'Transitions into block comment state until */ delimiter' }
    ],
    sampleMatches: ['// Single line comment', '/* Simple block */', '/* Multi\nline\ncomment */'],
    sampleNonMatches: ['/ Division operator', '/* Unterminated block comment', '*/ Orphaned close']
  }
];
