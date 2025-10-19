import { Hono } from 'hono';
import type { Env, RecordStudyRequest } from '../types';
import * as db from '../db';

const study = new Hono<{ Bindings: Env }>();

// ランダムに単語を取得（学習用）
study.get('/random', async (c) => {
  const count = parseInt(c.req.query('count') || '10');
  const words = await db.getRandomWords(c.env.DB, count);
  return c.json(words);
});

// 学習結果を記録
study.post('/record', async (c) => {
  const body = await c.req.json<RecordStudyRequest>();

  // バリデーション
  if (!body.word_id || !body.result) {
    return c.json({ error: 'word_id and result fields are required' }, 400);
  }

  if (body.result !== 'correct' && body.result !== 'incorrect') {
    return c.json({ error: 'result must be "correct" or "incorrect"' }, 400);
  }

  const success = await db.recordStudySession(c.env.DB, body.word_id, body.result);
  if (!success) {
    return c.json({ error: 'Failed to record study session' }, 500);
  }

  return c.json({ message: 'Study session recorded successfully' });
});

export default study;
