export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CompilerLesson {
  id: string;
  chapterNumber: string;
  title: string;
  tagline: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    keyPoints?: string[];
    codeExample?: string;
  }[];
  quiz: QuizQuestion[];
}

export const COMPILER_LESSONS: CompilerLesson[] = [
  {
    id: 'intro-compiler',
    chapterNumber: '01',
    title: 'Introduction to Compilers & Translators',
    tagline: 'Bridging the semantic gap between human logic and binary hardware.',
    summary: 'A compiler is a specialized software program that translates a program written in a high-level source language into an equivalent target machine or assembly code.',
    sections: [
      {
        heading: 'What is a Compiler?',
        content: 'A compiler translates computer programs written in human-readable programming languages (such as C, C++, Java, Rust) into machine code (binary zeros and ones) or an intermediate bytecode (such as Java Virtual Machine bytecode). Unlike interpreters that translate and execute code line-by-line at runtime, compilers translate the entire program before execution, allowing deep static optimizations.',
        keyPoints: [
          'High execution speed: Compiled binaries execute directly on CPU silicon.',
          'Static error detection: Lexical, syntactic, and type violations are caught prior to deployment.',
          'Cross-compilation: Modern compilers can target x86_64, ARM64, and WebAssembly from one codebase.'
        ]
      },
      {
        heading: 'The Analysis-Synthesis Model',
        content: 'Every modern compiler is architected into two foundational halves: the Front-End (Analysis) and the Back-End (Synthesis). The front-end breaks down source code into an Intermediate Representation (IR), verifying lexical, grammatical, and semantic rules. The back-end takes this IR, performs target-independent and machine-dependent optimizations, and emits target machine instructions.',
        keyPoints: [
          'Front-End (Language-Dependent): Lexical Analysis, Syntax Analysis, Semantic Analysis.',
          'Intermediate Representation (IR): Decouples language front-end from hardware targets (e.g. LLVM IR).',
          'Back-End (Machine-Dependent): Instruction Selection, Register Allocation, Instruction Scheduling.'
        ]
      }
    ],
    quiz: [
      {
        id: 'q1-1',
        question: 'Which phase of a compiler decouples source language syntax from target machine architecture?',
        options: ['Lexical Analyzer', 'Intermediate Representation (IR)', 'Register Allocator', 'Target Code Generator'],
        correctIndex: 1,
        explanation: 'Intermediate Representation (IR) serves as the universal pivot separating the language-dependent front-end from the machine-dependent back-end.'
      },
      {
        id: 'q1-2',
        question: 'How does a compiler differ fundamentally from an interpreter?',
        options: [
          'A compiler executes code directly without translation.',
          'A compiler translates the entire source program into target code prior to runtime.',
          'An interpreter always produces faster machine code than a compiler.',
          'Compilers do not perform lexical or syntax analysis.'
        ],
        correctIndex: 1,
        explanation: 'Compilers translate the entire source program into machine/target code ahead of time, whereas interpreters parse and evaluate instructions dynamically during execution.'
      }
    ]
  },
  {
    id: 'compiler-phases',
    chapterNumber: '02',
    title: 'The Six Classical Phases of a Compiler',
    tagline: 'A systematic pipeline transforming raw character streams into machine code.',
    summary: 'From character stream to optimized binary: understanding how compiler phases collaborate through the Symbol Table and Error Handler.',
    sections: [
      {
        heading: 'Sequential Pipeline of Phases',
        content: 'Compilers process code across 6 structured phases. Each phase takes the output of the preceding phase, enforces specific language invariants, and enriches the program representation.',
        keyPoints: [
          '1. Lexical Analysis (Scanner): Converts raw character stream into token stream; strips comments/whitespace.',
          '2. Syntax Analysis (Parser): Groups tokens into a Parse Tree / Abstract Syntax Tree (AST) using Context-Free Grammars.',
          '3. Semantic Analysis (Type Checker): Enforces type compatibility, scope resolution, and array bounds.',
          '4. Intermediate Code Generation (ICG): Generates three-address code (TAC) or quadruples.',
          '5. Code Optimization: Eliminates dead code, unrolls loops, propagates constants, and optimizes register use.',
          '6. Code Generation: Emits relocatable machine code or assembly instructions.'
        ]
      },
      {
        heading: 'Symbol Table & Error Handler',
        content: 'Two cross-cutting facilities interact with every phase: The Symbol Table stores identifier attributes (type, scope, memory offset, signature), while the Error Handler coordinates meaningful diagnostic feedback with exact source coordinates.',
        keyPoints: [
          'Symbol Table is populated primarily during Lexical and Syntax analysis, and queried during Semantic analysis.',
          'Error Handler preserves source positions (line, column) so diagnostics can be traced back to author code.'
        ]
      }
    ],
    quiz: [
      {
        id: 'q2-1',
        question: 'Which compiler phase is directly responsible for verifying type compatibility (e.g. preventing adding a string to an integer without cast)?',
        options: ['Lexical Analysis', 'Syntax Analysis', 'Semantic Analysis', 'Code Generation'],
        correctIndex: 2,
        explanation: 'Semantic Analysis performs static type checking and ensures operations obey language typing rules.'
      }
    ]
  },
  {
    id: 'lexical-analysis-core',
    chapterNumber: '03',
    title: 'Role of the Lexical Analyzer (Scanner)',
    tagline: 'The first gatekeeper of compiler construction.',
    summary: 'The lexical analyzer reads source code character-by-character, recognizes language vocabulary, eliminates irrelevant characters, and outputs a stream of structured tokens.',
    sections: [
      {
        heading: 'Core Responsibilities of the Scanner',
        content: 'The lexical analyzer is the only phase that processes raw source characters. It performs several critical duties: identifying token types, mapping lexemes to integer token IDs, stripping comments and redundant whitespace, recording line and column coordinates for error reports, and entering new identifiers into the Symbol Table.',
        keyPoints: [
          'Eliminating comments and whitespace (spaces, tabs, newlines).',
          'Correlating compiler diagnostics with source line and column numbers.',
          'Expanding macros / preprocessing directives (in languages like C/C++).',
          'Recognizing constants, keywords, identifiers, and operators.'
        ]
      },
      {
        heading: 'Why Separate Lexical Analysis from Syntax Analysis?',
        content: 'Separating lexical analysis from parsing is a foundational compiler engineering decision. It simplifies parser design by abstracting away whitespace and comment handling, enhances compiler portability, and drastically increases compiler performance because character reading can be optimized using specialized buffer techniques.',
        keyPoints: [
          'Simpler grammar: The parser does not need rules for comments, whitespace, or numeric digit combinations.',
          'Performance efficiency: Lexical scanners use specialized double-buffering and fast DFA state transitions.',
          'Portability: Device-specific character encodings (ASCII, UTF-8, EBCDIC) are localized to the scanner.'
        ]
      }
    ],
    quiz: [
      {
        id: 'q3-1',
        question: 'Why is lexical analysis separated from syntax parsing in modern compilers?',
        options: [
          'To make the grammar context-sensitive.',
          'To simplify grammar design, isolate whitespace/comment handling, and maximize scanning throughput.',
          'Because parsers cannot process numbers.',
          'To prevent the compiler from generating intermediate representation.'
        ],
        correctIndex: 1,
        explanation: 'Separating lexical analysis simplifies grammar definitions and enables hardware-efficient character buffering.'
      }
    ]
  },
  {
    id: 'tokens-patterns-lexemes',
    chapterNumber: '04',
    title: 'Tokens, Patterns & Lexemes Explained',
    tagline: 'Clarifying the fundamental trio of compiler lexical theory.',
    summary: 'A clear academic distinction between the abstract token type, the descriptive formal pattern, and the concrete source lexeme.',
    sections: [
      {
        heading: 'Definitions & Differences',
        content: 'Students often confuse tokens, patterns, and lexemes. Here is the formal academic taxonomy:',
        keyPoints: [
          'Token: An abstract category or terminal symbol passed to the parser (e.g. KEYWORD, IDENTIFIER, RELOP, NUMBER).',
          'Lexeme: The exact sequence of characters in the source text that matches the pattern for a token (e.g. "count", "3.1415", "<=").',
          'Pattern: The descriptive rule or regular expression defining what characters may constitute a token (e.g. [a-zA-Z_][a-zA-Z0-9_]*).'
        ],
        codeExample: `// Source code example:
float pi = 3.14159;

// Breakdown:
// Lexeme: 'float'    -> Pattern: 'float'                  -> Token: KEYWORD
// Lexeme: 'pi'       -> Pattern: [a-zA-Z_][a-zA-Z0-9_]*   -> Token: IDENTIFIER
// Lexeme: '='        -> Pattern: '='                      -> Token: ASSIGN_OP
// Lexeme: '3.14159'  -> Pattern: [0-9]+\\.[0-9]+          -> Token: FLOAT_LITERAL
// Lexeme: ';'        -> Pattern: ';'                      -> Token: SEPARATOR`
      }
    ],
    quiz: [
      {
        id: 'q4-1',
        question: 'In the code `int total = 100;`, what is the word "total"?',
        options: [
          'A pattern',
          'A lexeme matching the IDENTIFIER pattern',
          'A parser production rule',
          'An intermediate three-address code quad'
        ],
        correctIndex: 1,
        explanation: '"total" is the concrete string (lexeme) present in source code that matches the identifier regular expression pattern.'
      }
    ]
  },
  {
    id: 'finite-automata',
    chapterNumber: '05',
    title: 'Finite Automata: NFA vs DFA',
    tagline: 'The mathematical engines powering token recognition.',
    summary: 'Finite automata are state machines used to determine whether an input string belongs to the language defined by a regular expression.',
    sections: [
      {
        heading: 'Deterministic Finite Automata (DFA)',
        content: 'A DFA is a 5-tuple (Q, Σ, δ, q0, F) where for each state q ∈ Q and input symbol a ∈ Σ, there is exactly one transition δ(q, a) ∈ Q. DFAs have no epsilon (ε) transitions. This deterministic property ensures fast, predictable O(N) linear-time lexical tokenization.',
        keyPoints: [
          'No ambiguous choices: At any state, reading a symbol leads to at most one target state.',
          'No ε-transitions: The machine cannot change states without consuming an input character.',
          'Constant execution time: Each character requires exactly one state table lookup.'
        ]
      },
      {
        heading: 'Non-deterministic Finite Automata (NFA)',
        content: 'An NFA allows multiple next states for a single symbol, and permits ε-transitions (transitions without consuming any input). NFAs are naturally constructed from regular expressions via Thompson’s Construction algorithm, but are usually converted to DFAs via Subset Construction for real-time lexical scanners.',
        keyPoints: [
          'Thompson’s Construction: Translates basic regex operations (concatenation, alternation, Kleene star) into small NFA components.',
          'Subset Construction (Powerset Construction): Converts an NFA with 2^N possible state configurations into an equivalent DFA.'
        ]
      }
    ],
    quiz: [
      {
        id: 'q5-1',
        question: 'What is the primary operational advantage of a DFA over an NFA in a compiler scanner?',
        options: [
          'DFAs can recognize context-free grammars.',
          'DFAs guarantee O(N) recognition time with zero backtracking or parallel branch tracking.',
          'DFAs require fewer states than NFAs in all cases.',
          'DFAs allow ε-transitions without consuming characters.'
        ],
        correctIndex: 1,
        explanation: 'A DFA transitions deterministically to exactly one state per character, running in strict O(N) time without backtracking.'
      }
    ]
  },
  {
    id: 'input-buffering',
    chapterNumber: '06',
    title: 'Input Buffering & Lookahead Strategies',
    tagline: 'High-throughput I/O algorithms from compiler architecture.',
    summary: 'How compilers read gigabytes of source code efficiently using buffer pairs, sentinels, and forward pointer retraction.',
    sections: [
      {
        heading: 'The Need for Input Buffering',
        content: 'Reading characters one-by-one from a disk file using standard OS system calls (read/fgetc) incurs severe kernel context-switching overhead. Compilers avoid this by reading large blocks (e.g. 4096 bytes) into an in-memory buffer.',
        keyPoints: [
          'Block reads: Single system call populates thousands of characters.',
          'Lookahead necessity: Operators like ==, <=, or -> require inspecting subsequent characters before emitting the token.'
        ]
      },
      {
        heading: 'The Two-Buffer Scheme (Buffer Pairs)',
        content: 'To prevent tokens that span buffer boundaries from being split or lost, compilers use two buffers of size N (e.g., 4096 bytes). Characters are read alternately into Buffer 1 and Buffer 2.',
        keyPoints: [
          'lexeme_begin pointer: Points to the first character of the lexeme being recognized.',
          'forward pointer: Scans ahead until a token match is confirmed.',
          'Sentinel character (EOF): Placed at the end of each half-buffer to eliminate the need for checking "if (forward >= buffer_end)" at every character.'
        ],
        codeExample: `// Sentinel Handling Algorithm:
switch (*forward++) {
    case EOF:
        if (forward is at end of first half) {
            reload second half;
            forward = beginning of second half;
        } else if (forward is at end of second half) {
            reload first half;
            forward = beginning of first half;
        } else {
            // Real End-of-File reached
            terminateScan();
        }
        break;
    // ... handle normal characters ...
}`
      }
    ],
    quiz: [
      {
        id: 'q6-1',
        question: 'What is the primary function of a Sentinel character placed at the end of each input buffer?',
        options: [
          'To encrypt the source code.',
          'To eliminate the inner loop buffer boundary check at every character, checking only when EOF is encountered.',
          'To mark the beginning of a multi-line comment.',
          'To force garbage collection in the compiler.'
        ],
        correctIndex: 1,
        explanation: 'Sentinels reduce two tests per character (EOF check and buffer boundary check) to a single test on average.'
      }
    ]
  }
];
