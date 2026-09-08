import { formatDate, truncateText } from "@lib/utils"
import type { CollectionEntry } from "astro:content"

type Props = {
  entry: CollectionEntry<"blog"> | CollectionEntry<"projects">
  pill?: boolean
}

export default function ArrowCard({ entry, pill }: Props) {
  return (
    <a href={`/${entry.collection}/${entry.id}`} class="ui-card group flex min-w-0 flex-col overflow-hidden">
      {entry.data.image && (
        <div class="w-full aspect-video overflow-hidden border-b border-border">
          <img src={entry.data.image.src} alt={entry.data.title} class="w-full h-full object-cover" />
        </div>
      )}
      <div class="p-5 flex items-center gap-3 w-full">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            {pill &&
              <div class="ui-badge capitalize">
                {entry.collection === "blog" ? "post" : "project"}
              </div>
            }
            <div class="text-xs tabular-nums">
              {formatDate(entry.data.date)}
            </div>
          </div>
          <div class="font-semibold mt-3 text-foreground tracking-tight line-clamp-2">
            {entry.data.title}
          </div>

          <div class="mt-2 text-sm leading-relaxed line-clamp-2">
            {entry.data.summary}
          </div>
          <ul class="flex flex-wrap mt-4 gap-1.5">
            {entry.data.tags.map((tag: string) => ( // this line has an error; Parameter 'tag' implicitly has an 'any' type.ts(7006)
              <li class="ui-badge">
                {truncateText(tag, 20)}
              </li>
            ))}
          </ul>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="stroke-current group-hover:stroke-foreground">
          <line x1="5" y1="12" x2="19" y2="12" class="scale-x-0 group-hover:scale-x-100 translate-x-4 group-hover:translate-x-1 transition-transform duration-150" />
          <polyline points="12 5 19 12 12 19" class="translate-x-0 group-hover:translate-x-1 transition-transform duration-150" />
        </svg>
      </div>
    </a>
  )
}
