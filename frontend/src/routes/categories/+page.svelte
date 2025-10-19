<script lang="ts">
  import { onMount } from 'svelte';
  import type { Category } from '$lib/types';
  import * as api from '$lib/api';

  let categories: Category[] = [];
  let loading = true;
  let error = '';

  let showForm = false;
  let editingCategory: Category | null = null;

  let name = '';
  let color = '#3b82f6';
  let description = '';
  let formErrors: Record<string, string> = {};

  onMount(async () => {
    await loadCategories();
  });

  async function loadCategories() {
    try {
      loading = true;
      error = '';
      categories = await api.getCategories();
    } catch (e) {
      error = `カテゴリの読み込みに失敗しました: ${e}`;
    } finally {
      loading = false;
    }
  }

  function handleNew() {
    editingCategory = null;
    name = '';
    color = '#3b82f6';
    description = '';
    formErrors = {};
    showForm = true;
  }

  function handleEdit(category: Category) {
    editingCategory = category;
    name = category.name;
    color = category.color || '#3b82f6';
    description = category.description || '';
    formErrors = {};
    showForm = true;
  }

  function handleCancel() {
    showForm = false;
    editingCategory = null;
    formErrors = {};
  }

  function validate(): boolean {
    formErrors = {};

    if (!name.trim()) {
      formErrors.name = 'カテゴリ名は必須です';
    }

    return Object.keys(formErrors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      error = '';
      const data = {
        name: name.trim(),
        color: color,
        description: description.trim() || undefined,
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, data);
      } else {
        await api.createCategory(data);
      }

      showForm = false;
      editingCategory = null;
      await loadCategories();
    } catch (e) {
      error = `保存に失敗しました: ${e}`;
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`カテゴリ「${category.name}」を削除しますか？\n関連する単語のカテゴリ情報は削除されます。`)) {
      return;
    }

    try {
      error = '';
      await api.deleteCategory(category.id);
      await loadCategories();
    } catch (e) {
      error = `削除に失敗しました: ${e}`;
    }
  }
</script>

<div class="page">
  <header class="page-header">
    <h1 class="page-title">カテゴリ管理</h1>
    <button class="btn btn--primary" on:click={handleNew}>
      + 新しいカテゴリを追加
    </button>
  </header>

  {#if error}
    <div class="alert alert--error">{error}</div>
  {/if}

  {#if showForm}
    <div class="form-container">
      <h2 class="form-title">{editingCategory ? 'カテゴリを編集' : '新しいカテゴリを作成'}</h2>
      <form class="category-form" on:submit={handleSubmit}>
        <div class="form-group">
          <label for="name" class="form-label">カテゴリ名 *</label>
          <input
            id="name"
            type="text"
            class="form-input"
            class:form-input--error={formErrors.name}
            bind:value={name}
            placeholder="例: ビジネス英語"
          />
          {#if formErrors.name}
            <span class="form-error">{formErrors.name}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="color" class="form-label">カラー</label>
          <div class="color-input-wrapper">
            <input
              id="color"
              type="color"
              class="color-input"
              bind:value={color}
            />
            <span class="color-value">{color}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">説明</label>
          <textarea
            id="description"
            class="form-textarea"
            bind:value={description}
            placeholder="このカテゴリの説明"
            rows="3"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary">
            {editingCategory ? '更新' : '作成'}
          </button>
          <button type="button" class="btn btn--secondary" on:click={handleCancel}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  {/if}

  {#if loading}
    <div class="loading">読み込み中...</div>
  {:else if categories.length === 0}
    <div class="empty">
      <p>カテゴリが登録されていません。</p>
      <button class="btn btn--primary" on:click={handleNew}>
        最初のカテゴリを作成する
      </button>
    </div>
  {:else}
    <div class="categories-list">
      {#each categories as category (category.id)}
        <div class="category-card">
          <div class="category-card__header">
            <div class="category-card__info">
              <div
                class="category-card__color"
                style="background-color: {category.color || '#3b82f6'}"
              />
              <div>
                <h3 class="category-card__name">{category.name}</h3>
                {#if category.description}
                  <p class="category-card__description">{category.description}</p>
                {/if}
              </div>
            </div>
            <div class="category-card__actions">
              <button class="btn btn--secondary" on:click={() => handleEdit(category)}>
                編集
              </button>
              <button class="btn btn--danger" on:click={() => handleDelete(category)}>
                削除
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../styles/variables.scss';
  @import '../../styles/mixins.scss';

  .page {
    max-width: 800px;
    margin: 0 auto;
  }

  .page-header {
    @include flex-between;
    margin-bottom: $spacing-xl;
    flex-wrap: wrap;
    gap: $spacing-md;
  }

  .page-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    margin: 0;
  }

  .form-container {
    @include card;
    margin-bottom: $spacing-xl;
  }

  .form-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-lg;
  }

  .category-form {
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

  .color-input-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .color-input {
    width: 60px;
    height: 40px;
    border: $border-width-thin solid $color-border;
    border-radius: $border-radius-md;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 2px;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: $border-radius-sm;
    }
  }

  .color-value {
    font-family: $font-family-mono;
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }

  .form-actions {
    display: flex;
    gap: $spacing-sm;
    padding-top: $spacing-md;
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .category-card {
    @include card;

    &__header {
      @include flex-between;
      gap: $spacing-md;
      flex-wrap: wrap;
    }

    &__info {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      flex: 1;
    }

    &__color {
      width: 40px;
      height: 40px;
      border-radius: $border-radius-md;
      flex-shrink: 0;
    }

    &__name {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    &__description {
      font-size: $font-size-sm;
      color: $color-text-secondary;
      margin: 0;
    }

    &__actions {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .loading,
  .empty {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-3xl;
    text-align: center;
    color: $color-text-secondary;
  }

  .alert {
    padding: $spacing-md;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-lg;
    font-size: $font-size-sm;

    &--error {
      background-color: rgba($color-danger, 0.1);
      color: $color-danger;
      border: $border-width-thin solid rgba($color-danger, 0.3);
    }
  }

  .btn {
    &--primary {
      @include button-primary;
    }

    &--secondary {
      @include button-secondary;
    }

    &--danger {
      @include button-danger;
    }
  }
</style>
