import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseFrontmatter } from "@astrojs/markdown-remark"

const root = fileURLToPath(new URL("../", import.meta.url))
const dist = join(root, "dist")
const read = (path) => readFileSync(join(dist, path), "utf8")
const rss = read("rss.xml")
const sitemap = read("sitemap-0.xml")
let count = 0

// The original Astro 4 articles all use <folder>/index.md URLs.
for (const collection of ["blog", "projects"]) {
  const base = join(root, "src/content", collection)
  for (const folder of readdirSync(base, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue
    const source = readFileSync(join(base, folder.name, "index.md"), "utf8")
    const { frontmatter } = parseFrontmatter(source)
    const id = frontmatter.slug ?? folder.name
    const route = `/${collection}/${id}/`
    const html = read(`${collection}/${id}/index.html`)
    assert.ok(html.includes(`href="https://xerlocked.com${route}"`), `Canonical: ${route}`)
    assert.ok(rss.includes(`https://xerlocked.com${route}`), `RSS: ${route}`)
    assert.ok(sitemap.includes(`https://xerlocked.com${route}`), `Sitemap: ${route}`)
    assert.ok(html.includes("<article>"), `Article body: ${route}`)

    for (const [, src] of html.matchAll(/\bsrc="(\/[^"?#]*)/g)) {
      const asset = resolve(dist, `.${decodeURIComponent(src)}`)
      assert.ok(existsSync(asset), `Missing asset ${src} in ${route}`)
    }
    for (const [, href] of html.matchAll(/\bhref="(\/(?:blog|projects)\/[^"?#]*)/g)) {
      assert.ok(existsSync(join(dist, decodeURIComponent(href), "index.html")), `Broken link: ${href}`)
    }
    count++
  }
}

const math = read("blog/math-find-direction/index.html")
assert.match(math, /class="katex"/, "KaTeX math must render")
assert.match(math, /<github-card\b[^>]*data-repo="Xerlocked\/LightSwitchPlugin"/, "GitHub directive must render")
assert.match(math, /class="admonition note"/, "Admonitions must render")
assert.match(math, /<figcaption\b/, "Image captions must render")
assert.match(read("robots.txt"), /Sitemap: https:\/\/xerlocked\.com\/sitemap-index\.xml/)
for (const page of ["blog", "projects", "search"]) {
  assert.match(read(`${page}/index.html`), /<astro-island\b[^>]*client="load"/, `${page}: search island missing`)
}
const home = read("index.html")
const homeIslands = [...home.matchAll(/<astro-island\b[^>]*>/g)]
assert.equal(homeIslands.length, 1, "Only the home game should hydrate")
assert.match(homeIslands[0][0], /component-url="[^"]*ChaseGame[^\"]*"/, "Home game island missing")
assert.match(homeIslands[0][0], /client="visible"/, "Game should hydrate when visible")
assert.match(home, /<noscript>/, "Game must provide a no-JavaScript fallback")
assert.match(home, /href="\/blog"/, "Blog must be accessible without playing")
assert.match(home, /href="\/projects"/, "Projects must be accessible without playing")
assert.match(home, /<h1\b[^>]*id="landing-title"/, "Home introduction must be server-rendered")
console.log(`Verified ${count} article URLs, canonical/RSS/sitemap links, local assets, Markdown plugins, search islands, and the home game fallback.`)
