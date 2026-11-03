# LexiScan – Interactive Lexical Analyzer & Tokenization System

**Course Category:** Compiler Design / System Software — Project-Based Learning (PBL)  
**Target Languages:** C (C99 / C11) & Java (Standard Lexical Rules)  
**Architecture:** Full-Stack Node.js/Express Engine + React 19 + TypeScript + Tailwind CSS

---

## 1. Project Overview

**LexiScan** is an interactive, academically rigorous lexical analysis system designed to demonstrate how the first phase of a modern compiler operates. It processes raw source code character-by-character, recognizes language vocabulary, eliminates comments and whitespace, tracks source coordinates (lines and columns), and synthesizes a sequence of structured tokens for the downstream parser.

Beyond traditional scanning, LexiScan provides live interactive visualizations of:
1. **Deterministic Finite Automata (DFA)** state machines for identifiers, numeric constants, and operators.
2. **Input Buffering with Sentinels (Dragon Book Two-Buffer Scheme)** with `lexeme_begin` and `forward` pointers.
3. **Regular Expressions Laboratory** with component decompositions and Thompson’s Construction mappings.
4. **Comprehensive Compiler Design Lessons** with interactive chapter assessments.
5. **Token Diff & History Comparison Engine** for side-by-side run analyses.

---

## 2. Lexical Analyzer Engine Specification

The Lexical Analyzer (`src/lib/lexer.ts`) implements a deterministic character-by-character scanner.

### Token Structure
Every token emitted by LexiScan is an object containing:
- `tokenId`: Unique incremental integer identifier (`1, 2, ...`).
- `lexeme`: Exact string character sequence extracted from source text.
- `type`: Primary token classification (`KEYWORD`, `IDENTIFIER`, `OPERATOR`, `INTEGER_LITERAL`, `FLOAT_LITERAL`, `STRING_LITERAL`, `CHAR_LITERAL`, `SEPARATOR`, `COMMENT`, `PREPROCESSOR`).
- `subType`: Specific subclass (e.g. `Arithmetic Operator`, `Structure Pointer Operator`, `Hexadecimal Integer`, `Octal Integer`, `Multi-line Comment`).
- `line`: 1-based line number where the token begins.
- `column`: 1-based column offset.
- `startIndex`: Absolute character offset in source stream.
- `endIndex`: End character offset in source stream.

### Recognized Token Classes

| Token Category | Examples / Regular Expression | Description |
| :--- | :--- | :--- |
| **Keywords (C)** | `auto, break, case, char, const, continue, default, do, double, else, enum, extern, float, for, goto, if, inline, int, long, register, restrict, return, short, signed, sizeof, static, struct, switch, typedef, union, unsigned, void, volatile, while, _Bool` | Reserved language keywords in C standard |
| **Keywords (Java)** | `abstract, assert, boolean, break, byte, case, catch, char, class, const, continue, default, do, double, else, enum, extends, final, finally, float, for, goto, if, implements, import, instanceof, int, interface, long, native, new, package, private, protected, public, return, short, static, super, switch, synchronized, this, throw, throws, try, void, volatile, while` | Reserved language keywords in Java |
| **Identifiers** | `[a-zA-Z_][a-zA-Z0-9_]*` (Java also permits `$`) | User-defined variable, function, struct, and class names |
| **Decimal Integer** | `(0 \| [1-9][0-9]*)[uUlL]*` | Standard integer constants with optional sign/size suffixes |
| **Hexadecimal Integer** | `0[xX][0-9a-fA-F]+[uUlL]*` | Base-16 numbers prefixed by `0x` or `0X` |
| **Octal Integer** | `0[0-7]+[uUlL]*` | Base-8 numbers prefixed by `0` followed by digits 0–7 |
| **Binary Integer** | `0[bB][01]+` | Base-2 numbers prefixed by `0b` or `0B` |
| **Floating-Point** | `[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?[fFlL]?` | Real numbers with decimal point or scientific exponent |
| **String Literals** | `"([^"\\] \| \\.)*"` | Enclosed in double quotes with escape character handling |
| **Character Literals** | `'([^'\\] \| \\.)'` | Enclosed in single quotes with escape character handling |
| **Operators** | `+ - * / % ++ -- == != < > <= >= && \|\| ! & \| ^ ~ << >> -> . = += -= *= /=` | Arithmetic, relational, logical, bitwise, and member access |
| **Separators** | `( ) { } [ ] ; ,` | Delimiters and statement punctuation |
| **Comments** | `//...` and `/* ... */` | Single-line and block comments |
| **Preprocessor** | `#include, #define, #ifdef, #pragma` | Directives processed in C translation units |

### Lexical Error Handling
The engine detects and isolates lexical anomalies:
- `INVALID_CHARACTER`: Illegal symbols outside strings (e.g. `@`, `$`, `\`).
- `MALFORMED_NUMBER`: Double decimal points (e.g. `12.34.56`), malformed hex (`0xZZ`), or numbers beginning identifiers (`99bottles`).
- `UNTERMINATED_STRING`: String literals reaching newline or EOF without a closing quote (`"`).
- `UNTERMINATED_COMMENT`: Block comments missing closing `*/` before end-of-file.
- `INVALID_CHAR_LITERAL`: Empty character constants (`''`) or unclosed quotes.

---

## 3. Finite Automata (DFA) Models

LexiScan provides 5 interactive, step-by-step Deterministic Finite Automata:

1. **Identifier Recognizer (`IDENTIFIER_DFA`):**
   - States: $q_0$ (Start), $q_1$ (Accept), $q_{\text{err}}$ (Trap).
   - Alphabet: $[a-zA-Z\_]$, $[0-9]$.
   - Transition: $\delta(q_0, [a-zA-Z\_]) \to q_1$, $\delta(q_1, [a-zA-Z0-9\_]) \to q_1$.

2. **Integer Constant Recognizer (`INTEGER_DFA`):**
   - Disambiguates between Decimal (`42`), Hex (`0x2F4A`), and Octal (`0755`) constants based on leading `0`, `0x`, or non-zero digits.

3. **Floating-Point Recognizer (`FLOAT_DFA`):**
   - Recognizes whole parts, decimal fractions, and scientific exponential forms ($\text{e.g., } 1.602\times 10^{-19} \to \text{"1.602e-19"}$).

4. **Relational Operators Recognizer (`RELATIONAL_DFA`):**
   - Lookahead disambiguation between single-character operators (`<`, `>`, `=`) and two-character operators (`<=`, `>=`, `==`, `!=`).

5. **Arithmetic & Pointer Recognizer (`ARITHMETIC_DFA`):**
   - Disambiguates `+`, `++`, `+=`, `-`, `--`, `-=`, and structure member pointer `->`.

---

## 4. Input Buffering & Sentinels Simulation

LexiScan implements an educational simulation of the **Two-Buffer Scheme (Buffer Pairs)** described in *Aho, Lam, Sethi, Ullman (Compilers: Principles, Techniques, and Tools)*:

- **Buffer Size ($N=16$):** Two equal-sized buffers (Buffer 1 and Buffer 2).
- **Sentinels (`EOF`):** Placed at the end of each half-buffer (positions 16 and 33).
- **Pointers:**
  - `lexeme_begin`: Marks the start of the current token being assembled.
  - `forward`: Scans ahead character by character until a token boundary is found.
- **Lookahead Retraction:** When the forward pointer inspects an extra delimiter (e.g., reading a space after `count`), the visual simulator demonstrates pointer retraction.
- **Sentinel Advantage:** Eliminates the double boundary check per character:
  $$\text{Checks without sentinel: } 2 \text{ per char} \longrightarrow \text{Checks with sentinel: } 1 \text{ per char on average.}$$

---

## 5. Backend REST API Specification

The Express backend runs on port 3000 and serves both the client SPA and the REST endpoints.

### `POST /api/analyze`
Performs lexical analysis on provided source code.
- **Request Body:**
  ```json
  {
    "code": "int main() { return 0; }",
    "language": "c"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "result": {
      "language": "c",
      "tokens": [ ... ],
      "errors": [ ... ],
      "stats": {
        "totalTokens": 8,
        "keywordsCount": 2,
        "identifiersCount": 1,
        "operatorsCount": 0,
        "constantsCount": 1,
        "separatorsCount": 4,
        "commentsCount": 0,
        "errorsCount": 0,
        "linesCount": 1,
        "charactersCount": 23,
        "executionTimeMs": 0.35
      },
      "timestamp": "2026-11-02T21:40:00.000Z"
    }
  }
  ```

### `POST /api/analyze/validate`
Quick syntax and lexical validity check.
- **Response:** `{ "valid": true, "errorsCount": 0, "errors": [], "tokensCount": 8 }`

### `GET /api/history`
Returns history array of past compilation and analysis runs.

### `POST /api/history`
Persists a new analysis run into the history storage.

### `DELETE /api/history/:id`
Deletes a specific history record by ID.

### `GET /api/health`
Returns system uptime, version, and engine status:
```json
{
  "status": "ok",
  "app": "LexiScan Lexical Analyzer",
  "version": "1.0.0",
  "uptime": 120,
  "engine": "DFA-based Character-by-Character Lexical Scanner"
}
```

---

## 6. Installation & Running Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs full-stack Express + Vite on port 3000)
npm run dev
```

### Production Build
```bash
# Build frontend bundle
npm run build

# Start production server
npm start
```

---

## 7. Test Cases & Verification Suite

### Test Case 1: Standard C Program
- **Input:**
  ```c
  #include <stdio.h>
  int main() {
      printf("Hello, World!\n");
      return 0;
  }
  ```
- **Expected Output:**
  - Token 1: `#include <stdio.h>` [`PREPROCESSOR`]
  - Token 2: `int` [`KEYWORD`]
  - Token 3: `main` [`IDENTIFIER`]
  - Token 4: `(` [`SEPARATOR`]
  - Token 5: `)` [`SEPARATOR`]
  - Token 6: `{` [`SEPARATOR`]
  - Token 7: `printf` [`IDENTIFIER`]
  - Token 8: `(` [`SEPARATOR`]
  - Token 9: `"Hello, World!\n"` [`STRING_LITERAL`]
  - Token 10: `)` [`SEPARATOR`]
  - Token 11: `;` [`SEPARATOR`]
  - Token 12: `return` [`KEYWORD`]
  - Token 13: `0` [`INTEGER_LITERAL`]
  - Token 14: `;` [`SEPARATOR`]
  - Token 15: `}` [`SEPARATOR`]
  - Errors: 0

### Test Case 2: Lexical Error Diagnostics
- **Input:**
  ```c
  int score@val = 100;
  float bad_num = 12.34.56;
  char* str = "Unterminated text;
  ```
- **Expected Errors:**
  - Error 1 (Line 1): `Invalid or unrecognized character '@'` [`INVALID_CHARACTER`]
  - Error 2 (Line 2): `Malformed floating-point literal: '12.34.56'. Multiple decimal points detected` [`MALFORMED_NUMBER`]
  - Error 3 (Line 3): `Unterminated string literal. Missing closing quote (")` [`UNTERMINATED_STRING`]

---

## 8. Academic Learning Modules

The **Learn Compiler** tab provides full educational coverage of:
1. **Introduction to Compilers & Translators:** High-level to machine-level translation, Analysis-Synthesis paradigm.
2. **The Six Phases of a Compiler:** Lexical, Syntax, Semantic, Intermediate Code, Optimization, Code Generation.
3. **Role of the Lexical Analyzer:** Tokenization, comment removal, coordinate tracking, symbol table seeding.
4. **Tokens, Patterns & Lexemes:** Clear differentiation with concrete code breakdowns.
5. **Finite State Automata:** DFAs vs NFAs, state transitions, Thompson’s construction.
6. **Input Buffering & Lookahead:** Buffer pairs, sentinels, performance analysis.

Each chapter features interactive self-assessment quizzes with immediate pedagogical feedback.
