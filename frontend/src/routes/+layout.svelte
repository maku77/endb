<script lang="ts">
  import '../styles/global.scss';
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
      </ul>
    </div>
  </nav>

  <main class="main">
    <slot />
  </main>
</div>

<style lang="scss">
  @import '../styles/variables.scss';
  @import '../styles/mixins.scss';

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
