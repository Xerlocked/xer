import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { unified } from "@astrojs/markdown-remark"
import solidJs from "@astrojs/solid-js"
import remarkDirective from "remark-directive"
import remarkAdmonitions from "./src/lib/remark-admonitions.mjs"
import remarkGithub from "./src/lib/remark-github.mjs"
import rehypeImageCaption from "./src/lib/rehype-image-caption.mjs"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

// https://astro.build/config
export default defineConfig({
  site: "https://xerlocked.com",
  compressHTML: true,
  integrations: [mdx(), sitemap(), solidJs()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkAdmonitions, remarkGithub, remarkMath],
      rehypePlugins: [rehypeImageCaption, rehypeKatex],
    }),
  },
})
