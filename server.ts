import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeSourceCode, SupportedLanguage, LexerResult } from './src/lib/lexer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

export interface HistoryItem {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  codeSnippet: string;
  fullCode: string;
  tokensCount: number;
  errorsCount: number;
  executionTimeMs: number;
  tokens: LexerResult['tokens'];
  errors: LexerResult['errors'];
  stats: LexerResult['stats'];
}

// In-memory persistent history store (pre-seeded with academic examples)
const analysisHistory: HistoryItem[] = [
  {
    id: 'seed-hist-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    language: 'c',
    codeSnippet: '#include <stdio.h>\nint main() {\n    printf("Hello, LexiScan!\\n");\n    return 0;\n}',
    fullCode: '#include <stdio.h>\nint main() {\n    printf("Hello, LexiScan!\\n");\n    return 0;\n}',
    tokensCount: 16,
    errorsCount: 0,
    executionTimeMs: 1.25,
    tokens: analyzeSourceCode('#include <stdio.h>\nint main() {\n    printf("Hello, LexiScan!\\n");\n    return 0;\n}', 'c').tokens,
    errors: [],
    stats: analyzeSourceCode('#include <stdio.h>\nint main() {\n    printf("Hello, LexiScan!\\n");\n    return 0;\n}', 'c').stats,
  }
];

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'LexiScan Lexical Analyzer',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    engine: 'DFA-based Character-by-Character Lexical Scanner'
  });
});

// Primary Lexical Analysis Endpoint
app.post('/api/analyze', (req: Request, res: Response) => {
  try {
    const { code, language = 'c' } = req.body;

    if (typeof code !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid request: "code" must be a string.'
      });
      return;
    }

    const lang: SupportedLanguage = language === 'java' ? 'java' : 'c';
    const result: LexerResult = analyzeSourceCode(code, lang);

    res.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error('Error during lexical analysis:', err);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred during lexical analysis.',
      details: err?.message || String(err)
    });
  }
});

// Quick Validation Endpoint
app.post('/api/analyze/validate', (req: Request, res: Response) => {
  try {
    const { code, language = 'c' } = req.body;
    if (typeof code !== 'string') {
      res.status(400).json({ valid: false, error: '"code" string is required' });
      return;
    }
    const lang: SupportedLanguage = language === 'java' ? 'java' : 'c';
    const result = analyzeSourceCode(code, lang);

    res.json({
      valid: result.errors.length === 0,
      errorsCount: result.errors.length,
      errors: result.errors,
      tokensCount: result.tokens.length
    });
  } catch (err: any) {
    res.status(500).json({ valid: false, error: err?.message || 'Validation error' });
  }
});

// History Endpoints
app.get('/api/history', (req: Request, res: Response) => {
  res.json({
    success: true,
    history: analysisHistory
  });
});

app.post('/api/history', (req: Request, res: Response) => {
  try {
    const { language, fullCode, result } = req.body;
    if (!result || !fullCode) {
      res.status(400).json({ success: false, error: 'Missing required history payload' });
      return;
    }

    const newItem: HistoryItem = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      language: language === 'java' ? 'java' : 'c',
      codeSnippet: fullCode.slice(0, 150) + (fullCode.length > 150 ? '...' : ''),
      fullCode,
      tokensCount: result.tokens?.length || 0,
      errorsCount: result.errors?.length || 0,
      executionTimeMs: result.stats?.executionTimeMs || 0,
      tokens: result.tokens || [],
      errors: result.errors || [],
      stats: result.stats || {}
    };

    // Prepend new history (cap at 50 entries)
    analysisHistory.unshift(newItem);
    if (analysisHistory.length > 50) {
      analysisHistory.pop();
    }

    res.status(201).json({
      success: true,
      item: newItem
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/history/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = analysisHistory.findIndex(h => h.id === id);
  if (index !== -1) {
    analysisHistory.splice(index, 1);
    res.json({ success: true, message: `History item ${id} deleted.` });
  } else {
    res.status(404).json({ success: false, error: 'History entry not found.' });
  }
});

// Vite Middleware integration for Fullstack applet
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LexiScan] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[LexiScan] Failed to start server:', err);
  process.exit(1);
});
