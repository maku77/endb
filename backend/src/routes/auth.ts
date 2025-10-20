import { Hono } from 'hono';
import type { Env } from '../types';
import { generateToken, verifyPassword } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env }>();

// ログイン
auth.post('/login', async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();

  // バリデーション
  if (!body.username || !body.password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }

  // パスワード検証
  if (!verifyPassword(body.username, body.password, c.env)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // JWT生成
  const token = await generateToken(body.username, c.env.JWT_SECRET);

  return c.json({
    token,
    expiresIn: 86400, // 24時間（秒）
  });
});

export default auth;
