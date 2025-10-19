import { Hono } from 'hono';
import type { Env, CreateWordRequest, UpdateWordRequest } from '../types';
import * as db from '../db';

const words = new Hono<{ Bindings: Env }>();

// 単語一覧取得
words.get('/', async (c) => {
  const search = c.req.query('search');
  const category_id = c.req.query('category_id');
  const mastery_level = c.req.query('mastery_level');

  const filters = {
    search: search || undefined,
    category_id: category_id ? parseInt(category_id) : undefined,
    mastery_level: mastery_level ? parseInt(mastery_level) : undefined,
  };

  const wordsList = await db.getAllWords(c.env.DB, filters);
  return c.json(wordsList);
});

// 単語詳細取得
words.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const word = await db.getWordById(c.env.DB, id);

  if (!word) {
    return c.json({ error: 'Word not found' }, 404);
  }

  return c.json(word);
});

// 単語登録
words.post('/', async (c) => {
  const body = await c.req.json<CreateWordRequest>();

  // バリデーション
  if (!body.en || !body.ja) {
    return c.json({ error: 'en and ja fields are required' }, 400);
  }

  const id = await db.createWord(c.env.DB, body);
  const word = await db.getWordById(c.env.DB, id);

  return c.json(word, 201);
});

// 単語更新
words.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json<UpdateWordRequest>();

  const word = await db.getWordById(c.env.DB, id);
  if (!word) {
    return c.json({ error: 'Word not found' }, 404);
  }

  const success = await db.updateWord(c.env.DB, id, body);
  if (!success) {
    return c.json({ error: 'Failed to update word' }, 500);
  }

  const updatedWord = await db.getWordById(c.env.DB, id);
  return c.json(updatedWord);
});

// 単語削除
words.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const word = await db.getWordById(c.env.DB, id);
  if (!word) {
    return c.json({ error: 'Word not found' }, 404);
  }

  const success = await db.deleteWord(c.env.DB, id);
  if (!success) {
    return c.json({ error: 'Failed to delete word' }, 500);
  }

  return c.json({ message: 'Word deleted successfully' });
});

export default words;
