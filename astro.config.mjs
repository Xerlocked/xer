import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
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
  integrations: [mdx(), sitemap(), solidJs(), tailwind({ applyBaseStyles: false })],
  markdown: {
    remarkPlugins: [remarkDirective, remarkAdmonitions, remarkGithub, remarkMath],
    rehypePlugins: [rehypeImageCaption, rehypeKatex],
  },
})