import type {
  Word,
  Category,
  CreateWordInput,
  UpdateWordInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  StudyResult,
  Stats,
} from './types';

const API_BASE_URL = 'http://localhost:8787'; // Cloudflare Workers デフォルトポート

// ヘルパー関数
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// 単語関連のAPI

export async function getWords(filters?: {
  search?: string;
  category_id?: number;
  mastery_level?: number;
}): Promise<Word[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category_id !== undefined) params.append('category_id', String(filters.category_id));
  if (filters?.mastery_level !== undefined)
    params.append('mastery_level', String(filters.mastery_level));

  const url = `${API_BASE_URL}/api/words${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  return handleResponse<Word[]>(response);
}

export async function getWord(id: number): Promise<Word> {
  const response = await fetch(`${API_BASE_URL}/api/words/${id}`);
  return handleResponse<Word>(response);
}

export async function createWord(data: CreateWordInput): Promise<Word> {
  const response = await fetch(`${API_BASE_URL}/api/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Word>(response);
}

export async function updateWord(id: number, data: UpdateWordInput): Promise<Word> {
  const response = await fetch(`${API_BASE_URL}/api/words/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Word>(response);
}

export async function deleteWord(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/words/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

// カテゴリ関連のAPI

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  return handleResponse<Category[]>(response);
}

export async function getCategory(id: number): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
  return handleResponse<Category>(response);
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function updateCategory(id: number, data: UpdateCategoryInput): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

// 学習関連のAPI

export async function getRandomWords(count: number = 10): Promise<Word[]> {
  const response = await fetch(`${API_BASE_URL}/api/study/random?count=${count}`);
  return handleResponse<Word[]>(response);
}

export async function recordStudySession(
  word_id: number,
  result: StudyResult
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/study/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word_id, result }),
  });
  await handleResponse<{ message: string }>(response);
}

// 統計情報のAPI

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  return handleResponse<Stats>(response);
}
