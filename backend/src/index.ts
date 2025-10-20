import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

import words from './routes/words';
import categories from './routes/categories';
import study from './routes/study';
import stats from './routes/stats';
import auth from './routes/auth';

const app = new Hono<{ Bindings: Env }>();

// CORS設定
app.use(
  '*',
  cors({
    origin: (origin) => origin, // 開発時は全てのオリジンを許可
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// ルート
app.get('/', (c) => {
  return c.json({
    message: 'English Vocabulary Database API',
    version: '1.0.0',
    endpoints: {
      words: '/api/words',
      categories: '/api/categories',
      study: '/api/study',
      stats: '/api/stats',
    },
  });
});

// APIルート
app.route('/api/auth', auth);
app.route('/api/words', words);
app.route('/api/categories', categories);
app.route('/api/study', study);
app.route('/api/stats', stats);

export default app;
