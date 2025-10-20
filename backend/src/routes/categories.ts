import { Hono } from 'hono';
import type { Env, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import * as db from '../db';
import { authMiddleware } from '../middleware/auth';

const categories = new Hono<{ Bindings: Env }>();

// カテゴリ一覧取得
categories.get('/', async (c) => {
  const categoriesList = await db.getAllCategories(c.env.DB);
  return c.json(categoriesList);
});

// カテゴリ詳細取得
categories.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const category = await db.getCategoryById(c.env.DB, id);

  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  return c.json(category);
});

// カテゴリ作成（認証が必要）
categories.post('/', authMiddleware, async (c) => {
  const body = await c.req.json<CreateCategoryRequest>();

  // バリデーション
  if (!body.name) {
    return c.json({ error: 'name field is required' }, 400);
  }

  try {
    const id = await db.createCategory(c.env.DB, body);
    const category = await db.getCategoryById(c.env.DB, id);
    return c.json(category, 201);
  } catch (error) {
    // UNIQUE制約違反などのエラー
    return c.json({ error: 'Failed to create category. Name might already exist.' }, 400);
  }
});

// カテゴリ更新（認証が必要）
categories.put('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json<UpdateCategoryRequest>();

  const category = await db.getCategoryById(c.env.DB, id);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  try {
    const success = await db.updateCategory(c.env.DB, id, body);
    if (!success) {
      return c.json({ error: 'Failed to update category' }, 500);
    }

    const updatedCategory = await db.getCategoryById(c.env.DB, id);
    return c.json(updatedCategory);
  } catch (error) {
    return c.json({ error: 'Failed to update category. Name might already exist.' }, 400);
  }
});

// カテゴリ削除（認証が必要）
categories.delete('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'));

  const category = await db.getCategoryById(c.env.DB, id);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  const success = await db.deleteCategory(c.env.DB, id);
  if (!success) {
    return c.json({ error: 'Failed to delete category' }, 500);
  }

  return c.json({ message: 'Category deleted successfully' });
});

export default categories;
