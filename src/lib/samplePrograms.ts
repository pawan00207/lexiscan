import { SupportedLanguage } from './lexer.ts';

export interface SampleProgram {
  id: string;
  title: string;
  description: string;
  language: SupportedLanguage;
  code: string;
}

export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    id: 'hello-c',
    title: 'Hello World & Preprocessor',
    description: 'Basic C program with #include header, string literal, and return statement.',
    language: 'c',
    code: `/*
 * Project: LexiScan - Sample Program 1
 * Demonstrates: Preprocessor directive, strings, keywords, separators
 */
#include <stdio.h>

int main() {
    // Print welcoming message
    printf("Hello, Compiler Design Enthusiast!\\n");
    return 0;
}
`
  },
  {
    id: 'variables-literals',
    title: 'Data Types & Number Formats',
    description: 'Demonstrates decimal, hexadecimal, octal, floating-point and character literals with suffixes.',
    language: 'c',
    code: `/*
 * Project: LexiScan - Sample Program 2
 * Demonstrates: Constant literals (Dec, Hex, Octal, Float, Char)
 */
#include <stdbool.h>

int main() {
    int decVal = 42;
    int hexVal = 0x2F4A;        // Hexadecimal constant
    int octVal = 0755;          // Octal constant
    int binVal = 0b10110;       // Binary constant (C99 extension)
    
    double pi = 3.14159265;     // Floating-point constant
    double exponent = 1.602e-19;// Scientific exponential notation
    float floatVal = 0.5f;      // Float literal with suffix
    
    char grade = 'A';           // Character literal
    char newline = '\\n';        // Escaped character literal
    
    unsigned long total = 100000UL;
    return 0;
}
`
  },
  {
    id: 'operators-expressions',
    title: 'Operators & Pointer Arithmetic',
    description: 'Complex expressions using relational, bitwise, structure pointer (->) and assignment operators.',
    language: 'c',
    code: `/*
 * Project: LexiScan - Sample Program 3
 * Demonstrates: Relational, Logical, Bitwise, Pointer (->) Operators
 */
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

int main() {
    int a = 15, b = 4;
    int sum = a + b * 2;         // Arithmetic
    bool isGreater = (a >= b) && (b != 0); // Relational & Logical
    
    int shifted = (a << 2) | (b & 0xFF); // Bitwise shift & OR
    a += 5;                      // Compound assignment
    
    struct Node* head = (struct Node*)malloc(sizeof(struct Node));
    if (head != NULL) {
        head->data = 100;        // Member pointer operator
        head->next = NULL;
    }
    
    return 0;
}
`
  },
  {
    id: 'control-flow',
    title: 'Conditional Branching & Switch',
    description: 'If-else statements and switch-case branching constructs.',
    language: 'c',
    code: `/*
 * Project: LexiScan - Sample Program 4
 * Demonstrates: Control flow keywords (if, else, switch, case, default)
 */
#include <stdio.h>

int main() {
    int score = 85;
    char grade;

    if (score >= 90) {
        grade = 'A';
    } else if (score >= 80) {
        grade = 'B';
    } else {
        grade = 'C';
    }

    switch (grade) {
        case 'A':
            printf("Excellent performance!\\n");
            break;
        case 'B':
            printf("Good job!\\n");
            break;
        default:
            printf("Needs improvement.\\n");
            break;
    }

    return 0;
}
`
  },
  {
    id: 'loops-functions',
    title: 'Loops & Recursive Function',
    description: 'While/for loops and recursive factorial algorithm with function prototyping.',
    language: 'c',
    code: `/*
 * Project: LexiScan - Sample Program 5
 * Demonstrates: Loops (for, while, do-while), recursion, function definitions
 */
#include <stdio.h>

long long factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int count = 5;
    for (int i = 1; i <= count; ++i) {
        printf("Fact(%d) = %lld\\n", i, factorial(i));
    }

    int remaining = 3;
    while (remaining > 0) {
        remaining--;
    }

    return 0;
}
`
  },
  {
    id: 'java-oop',
    title: 'Java Class & OOP Structure',
    description: 'Java class definition with access modifiers, encapsulation, and methods.',
    language: 'java',
    code: `/*
 * Project: LexiScan - Sample Program 6 (Java)
 * Demonstrates: Java keywords (public, class, private, static, void, new, this)
 */
package com.lexiscan.demo;

public class TokenStreamHandler {
    private final String streamId;
    private int processedCount;
    private static final int BUFFER_CAPACITY = 1024;

    public TokenStreamHandler(String id) {
        this.streamId = id;
        this.processedCount = 0;
    }

    public synchronized void recordToken(String lexeme, boolean isValid) {
        if (isValid && lexeme != null) {
            this.processedCount++;
            System.out.println("Recorded lexeme: " + lexeme);
        }
    }

    public static void main(String[] args) {
        TokenStreamHandler handler = new TokenStreamHandler("stream-01");
        handler.recordToken("scanner", true);
    }
}
`
  },
  {
    id: 'lexical-error-diagnostic',
    title: 'Lexical Error Diagnostics Test',
    description: 'Intentionally contains malformed float, illegal symbols, and unterminated tokens to test error detection.',
    language: 'c',
    code: `/*
 * Project: LexiScan - Lexical Error Demonstration
 * Intended to demonstrate how compiler error detection catches invalid lexemes!
 */
#include <stdio.h>

int main() {
    // 1. Invalid Character Error (@ is illegal in C source code)
    int valid_var = 10;
    int price@tag = 50;

    // 2. Malformed numeric constant (two decimal points)
    float bad_number = 12.34.56;

    // 3. Identifier starting with number
    int 99bottles = 99;

    // 4. Unterminated string literal (no closing quote before end of line)
    char* broken_str = "This string is never closed;

    printf("Analysis should highlight all errors above!\\n");
    return 0;
}
`
  }
];
