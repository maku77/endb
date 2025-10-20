import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const TOKEN_KEY = 'endb_auth_token';

// トークンの初期値をlocalStorageから取得
function getInitialToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

// 認証ストア
function createAuthStore() {
  const { subscribe, set } = writable<string | null>(getInitialToken());

  return {
    subscribe,
    login: (token: string) => {
      if (browser) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      set(token);
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem(TOKEN_KEY);
      }
      set(null);
    },
    // トークンを取得（同期的に）
    getToken: (): string | null => {
      if (!browser) return null;
      return localStorage.getItem(TOKEN_KEY);
    },
  };
}

export const authStore = createAuthStore();

// ログイン状態を判定するヘルパー
export function isAuthenticated(): boolean {
  return authStore.getToken() !== null;
}
