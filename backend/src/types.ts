// データベースの型定義

export type Word = {
  id: number;
  en: string;
  ja: string;
  example: string | null;
  notes: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  last_reviewed_at: string | null;
  review_count: number;
  correct_count: number;
  mastery_level: number;
};

export type Category = {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
  created_at: string;
};

export type StudySession = {
  id: number;
  word_id: number;
  result: 'correct' | 'incorrect';
  timestamp: string;
};

// API リクエストの型定義

export type CreateWordRequest = {
  en: string;
  ja: string;
  example?: string;
  notes?: string;
  category_id?: number;
};

export type UpdateWordRequest = Partial<CreateWordRequest>;

export type CreateCategoryRequest = {
  name: string;
  color?: string;
  description?: string;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type RecordStudyRequest = {
  word_id: number;
  result: 'correct' | 'incorrect';
};

// Cloudflare Workers の環境変数の型定義
export type Env = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
};
