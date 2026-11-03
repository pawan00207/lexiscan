/**
 * LexiScan - Production-Grade Lexical Analyzer Engine
 * Demonstrates character-by-character scanning, DFA-based tokenization,
 * lookahead buffering, and comprehensive lexical error detection.
 */

export type SupportedLanguage = 'c' | 'java';

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'INTEGER_LITERAL'
  | 'FLOAT_LITERAL'
  | 'STRING_LITERAL'
  | 'CHAR_LITERAL'
  | 'SEPARATOR'
  | 'COMMENT'
  | 'PREPROCESSOR';

export interface Token {
  tokenId: number;
  lexeme: string;
  type: TokenType;
  subType: string;
  line: number;
  column: number;
  startIndex: number;
  endIndex: number;
}

export type ErrorCategory =
  | 'INVALID_CHARACTER'
  | 'MALFORMED_NUMBER'
  | 'UNTERMINATED_STRING'
  | 'UNTERMINATED_COMMENT'
  | 'INVALID_CHAR_LITERAL';

export interface LexicalError {
  id: number;
  message: string;
  category: ErrorCategory;
  line: number;
  column: number;
  startIndex: number;
  endIndex: number;
  snippet: string;
  suggestion: string;
}

export interface LexerStats {
  totalTokens: number;
  keywordsCount: number;
  identifiersCount: number;
  operatorsCount: number;
  constantsCount: number;
  separatorsCount: number;
  commentsCount: number;
  errorsCount: number;
  linesCount: number;
  charactersCount: number;
  executionTimeMs: number;
}

export interface LexerResult {
  language: SupportedLanguage;
  tokens: Token[];
  errors: LexicalError[];
  stats: LexerStats;
  timestamp: string;
}

// C Language Keywords (C99 / C11 standard)
export const C_KEYWORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
  'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
  'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
  'unsigned', 'void', 'volatile', 'while', '_Bool', '_Complex', '_Imaginary'
]);

// Java Language Keywords
export const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
  'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while', 'record', 'sealed',
  'permits', 'yield', 'var', 'true', 'false', 'null'
]);

export class LexicalAnalyzer {
  private source: string;
  private language: SupportedLanguage;
  private tokens: Token[] = [];
  private errors: LexicalError[] = [];
  
  private current: number = 0;
  private line: number = 1;
  private col: number = 1;
  private startLine: number = 1;
  private startCol: number = 1;
  private startIndex: number = 0;
  private tokenIdCounter: number = 1;
  private errorIdCounter: number = 1;

  constructor(source: string, language: SupportedLanguage = 'c') {
    this.source = source || '';
    this.language = language;
  }

  public tokenize(): LexerResult {
    const startTime = performance.now();
    this.tokens = [];
    this.errors = [];
    this.current = 0;
    this.line = 1;
    this.col = 1;
    this.tokenIdCounter = 1;
    this.errorIdCounter = 1;

    while (!this.isAtEnd()) {
      this.startIndex = this.current;
      this.startLine = this.line;
      this.startCol = this.col;
      this.scanToken();
    }

    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
    const stats = this.computeStatistics(executionTimeMs);

    return {
      language: this.language,
      tokens: this.tokens,
      errors: this.errors,
      stats,
      timestamp: new Date().toISOString()
    };
  }

  private scanToken(): void {
    const c = this.advance();

    // 1. Whitespace handling
    if (c === ' ' || c === '\t' || c === '\r') {
      return; // Ignore standard whitespace
    }

    if (c === '\n') {
      this.line++;
      this.col = 1;
      return;
    }

    // 2. Preprocessor Directives (C language)
    if (c === '#' && this.language === 'c') {
      this.scanPreprocessor();
      return;
    }

    // 3. Separators / Delimiters
    if (this.isSeparator(c)) {
      this.addToken('SEPARATOR', 'Delimiter', c);
      return;
    }

    // 4. String Literals
    if (c === '"') {
      this.scanString();
      return;
    }

    // 5. Character Literals
    if (c === "'") {
      this.scanChar();
      return;
    }

    // 6. Comments or Slash Operator
    if (c === '/') {
      if (this.peek() === '/') {
        this.scanSingleLineComment();
        return;
      } else if (this.peek() === '*') {
        this.scanMultiLineComment();
        return;
      } else if (this.peek() === '=') {
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '/=');
        return;
      } else {
        this.addToken('OPERATOR', 'Arithmetic Operator', '/');
        return;
      }
    }

    // 7. Multi-character and Single-character Operators
    if (this.isOperatorStart(c)) {
      this.scanOperator(c);
      return;
    }

    // 8. Numbers (Integer and Floating-point Literals)
    if (this.isDigit(c) || (c === '.' && this.isDigit(this.peek()))) {
      this.scanNumber(c);
      return;
    }

    // 9. Identifiers and Keywords
    if (this.isAlphaOrUnderscore(c)) {
      this.scanIdentifierOrKeyword();
      return;
    }

    // 10. Invalid Character Error
    this.addError(
      `Invalid or unrecognized character '${c}' (ASCII: ${c.charCodeAt(0)})`,
      'INVALID_CHARACTER',
      c,
      `Remove or replace '${c}' with a valid C/Java token.`
    );
  }

  // Scanning Preprocessor Directives
  private scanPreprocessor(): void {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      // Handle backslash line-continuation in macros
      if (this.peek() === '\\' && this.peekNext() === '\n') {
        this.advance(); // backslash
        this.advance(); // newline
        this.line++;
        this.col = 1;
      } else {
        this.advance();
      }
    }
    const lexeme = this.source.substring(this.startIndex, this.current);
    this.addToken('PREPROCESSOR', 'Preprocessor Directive', lexeme);
  }

  // Scanning String Literals
  private scanString(): void {
    let escaped = false;
    let closed = false;

    while (!this.isAtEnd()) {
      const c = this.peek();

      if (c === '\n' && !escaped) {
        // Unterminated string literal reached newline
        break;
      }

      this.advance();

      if (c === '\n') {
        this.line++;
        this.col = 1;
      }

      if (escaped) {
        escaped = false;
      } else if (c === '\\') {
        escaped = true;
      } else if (c === '"') {
        closed = true;
        break;
      }
    }

    const lexeme = this.source.substring(this.startIndex, this.current);

    if (!closed) {
      this.addError(
        'Unterminated string literal. Missing closing quote (")',
        'UNTERMINATED_STRING',
        lexeme,
        'Add a closing quotation mark (") before newline or end of file.'
      );
    } else {
      this.addToken('STRING_LITERAL', 'String Literal', lexeme);
    }
  }

  // Scanning Character Literals
  private scanChar(): void {
    let closed = false;
    let escaped = false;

    while (!this.isAtEnd()) {
      const c = this.peek();
      if (c === '\n') break;

      this.advance();

      if (escaped) {
        escaped = false;
      } else if (c === '\\') {
        escaped = true;
      } else if (c === "'") {
        closed = true;
        break;
      }
    }

    const lexeme = this.source.substring(this.startIndex, this.current);

    if (!closed) {
      this.addError(
        "Unterminated character literal. Missing closing single quote (')",
        'INVALID_CHAR_LITERAL',
        lexeme,
        "Add a closing single quote (') before newline."
      );
    } else if (lexeme === "''") {
      this.addError(
        'Empty character literal is not permitted.',
        'INVALID_CHAR_LITERAL',
        lexeme,
        "Specify a valid character inside single quotes, e.g. 'a' or '\\0'."
      );
    } else {
      this.addToken('CHAR_LITERAL', 'Character Literal', lexeme);
    }
  }

  // Single-line Comment
  private scanSingleLineComment(): void {
    // Consume the second '/'
    this.advance();
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
    const lexeme = this.source.substring(this.startIndex, this.current);
    this.addToken('COMMENT', 'Single-line Comment', lexeme);
  }

  // Multi-line Comment
  private scanMultiLineComment(): void {
    // Consume '*'
    this.advance();
    let closed = false;

    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance(); // *
        this.advance(); // /
        closed = true;
        break;
      }

      if (this.peek() === '\n') {
        this.line++;
        this.col = 0; // col will be incremented to 1 by advance()
      }
      this.advance();
    }

    const lexeme = this.source.substring(this.startIndex, this.current);

    if (!closed) {
      this.addError(
        'Unterminated multi-line comment. Missing closing delimiter (*/)',
        'UNTERMINATED_COMMENT',
        lexeme,
        'Close the comment with "*/" before end of file.'
      );
    } else {
      this.addToken('COMMENT', 'Multi-line Comment', lexeme);
    }
  }

  // Scanning Numbers
  private scanNumber(firstChar: string): void {
    let isFloat = firstChar === '.';
    let isHex = false;
    let isBinary = false;
    let isOctal = false;

    if (firstChar === '0') {
      const next = this.peek();
      if (next === 'x' || next === 'X') {
        isHex = true;
        this.advance(); // x
        if (!this.isHexDigit(this.peek())) {
          this.advance();
          const lexeme = this.source.substring(this.startIndex, this.current);
          this.addError(
            `Malformed hexadecimal literal: '${lexeme}'. Expected hex digits after '0x'`,
            'MALFORMED_NUMBER',
            lexeme,
            'Provide hexadecimal digits (0-9, a-f, A-F) following 0x prefix.'
          );
          return;
        }
        while (this.isHexDigit(this.peek())) {
          this.advance();
        }
      } else if (next === 'b' || next === 'B') {
        isBinary = true;
        this.advance(); // b
        if (this.peek() !== '0' && this.peek() !== '1') {
          this.advance();
          const lexeme = this.source.substring(this.startIndex, this.current);
          this.addError(
            `Malformed binary literal: '${lexeme}'. Expected 0 or 1 after '0b'`,
            'MALFORMED_NUMBER',
            lexeme,
            'Provide binary digits (0 or 1) following 0b prefix.'
          );
          return;
        }
        while (this.peek() === '0' || this.peek() === '1') {
          this.advance();
        }
      } else if (this.isDigit(next)) {
        isOctal = true;
        while (this.isDigit(this.peek())) {
          const digit = this.advance();
          if (digit === '8' || digit === '9') {
            const lexeme = this.source.substring(this.startIndex, this.current);
            this.addError(
              `Malformed octal literal: '${lexeme}'. Octal digits must be between 0 and 7`,
              'MALFORMED_NUMBER',
              lexeme,
              'Replace digit with an octal digit (0-7) or prefix with decimal representation.'
            );
            return;
          }
        }
      }
    }

    if (!isHex && !isBinary && !isOctal) {
      // Standard decimal or float
      while (this.isDigit(this.peek())) {
        this.advance();
      }

      // Look for fractional part
      if (this.peek() === '.' && this.isDigit(this.peekNext())) {
        isFloat = true;
        this.advance(); // consume '.'
        while (this.isDigit(this.peek())) {
          this.advance();
        }
      }

      // Check for double dot error like 12.34.56
      if (this.peek() === '.') {
        this.advance();
        while (this.isDigit(this.peek()) || this.peek() === '.') {
          this.advance();
        }
        const lexeme = this.source.substring(this.startIndex, this.current);
        this.addError(
          `Malformed floating-point literal: '${lexeme}'. Multiple decimal points detected`,
          'MALFORMED_NUMBER',
          lexeme,
          'A floating point number may contain at most one decimal point.'
        );
        return;
      }

      // Exponent part (e.g. 1e-10, 2.5E+3)
      if (this.peek() === 'e' || this.peek() === 'E') {
        isFloat = true;
        this.advance();
        if (this.peek() === '+' || this.peek() === '-') {
          this.advance();
        }
        if (!this.isDigit(this.peek())) {
          const lexeme = this.source.substring(this.startIndex, this.current);
          this.addError(
            `Malformed exponent in number '${lexeme}'. Missing digits after 'e'`,
            'MALFORMED_NUMBER',
            lexeme,
            'Provide integer exponent digits after e/E.'
          );
          return;
        }
        while (this.isDigit(this.peek())) {
          this.advance();
        }
      }
    }

    // Number suffixes: u, U, l, L, f, F
    while (
      this.peek() === 'u' || this.peek() === 'U' ||
      this.peek() === 'l' || this.peek() === 'L' ||
      this.peek() === 'f' || this.peek() === 'F'
    ) {
      const suffix = this.advance();
      if (suffix === 'f' || suffix === 'F') {
        isFloat = true;
      }
    }

    // Detect illegal alphanumeric suffix like 123abc
    if (this.isAlphaOrUnderscore(this.peek())) {
      while (this.isAlphaOrUnderscore(this.peek()) || this.isDigit(this.peek())) {
        this.advance();
      }
      const lexeme = this.source.substring(this.startIndex, this.current);
      this.addError(
        `Invalid suffix or malformed identifier '${lexeme}'. Identifiers cannot begin with digits`,
        'MALFORMED_NUMBER',
        lexeme,
        'Separate the numeric literal from the identifier or rename the variable.'
      );
      return;
    }

    const lexeme = this.source.substring(this.startIndex, this.current);
    if (isFloat) {
      this.addToken('FLOAT_LITERAL', 'Floating-Point Literal', lexeme);
    } else if (isHex) {
      this.addToken('INTEGER_LITERAL', 'Hexadecimal Integer', lexeme);
    } else if (isBinary) {
      this.addToken('INTEGER_LITERAL', 'Binary Integer', lexeme);
    } else if (isOctal) {
      this.addToken('INTEGER_LITERAL', 'Octal Integer', lexeme);
    } else {
      this.addToken('INTEGER_LITERAL', 'Decimal Integer', lexeme);
    }
  }

  // Scanning Identifiers and Keywords
  private scanIdentifierOrKeyword(): void {
    while (this.isAlphaOrUnderscore(this.peek()) || this.isDigit(this.peek())) {
      this.advance();
    }

    const lexeme = this.source.substring(this.startIndex, this.current);
    const keywordsSet = this.language === 'java' ? JAVA_KEYWORDS : C_KEYWORDS;

    if (keywordsSet.has(lexeme)) {
      this.addToken('KEYWORD', `${this.language.toUpperCase()} Keyword`, lexeme);
    } else {
      this.addToken('IDENTIFIER', 'User-defined Identifier', lexeme);
    }
  }

  // Scanning Operators
  private scanOperator(first: string): void {
    // 3-char operators: <<=, >>=, >>>, >>>=
    if (first === '<' && this.peek() === '<' && this.peekNext() === '=') {
      this.advance(); this.advance();
      this.addToken('OPERATOR', 'Bitwise Assignment Operator', '<<=');
      return;
    }
    if (first === '>' && this.peek() === '>' && this.peekNext() === '=') {
      this.advance(); this.advance();
      this.addToken('OPERATOR', 'Bitwise Assignment Operator', '>>=');
      return;
    }
    if (first === '>' && this.peek() === '>' && this.peekNext() === '>') {
      this.advance(); this.advance();
      if (this.peek() === '=') {
        this.advance();
        this.addToken('OPERATOR', 'Bitwise Assignment Operator', '>>>=');
        return;
      }
      this.addToken('OPERATOR', 'Bitwise Operator', '>>>');
      return;
    }

    // 2-char operators
    const next = this.peek();
    const twoChar = first + next;

    switch (twoChar) {
      case '++':
        this.advance();
        this.addToken('OPERATOR', 'Increment Operator', '++');
        return;
      case '--':
        this.advance();
        this.addToken('OPERATOR', 'Decrement Operator', '--');
        return;
      case '==':
        this.advance();
        this.addToken('OPERATOR', 'Relational Operator', '==');
        return;
      case '!=':
        this.advance();
        this.addToken('OPERATOR', 'Relational Operator', '!=');
        return;
      case '<=':
        this.advance();
        this.addToken('OPERATOR', 'Relational Operator', '<=');
        return;
      case '>=':
        this.advance();
        this.addToken('OPERATOR', 'Relational Operator', '>=');
        return;
      case '&&':
        this.advance();
        this.addToken('OPERATOR', 'Logical AND Operator', '&&');
        return;
      case '||':
        this.advance();
        this.addToken('OPERATOR', 'Logical OR Operator', '||');
        return;
      case '<<':
        this.advance();
        this.addToken('OPERATOR', 'Left Shift Operator', '<<');
        return;
      case '>>':
        this.advance();
        this.addToken('OPERATOR', 'Right Shift Operator', '>>');
        return;
      case '+=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '+=');
        return;
      case '-=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '-=');
        return;
      case '*=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '*=');
        return;
      case '%=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '%=');
        return;
      case '&=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '&=');
        return;
      case '|=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '|=');
        return;
      case '^=':
        this.advance();
        this.addToken('OPERATOR', 'Assignment Operator', '^=');
        return;
      case '->':
        this.advance();
        this.addToken('OPERATOR', 'Structure Pointer Operator', '->');
        return;
      case '::':
        this.advance();
        this.addToken('OPERATOR', 'Scope Resolution Operator', '::');
        return;
    }

    // 1-char operators
    let subType = 'Operator';
    if (first === '+' || first === '-' || first === '*' || first === '%') {
      subType = 'Arithmetic Operator';
    } else if (first === '<' || first === '>') {
      subType = 'Relational Operator';
    } else if (first === '=') {
      subType = 'Assignment Operator';
    } else if (first === '!') {
      subType = 'Logical NOT Operator';
    } else if (first === '&' || first === '|' || first === '^' || first === '~') {
      subType = 'Bitwise Operator';
    } else if (first === '.') {
      subType = 'Member Access Operator';
    } else if (first === '?' || first === ':') {
      subType = 'Conditional / Ternary Operator';
    }

    this.addToken('OPERATOR', subType, first);
  }

  // Token & Error builders
  private addToken(type: TokenType, subType: string, lexeme: string): void {
    this.tokens.push({
      tokenId: this.tokenIdCounter++,
      lexeme,
      type,
      subType,
      line: this.startLine,
      column: this.startCol,
      startIndex: this.startIndex,
      endIndex: this.current
    });
  }

  private addError(message: string, category: ErrorCategory, snippet: string, suggestion: string): void {
    this.errors.push({
      id: this.errorIdCounter++,
      message,
      category,
      line: this.startLine,
      column: this.startCol,
      startIndex: this.startIndex,
      endIndex: this.current,
      snippet,
      suggestion
    });
  }

  // Helper matchers
  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    const c = this.source.charAt(this.current);
    this.current++;
    this.col++;
    return c;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isHexDigit(c: string): boolean {
    return (
      (c >= '0' && c <= '9') ||
      (c >= 'a' && c <= 'f') ||
      (c >= 'A' && c <= 'F')
    );
  }

  private isAlphaOrUnderscore(c: string): boolean {
    return (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c === '_' ||
      (this.language === 'java' && c === '$') // Java permits $ in identifiers
    );
  }

  private isOperatorStart(c: string): boolean {
    return (
      c === '+' || c === '-' || c === '*' || c === '%' ||
      c === '=' || c === '!' || c === '<' || c === '>' ||
      c === '&' || c === '|' || c === '^' || c === '~' ||
      c === '?' || c === ':' || c === '.'
    );
  }

  private isSeparator(c: string): boolean {
    return (
      c === '(' || c === ')' ||
      c === '{' || c === '}' ||
      c === '[' || c === ']' ||
      c === ';' || c === ','
    );
  }

  private computeStatistics(executionTimeMs: number): LexerStats {
    let keywordsCount = 0;
    let identifiersCount = 0;
    let operatorsCount = 0;
    let constantsCount = 0;
    let separatorsCount = 0;
    let commentsCount = 0;

    for (const t of this.tokens) {
      switch (t.type) {
        case 'KEYWORD':
          keywordsCount++;
          break;
        case 'IDENTIFIER':
          identifiersCount++;
          break;
        case 'OPERATOR':
          operatorsCount++;
          break;
        case 'INTEGER_LITERAL':
        case 'FLOAT_LITERAL':
        case 'STRING_LITERAL':
        case 'CHAR_LITERAL':
          constantsCount++;
          break;
        case 'SEPARATOR':
          separatorsCount++;
          break;
        case 'COMMENT':
          commentsCount++;
          break;
      }
    }

    return {
      totalTokens: this.tokens.length,
      keywordsCount,
      identifiersCount,
      operatorsCount,
      constantsCount,
      separatorsCount,
      commentsCount,
      errorsCount: this.errors.length,
      linesCount: this.line,
      charactersCount: this.source.length,
      executionTimeMs
    };
  }
}

export function analyzeSourceCode(code: string, language: SupportedLanguage = 'c'): LexerResult {
  const lexer = new LexicalAnalyzer(code, language);
  return lexer.tokenize();
}
