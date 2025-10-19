import { Hono } from 'hono';
import type { Env } from '../types';
import * as db from '../db';

const stats = new Hono<{ Bindings: Env }>();

// 統計情報を取得
stats.get('/', async (c) => {
  const statistics = await db.getStudyStats(c.env.DB);
  return c.json(statistics);
});

export default stats;
