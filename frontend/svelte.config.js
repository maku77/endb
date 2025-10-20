import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
  },
  compilerOptions: {
    // Svelte 5 の `$state` などを使ったコードが警告されないようにする
    runes: true,
  },
};

export default config;
