export function categoryHref(category: string): string {
  return `/blog/category/${encodeURIComponent(category)}`
}
