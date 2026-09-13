import type { CollectionEntry } from "astro:content"

export function getSeriesPosts(posts: CollectionEntry<"blog">[], series: string) {
  const items = posts
    .filter(post => !post.data.draft && post.data.series === series)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0))

  const orders = new Set<number>()
  for (const post of items) {
    const order = post.data.seriesOrder
    if (order === undefined || orders.has(order)) {
      throw new Error(`시리즈 "${series}"의 순서를 확인해주세요: ${post.id} (seriesOrder: ${order})`)
    }
    orders.add(order)
  }
  return items
}
