// APIレスポンスの型定義

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

export type CreateWordInput = {
  en: string;
  ja: string;
  example?: string;
  notes?: string;
  category_id?: number;
  created_at?: string;
};

export type UpdateWordInput = Partial<CreateWordInput>;

export type CreateCategoryInput = {
  name: string;
  color?: string;
  description?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type StudyResult = 'correct' | 'incorrect';

export type Stats = {
  total_words: number;
  mastered_words: number;
  review_needed: number;
  total_sessions: number;
};

// 認証関連の型定義

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  expiresIn: number;
};

// 例文生成関連の型定義

export type GeneratedExample = {
  en: string;
  ja: string;
};
