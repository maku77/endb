import { Context, Next } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../types';

// JWTトークンを生成
export async function generateToken(username: string, secret: string): Promise<string> {
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24時間有効
  };
  return await sign(payload, secret);
}

// JWTトークンを検証するミドルウェア
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.substring(7); // "Bearer " を削除
  const secret = c.env.JWT_SECRET;

  if (!secret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  try {
    const payload = await verify(token, secret);

    // トークンの有効期限チェック
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Token expired' }, 401);
    }

    // ユーザー情報をコンテキストに保存
    c.set('username', payload.username as string);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}

// パスワードを検証（環境変数と比較）
export function verifyPassword(
  username: string,
  password: string,
  env: Env
): boolean {
  return username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
}
