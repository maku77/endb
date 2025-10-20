<script lang="ts">
  import type { Word, Category } from '../types';

  // Props
  let { word, category = null, handleEdit, handleDelete } = $props<{
    word: Word;
    category?: Category | null;
    handleEdit?: () => void;
    handleDelete?: () => void;
  }>();

  // Constants
  const masteryLabels = ['未学習', '初級', '中級', '中上級', '上級', '習得済み'];
  const masteryColors = ['#9ca3af', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#059669'];

  // Derived
  let mastery = $derived({
    label: masteryLabels[word.mastery_level] || '未学習',
    color: masteryColors[word.mastery_level] || masteryColors[0],
  });

  let accuracy = $derived(
    word.review_count > 0
      ? Math.round((word.correct_count / word.review_count) * 100)
      : 0
  );
</script>

<div class="word-card">
  <div class="word-card__header">
    <div class="word-card__main">
      <h3 class="word-card__en">{word.en}</h3>
      <p class="word-card__ja">{word.ja}</p>
    </div>
    <div class="word-card__badges">
      {#if category}
        <span class="badge badge--category" style="background-color: {category.color || '#3b82f6'}">
          {category.name}
        </span>
      {/if}
      <span class="badge badge--mastery" style="background-color: {mastery.color}">
        {mastery.label}
      </span>
    </div>
  </div>

  {#if word.example}
    <div class="word-card__example">
      <strong>例文:</strong>
      <p>{word.example}</p>
    </div>
  {/if}

  {#if word.notes}
    <div class="word-card__notes">
      <strong>メモ:</strong>
      <p>{word.notes}</p>
    </div>
  {/if}

  <div class="word-card__stats">
    <div class="stat">
      <span class="stat__label">復習回数</span>
      <span class="stat__value">{word.review_count}回</span>
    </div>
    <div class="stat">
      <span class="stat__label">正答率</span>
      <span class="stat__value">{accuracy}%</span>
    </div>
  </div>

  {#if handleEdit || handleDelete}
    <div class="word-card__actions">
      {#if handleEdit}
        <button class="btn btn--secondary" onclick={handleEdit}>編集</button>
      {/if}
      {#if handleDelete}
        <button class="btn btn--danger" onclick={handleDelete}>削除</button>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../styles/variables.scss';
  @import '../../styles/mixins.scss';

  .word-card {
    @include card;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: $spacing-md;
    }

    &__main {
      flex: 1;
    }

    &__en {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $color-text-primary;
      margin-bottom: $spacing-xs;
    }

    &__ja {
      font-size: $font-size-lg;
      color: $color-text-secondary;
      margin: 0;
    }

    &__badges {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      align-items: flex-end;
    }

    &__example,
    &__notes {
      padding: $spacing-md;
      background-color: $color-background-secondary;
      border-radius: $border-radius-md;
      font-size: $font-size-sm;
      color: $color-text-secondary;

      strong {
        display: block;
        margin-bottom: $spacing-xs;
        color: $color-text-primary;
      }

      p {
        margin: 0;
        line-height: $line-height-relaxed;
      }
    }

    &__stats {
      display: flex;
      gap: $spacing-lg;
      padding-top: $spacing-md;
      border-top: $border-width-thin solid $color-border;
    }

    &__actions {
      display: flex;
      gap: $spacing-sm;
      padding-top: $spacing-sm;
    }
  }

  .badge {
    @include badge;
    color: white;

    &--category {
      // カテゴリの色は動的に設定
    }

    &--mastery {
      // 習熟度の色は動的に設定
    }
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    &__label {
      font-size: $font-size-xs;
      color: $color-text-muted;
      font-weight: $font-weight-medium;
    }

    &__value {
      font-size: $font-size-base;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
    }
  }

  .btn {
    @include button-base;
    font-size: $font-size-sm;
    padding: $spacing-xs $spacing-md;

    &--secondary {
      @include button-secondary;
    }

    &--danger {
      @include button-danger;
    }
  }
</style>
