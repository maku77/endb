import type { D1Database } from '@cloudflare/workers-types';
import type { Word, Category, StudySession } from './types';

// 単語関連のデータベース操作

export async function getAllWords(
  db: D1Database,
  filters?: {
    search?: string;
    category_id?: number;
    mastery_level?: number;
  }
): Promise<Word[]> {
  let query = 'SELECT * FROM words WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters?.search) {
    query += ' AND (en LIKE ? OR ja LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (filters?.category_id !== undefined) {
    query += ' AND category_id = ?';
    params.push(filters.category_id);
  }

  if (filters?.mastery_level !== undefined) {
    query += ' AND mastery_level = ?';
    params.push(filters.mastery_level);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.prepare(query).bind(...params).all<Word>();
  return result.results || [];
}

export async function getWordById(db: D1Database, id: number): Promise<Word | null> {
  const result = await db.prepare('SELECT * FROM words WHERE id = ?').bind(id).first<Word>();
  return result;
}

export async function createWord(
  db: D1Database,
  data: {
    en: string;
    ja: string;
    example?: string;
    notes?: string;
    category_id?: number;
    created_at?: string;
  }
): Promise<number> {
  const result = data.created_at
    ? await db
        .prepare(
          'INSERT INTO words (en, ja, example, notes, category_id, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id'
        )
        .bind(
          data.en,
          data.ja,
          data.example || null,
          data.notes || null,
          data.category_id || null,
          data.created_at
        )
        .first<{ id: number }>()
    : await db
        .prepare(
          'INSERT INTO words (en, ja, example, notes, category_id) VALUES (?, ?, ?, ?, ?) RETURNING id'
        )
        .bind(data.en, data.ja, data.example || null, data.notes || null, data.category_id || null)
        .first<{ id: number }>();

  return result?.id || 0;
}

export async function updateWord(
  db: D1Database,
  id: number,
  data: Partial<{
    en: string;
    ja: string;
    example: string;
    notes: string;
    category_id: number;
    created_at: string;
  }>
): Promise<boolean> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.en !== undefined) {
    fields.push('en = ?');
    values.push(data.en);
  }
  if (data.ja !== undefined) {
    fields.push('ja = ?');
    values.push(data.ja);
  }
  if (data.example !== undefined) {
    fields.push('example = ?');
    values.push(data.example);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes);
  }
  if (data.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(data.category_id);
  }
  if (data.created_at !== undefined) {
    fields.push('created_at = ?');
    values.push(data.created_at);
  }

  if (fields.length === 0) {
    return false;
  }

  fields.push('updated_at = datetime("now")');
  values.push(id);

  const query = `UPDATE words SET ${fields.join(', ')} WHERE id = ?`;
  const result = await db.prepare(query).bind(...values).run();

  return result.success;
}

export async function deleteWord(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM words WHERE id = ?').bind(id).run();
  return result.success;
}

export async function getRandomWords(db: D1Database, count: number = 10): Promise<Word[]> {
  const result = await db
    .prepare('SELECT * FROM words ORDER BY RANDOM() LIMIT ?')
    .bind(count)
    .all<Word>();
  return result.results || [];
}

// カテゴリ関連のデータベース操作

export async function getAllCategories(db: D1Database): Promise<Category[]> {
  const result = await db.prepare('SELECT * FROM categories ORDER BY name').all<Category>();
  return result.results || [];
}

export async function getCategoryById(db: D1Database, id: number): Promise<Category | null> {
  const result = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first<Category>();
  return result;
}

export async function createCategory(
  db: D1Database,
  data: { name: string; color?: string; description?: string }
): Promise<number> {
  const result = await db
    .prepare('INSERT INTO categories (name, color, description) VALUES (?, ?, ?) RETURNING id')
    .bind(data.name, data.color || null, data.description || null)
    .first<{ id: number }>();

  return result?.id || 0;
}

export async function updateCategory(
  db: D1Database,
  id: number,
  data: Partial<{ name: string; color: string; description: string }>
): Promise<boolean> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.color !== undefined) {
    fields.push('color = ?');
    values.push(data.color);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(id);

  const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  const result = await db.prepare(query).bind(...values).run();

  return result.success;
}

export async function deleteCategory(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  return result.success;
}

// 学習記録関連のデータベース操作

export async function recordStudySession(
  db: D1Database,
  word_id: number,
  result: 'correct' | 'incorrect'
): Promise<boolean> {
  // 学習セッションを記録
  const sessionResult = await db
    .prepare('INSERT INTO study_sessions (word_id, result) VALUES (?, ?)')
    .bind(word_id, result)
    .run();

  if (!sessionResult.success) {
    return false;
  }

  // 単語の統計を更新
  const updateQuery = result === 'correct'
    ? `UPDATE words
       SET review_count = review_count + 1,
           correct_count = correct_count + 1,
           mastery_level = MIN(mastery_level + 1, 5),
           last_reviewed_at = datetime('now')
       WHERE id = ?`
    : `UPDATE words
       SET review_count = review_count + 1,
           mastery_level = MAX(mastery_level - 1, 0),
           last_reviewed_at = datetime('now')
       WHERE id = ?`;

  const updateResult = await db.prepare(updateQuery).bind(word_id).run();

  return updateResult.success;
}

export async function getStudyStats(db: D1Database): Promise<{
  total_words: number;
  mastered_words: number;
  review_needed: number;
  total_sessions: number;
}> {
  const totalWords = await db.prepare('SELECT COUNT(*) as count FROM words').first<{ count: number }>();
  const masteredWords = await db
    .prepare('SELECT COUNT(*) as count FROM words WHERE mastery_level >= 4')
    .first<{ count: number }>();
  const reviewNeeded = await db
    .prepare('SELECT COUNT(*) as count FROM words WHERE mastery_level < 3')
    .first<{ count: number }>();
  const totalSessions = await db
    .prepare('SELECT COUNT(*) as count FROM study_sessions')
    .first<{ count: number }>();

  return {
    total_words: totalWords?.count || 0,
    mastered_words: masteredWords?.count || 0,
    review_needed: reviewNeeded?.count || 0,
    total_sessions: totalSessions?.count || 0,
  };
}
