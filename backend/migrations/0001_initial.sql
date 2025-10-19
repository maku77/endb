-- 英単語テーブル
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT NOT NULL,
  ja TEXT NOT NULL,
  example TEXT,
  notes TEXT,
  category_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_reviewed_at TEXT,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  mastery_level INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 学習セッション履歴テーブル
CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER NOT NULL,
  result TEXT NOT NULL CHECK(result IN ('correct', 'incorrect')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category_id);
CREATE INDEX IF NOT EXISTS idx_words_mastery ON words(mastery_level);
CREATE INDEX IF NOT EXISTS idx_study_sessions_word ON study_sessions(word_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_timestamp ON study_sessions(timestamp);

-- 初期カテゴリの挿入
INSERT INTO categories (name, color, description) VALUES
  ('基本単語', '#3b82f6', '基本的な英単語'),
  ('ビジネス', '#10b981', 'ビジネス英語'),
  ('技術用語', '#8b5cf6', 'IT・技術関連の用語'),
  ('日常会話', '#f59e0b', '日常会話で使う単語');
