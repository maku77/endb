<script lang="ts">
  import type { Word, Category, CreateWordInput } from '../types';
  import { generateExamples } from '../api';

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
  let created_at = $state(
    word?.created_at ? word.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  let errors = $state<Record<string, string>>({});

  // 例文生成用の状態
  let generatedExamples = $state<string[]>([]);
  let isGenerating = $state(false);
  let generateError = $state<string | null>(null);
  let debugLogs = $state<string[]>([]);

  // Functions
  function validate(): boolean {
    errors = {};

    if (!en.trim()) {
      errors.en = '英単語は必須です';
    }

    if (!ja.trim()) {
      errors.ja = '日本語訳は必須です';
    }

    if (!created_at || !/^\d{4}-\d{2}-\d{2}$/.test(created_at)) {
      errors.created_at = '日付はYYYY-MM-DD形式で入力してください';
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
      created_at: created_at,
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

  async function handleGenerateExamples() {
    if (!en.trim()) {
      generateError = '英単語を入力してください';
      return;
    }

    isGenerating = true;
    generateError = null;
    generatedExamples = [];
    debugLogs = [];

    try {
      const result = await generateExamples(en.trim(), ja.trim() || undefined);
      generatedExamples = result.examples;
      debugLogs = result.logs || [];
      console.log('API Response:', result);
      console.log('Debug logs:', debugLogs);
    } catch (error) {
      console.error('Error generating examples:', error);
      if (error instanceof Error) {
        generateError = `例文生成に失敗しました: ${error.message}`;
      } else {
        generateError = '例文生成に失敗しました';
      }
    } finally {
      isGenerating = false;
    }
  }
</script>

<form class="word-form" onsubmit={handleSubmit}>
  <div class="form-group">
    <label for="en" class="form-label">英単語 *</label>
    <div class="input-with-button">
      <input
        id="en"
        type="text"
        class="form-input"
        class:form-input--error={errors.en}
        bind:value={en}
        placeholder="例: apple"
      />
      <button
        type="button"
        class="btn btn--generate"
        onclick={handleGenerateExamples}
        disabled={isGenerating}
      >
        {isGenerating ? '生成中...' : '例文生成'}
      </button>
    </div>
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
    <label for="created_at" class="form-label">登録日 *</label>
    <input
      id="created_at"
      type="date"
      class="form-input"
      class:form-input--error={errors.created_at}
      bind:value={created_at}
    />
    {#if errors.created_at}
      <span class="form-error">{errors.created_at}</span>
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

  {#if generatedExamples.length > 0}
    <div class="generated-examples">
      <h3 class="generated-examples__title">生成された例文</h3>
      <ul class="generated-examples__list">
        {#each generatedExamples as example}
          <li class="generated-examples__item">{example}</li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if generateError}
    <div class="generate-error">
      {generateError}
    </div>
  {/if}

  {#if debugLogs.length > 0}
    <div class="debug-logs">
      <h4 class="debug-logs__title">デバッグログ</h4>
      <pre class="debug-logs__content">{debugLogs.join('\n')}</pre>
    </div>
  {/if}

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

    &--generate {
      padding: $spacing-sm $spacing-md;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $color-background;
      background-color: $color-primary;
      border: none;
      border-radius: $border-radius-sm;
      cursor: pointer;
      transition: all $transition-normal;
      white-space: nowrap;

      &:hover:not(:disabled) {
        background-color: $color-primary-dark;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .input-with-button {
    display: flex;
    gap: $spacing-sm;
    align-items: center;

    .form-input {
      flex: 1;
    }
  }

  .generated-examples {
    background-color: rgba($color-primary, 0.05);
    border: 1px solid rgba($color-primary, 0.2);
    border-radius: $border-radius-md;
    padding: $spacing-md;

    &__title {
      margin: 0 0 $spacing-sm 0;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $color-text-primary;
    }

    &__list {
      margin: 0;
      padding-left: $spacing-lg;
    }

    &__item {
      margin-bottom: $spacing-xs;
      color: $color-text-secondary;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .generate-error {
    padding: $spacing-sm $spacing-md;
    background-color: rgba($color-danger, 0.1);
    border: 1px solid $color-danger;
    border-radius: $border-radius-sm;
    color: $color-danger;
    font-size: $font-size-sm;
  }

  .debug-logs {
    background-color: $color-background-tertiary;
    border: 1px solid $color-border;
    border-radius: $border-radius-sm;
    padding: $spacing-sm;
    margin-top: $spacing-md;

    &__title {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $color-text-secondary;
    }

    &__content {
      margin: 0;
      font-family: $font-family-mono;
      font-size: $font-size-xs;
      color: $color-text-secondary;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
</style>
