<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api';
  import { authStore } from '$lib/stores/auth';

  // State
  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  // Functions
  async function handleLogin() {
    error = '';
    loading = true;

    try {
      const response = await login(username, password);
      authStore.login(response.token);
      goto('/');
    } catch (err) {
      error = err instanceof Error ? err.message : 'ログインに失敗しました';
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h1>管理者ログイン</h1>

    <form onsubmit={handleLogin}>
      <div class="form-group">
        <label for="username">ユーザー名</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          placeholder="ユーザー名を入力"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="password">パスワード</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="パスワードを入力"
          required
          disabled={loading}
        />
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button type="submit" disabled={loading}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  </div>
</div>

<style lang="scss">
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h1 {
      margin-bottom: 2rem;
      text-align: center;
      color: #333;
    }
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #4a90e2;
      }

      &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
    }
  }

  .error-message {
    padding: 0.75rem;
    margin-bottom: 1rem;
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background-color: #357abd;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
</style>
