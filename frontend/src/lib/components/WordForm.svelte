<script lang="ts">
  import type { Word, Category, CreateWordInput } from '../types';

  // Props
  let { categories = [], word = null, handleSubmit: onSubmit, handleCancel } = $props<{
    categories?: Category[];
    word?: Word | null;
    handleSubmit: (data: CreateWordInput) => void;
    handleCancel?: () => void;
  }>();

  // State
  let en = $state(word?.en || '');
  let ja = $state(word?.ja || '');
  let example = $state(word?.example || '');
  let notes = $state(word?.notes || '');
  let category_id = $state<number | undefined>(word?.category_id || undefined);
  let errors = $state<Record<string, string>>({});

  // Functions
  function validate(): boolean {
    errors = {};

    if (!en.trim()) {
      errors.en = '英単語は必須です';
    }

    if (!ja.trim()) {
      errors.ja = '日本語訳は必須です';
    }

    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateWordInput = {
      en: en.trim(),
      ja: ja.trim(),
    };

    if (example.trim()) {
      data.example = example.trim();
    }

    if (notes.trim()) {
      data.notes = notes.trim();
    }

    if (category_id) {
      data.category_id = category_id;
    }

    onSubmit(data);
  }
</script>

<form class="word-form" onsubmit={handleSubmit}>
  <div class="form-group">
    <label for="en" class="form-label">英単語 *</label>
    <input
      id="en"
      type="text"
      class="form-input"
      class:form-input--error={errors.en}
      bind:value={en}
      placeholder="例: apple"
    />
    {#if errors.en}
      <span class="form-error">{errors.en}</span>
    {/if}
  </div>

  <div class="form-group">
    <label for="ja" class="form-label">日本語訳 *</label>
    <input
      id="ja"
      type="text"
      class="form-input"
      class:form-input--error={errors.ja}
      bind:value={ja}
      placeholder="例: りんご"
    />
    {#if errors.ja}
      <span class="form-error">{errors.ja}</span>
    {/if}
  </div>

  <div class="form-group">
    <label for="category" class="form-label">カテゴリ</label>
    <select id="category" class="form-select" bind:value={category_id}>
      <option value={undefined}>-- 選択してください --</option>
      {#each categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="example" class="form-label">例文</label>
    <textarea
      id="example"
      class="form-textarea"
      bind:value={example}
      placeholder="例: I ate an apple for breakfast."
      rows="3"
    ></textarea>
  </div>

  <div class="form-group">
    <label for="notes" class="form-label">メモ</label>
    <textarea
      id="notes"
      class="form-textarea"
      bind:value={notes}
      placeholder="覚え方やヒントなど"
      rows="3"
    ></textarea>
  </div>

  <div class="form-actions">
    <button type="submit" class="btn btn--primary">
      {word ? '更新' : '登録'}
    </button>
    {#if handleCancel}
      <button type="button" class="btn btn--secondary" onclick={handleCancel}>
        キャンセル
      </button>
    {/if}
  </div>
</form>

<style lang="scss">
  @use '../../styles' as *;

  .word-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .form-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
  }

  .form-input,
  .form-select,
  .form-textarea {
    @include input-base;
  }

  .form-input--error {
    border-color: $color-danger;

    &:focus {
      border-color: $color-danger;
      box-shadow: 0 0 0 3px rgba($color-danger, 0.1);
    }
  }

  .form-error {
    font-size: $font-size-xs;
    color: $color-danger;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-actions {
    display: flex;
    gap: $spacing-sm;
    padding-top: $spacing-md;
  }

  .btn {
    &--primary {
      @include button-primary;
    }

    &--secondary {
      @include button-secondary;
    }
  }
</style>
