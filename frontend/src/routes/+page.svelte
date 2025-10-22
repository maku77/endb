<script lang="ts">
  import type { Word, Category } from '$lib/types';
  import * as api from '$lib/api';
  import WordCard from '$lib/components/WordCard.svelte';
  import WordForm from '$lib/components/WordForm.svelte';
  import { authStore } from '$lib/stores/auth';

  // State
  let words = $state<Word[]>([]);
  let categories = $state<Category[]>([]);
  let loading = $state(true);
  let error = $state('');
  let searchQuery = $state('');
  let selectedCategory = $state<number | undefined>(undefined);
  let selectedMastery = $state<number | undefined>(undefined);
  let showForm = $state(false);
  let editingWord = $state<Word | null>(null);

  // Derived - authentication status
  let isAuthenticated = $derived($authStore !== null);

  // Effects
  $effect(() => {
    loadData();
  });

  // Functions
  async function loadData() {
    try {
      loading = true;
      error = '';
      [words, categories] = await Promise.all([
        api.getWords({ search: searchQuery, category_id: selectedCategory, mastery_level: selectedMastery }),
        api.getCategories(),
      ]);
    } catch (e) {
      error = `データの読み込みに失敗しました: ${e}`;
    } finally {
      loading = false;
    }
  }

  async function handleSearch() {
    await loadData();
  }

  async function handleSubmit(data: any) {
    try {
      error = '';
      if (editingWord) {
        await api.updateWord(editingWord.id, data);
      } else {
        await api.createWord(data);
      }
      showForm = false;
      editingWord = null;
      await loadData();
    } catch (e) {
      error = `保存に失敗しました: ${e}`;
    }
  }

  async function handleDelete(word: Word) {
    if (!confirm(`「${word.en}」を削除しますか？`)) {
      return;
    }

    try {
      error = '';
      await api.deleteWord(word.id);
      await loadData();
    } catch (e) {
      error = `削除に失敗しました: ${e}`;
    }
  }

  function handleEdit(word: Word) {
    editingWord = word;
    showForm = true;
  }

  function handleCancel() {
    showForm = false;
    editingWord = null;
  }

  function handleNewWord() {
    editingWord = null;
    showForm = true;
  }

  function getCategoryById(id: number | null): Category | null {
    if (!id) return null;
    return categories.find((c) => c.id === id) || null;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1 class="page-title">単語一覧</h1>
    {#if isAuthenticated}
      <button class="btn btn--primary" onclick={handleNewWord}>
        + 新しい単語を追加
      </button>
    {/if}
  </header>

  {#if error}
    <div class="alert alert--error">{error}</div>
  {/if}

  {#if showForm}
    <div class="form-container">
      <h2 class="form-title">{editingWord ? '単語を編集' : '新しい単語を登録'}</h2>
      <WordForm
        {categories}
        word={editingWord}
        {handleSubmit}
        {handleCancel}
      />
    </div>
  {/if}

  <div class="content-section" class:content-section--hidden={showForm}>
    <div class="filters">
      <div class="filter-group">
        <input
          type="text"
          class="filter-input"
          bind:value={searchQuery}
          placeholder="単語を検索..."
          onkeyup={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button class="btn btn--secondary" onclick={handleSearch}>検索</button>
      </div>

      <div class="filter-group">
        <select class="filter-select" bind:value={selectedCategory} onchange={handleSearch}>
          <option value={undefined}>全カテゴリ</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>

        <select class="filter-select" bind:value={selectedMastery} onchange={handleSearch}>
          <option value={undefined}>全レベル</option>
          <option value={0}>未学習</option>
          <option value={1}>初級</option>
          <option value={2}>中級</option>
          <option value={3}>中上級</option>
          <option value={4}>上級</option>
          <option value={5}>習得済み</option>
        </select>
      </div>
    </div>

    {#if loading}
      <div class="loading">読み込み中...</div>
    {:else if words.length === 0}
      <div class="empty">
        <p>単語が登録されていません。</p>
        {#if isAuthenticated}
          <button class="btn btn--primary" onclick={handleNewWord}>
            最初の単語を登録する
          </button>
        {/if}
      </div>
    {:else}
      <div class="words-grid">
        {#each words as word (word.id)}
          <WordCard
            {word}
            category={getCategoryById(word.category_id)}
            handleEdit={isAuthenticated ? () => handleEdit(word) : undefined}
            handleDelete={isAuthenticated ? () => handleDelete(word) : undefined}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use '../styles' as *;

  .page {
    max-width: 100%;
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

  .content-section {
    &--hidden {
      display: none;
    }
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
    padding: $spacing-lg;
    background-color: $color-background;
    border-radius: $border-radius-lg;
    border: $border-width-thin solid $color-border;

    @include responsive-md {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  .filter-group {
    display: flex;
    gap: $spacing-sm;
    flex: 1;
  }

  .filter-input,
  .filter-select {
    @include input-base;
  }

  .filter-input {
    flex: 1;
  }

  .words-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;

    @include responsive-md {
      grid-template-columns: repeat(2, 1fr);
    }

    @include responsive-lg {
      grid-template-columns: repeat(3, 1fr);
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
  }
</style>
