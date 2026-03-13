import { formatDate, truncateText } from "@lib/utils"
import type { CollectionEntry } from "astro:content"
import { For } from "solid-js"

type Props = {
  entry: CollectionEntry<"blog"> | CollectionEntry<"projects">
  pill?: boolean
}

export default function ArrowCard({ entry, pill }: Props) {
  return (
    <a href={`/${entry.collection}/${entry.slug}`} class="group flex flex-col border rounded-lg hover:bg-black/5 hover:dark:bg-white/10 border-black/15 dark:border-white/20 transition-colors duration-300 ease-in-out overflow-hidden">
      {entry.data.image && (
        <div class="w-full aspect-video overflow-hidden border-b border-black/15 dark:border-white/20">
          <img src={entry.data.image.src} alt={entry.data.title} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
      )}
      <div class="p-4 flex items-center gap-3 w-full">
        <div class="flex-1 group-hover:text-black group-hover:dark:text-white blend">
          <div class="flex flex-wrap items-center gap-2">
            {pill &&
              <div class="text-sm capitalize px-2 py-0.5 rounded-full border border-black/15 dark:border-white/25">
                {entry.collection === "blog" ? "post" : "project"}
              </div>
            }
            <div class="text-sm uppercase">
              {formatDate(entry.data.date)}
            </div>
          </div>
          <div class="font-semibold mt-3 text-black dark:text-white line-clamp-2">
            {entry.data.title}
          </div>

          <div class="text-sm line-clamp-2">
            {entry.data.summary}
          </div>
          <ul class="flex flex-wrap mt-2 gap-1">
            <For each={entry.data.tags}>
              {(tag: string) => (
                <li class="text-xs uppercase py-0.5 px-2 rounded bg-black/5 dark:bg-white/20 text-black/75 dark:text-white/75">
                  {truncateText(tag, 20)}
                </li>
              )}
            </For>
          </ul>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="stroke-current group-hover:stroke-black group-hover:dark:stroke-white">
          <line x1="5" y1="12" x2="19" y2="12" class="scale-x-0 group-hover:scale-x-100 translate-x-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
          <polyline points="12 5 19 12 12 19" class="translate-x-0 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
        </svg>
      </div>
    </a>
  )
}