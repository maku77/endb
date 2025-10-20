<script lang="ts">
  import '../styles/global.scss';
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import type { Snippet } from 'svelte';

  // Props
  let { children }: { children: Snippet } = $props();

  // Derived: ログイン状態を取得
  let isLoggedIn = $derived($authStore !== null);

  // Functions
  function handleLogout() {
    authStore.logout();
    goto('/login');
  }
</script>

<div class="app">
  <nav class="nav">
    <div class="nav__container">
      <a href="/" class="nav__logo">📚 EnDB</a>
      <ul class="nav__menu">
        <li><a href="/" class="nav__link">単語一覧</a></li>
        <li><a href="/categories" class="nav__link">カテゴリ</a></li>
        <li><a href="/study" class="nav__link">学習</a></li>
        <li><a href="/stats" class="nav__link">統計</a></li>
        {#if isLoggedIn}
          <li><button class="nav__link nav__link--button" onclick={handleLogout}>ログアウト</button></li>
        {:else}
          <li><a href="/login" class="nav__link">ログイン</a></li>
        {/if}
      </ul>
    </div>
  </nav>

  <main class="main">
    {@render children()}
  </main>
</div>

<style lang="scss">
  @use '../styles' as *;

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .nav {
    background-color: $color-background;
    border-bottom: $border-width-thin solid $color-border;
    box-shadow: $shadow-sm;
    position: sticky;
    top: 0;
    z-index: $z-index-dropdown;

    &__container {
      max-width: 1280px;
      margin: 0 auto;
      padding: $spacing-md $spacing-lg;
      @include flex-between;
    }

    &__logo {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-text-primary;
      text-decoration: none;

      &:hover {
        color: $color-primary;
        text-decoration: none;
      }
    }

    &__menu {
      display: flex;
      gap: $spacing-lg;
      list-style: none;
    }

    &__link {
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $color-text-secondary;
      text-decoration: none;
      transition: color $transition-fast;

      &:hover {
        color: $color-primary;
        text-decoration: none;
      }

      &--button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
      }
    }
  }

  .main {
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: $spacing-xl $spacing-lg;
  }
</style>
