import type { CollectionEntry } from "astro:content"
import { createEffect, createMemo, createSignal, For, onMount, Show } from "solid-js"
import Fuse from "fuse.js"
import ArrowCard from "@components/ArrowCard"
import { cn } from "@lib/utils"
import SearchBar from "@components/SearchBar"

const POSTS_PER_PAGE = 10;

type Props = {
  entry_name: string
  tags: string[]
  data: CollectionEntry<"blog">[] | CollectionEntry<'projects'>[]
}

export default function SearchCollection({ entry_name, data, tags }: Props) {
  const coerced = data.map((entry) => entry as CollectionEntry<'blog'>);

  const [query, setQuery] = createSignal("");
  const [filter, setFilter] = createSignal(new Set<string>())
  const [collection, setCollection] = createSignal<CollectionEntry<'blog'>[]>([])
  const [descending, setDescending] = createSignal(false);
  const [currentPage, setCurrentPage] = createSignal(1);

  const fuse = new Fuse(coerced, {
    keys: ["id", "data.title", "data.summary", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4,
  })

  createEffect(() => {
    const filtered = (query().length < 2
      ? coerced
      : fuse.search(query()).map((result) => result.item)
    ).filter((entry) =>
      Array.from(filter()).every((value) =>
        entry.data.tags.some((tag: string) =>
          tag.toLowerCase() === String(value).toLowerCase()
        )
      )
    );
    setCollection(descending() ? filtered.toReversed() : filtered)
    setCurrentPage(1);
  })

  const totalPages = createMemo(() => Math.ceil(collection().length / POSTS_PER_PAGE));

  const paginatedCollection = createMemo(() => {
    const start = (currentPage() - 1) * POSTS_PER_PAGE;
    return collection().slice(start, start + POSTS_PER_PAGE);
  });

  // Compute visible page numbers with ellipsis
  const pageNumbers = createMemo(() => {
    const total = totalPages();
    const current = currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  });

  function toggleDescending() {
    setDescending(!descending())
  }

  function toggleTag(tag: string) {
    setFilter((prev) =>
      new Set(prev.has(tag)
        ? [...prev].filter((t) => t !== tag)
        : [...prev, tag]
      )
    )
  }

  function clearFilters() {
    setFilter(new Set<string>());
  }

  function goToPage(page: number) {
    setCurrentPage(page);
    document.getElementById("post-list-top")?.scrollIntoView({ behavior: "smooth" });
  }

  const onSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  onMount(() => {
    const wrapper = document.getElementById("search-collection-wrapper");
    if (wrapper) {
      wrapper.style.minHeight = "unset";
    }
  })

  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Control Panel*/}
      <div class="min-w-0 col-span-1">
        <div class="sticky top-24 mt-7">
          {/* Search Bar */}
          <SearchBar onSearchInput={onSearchInput} query={query} setQuery={setQuery} placeholderText={`${entry_name} 검색`} />
          {/* Tag Filters */}
          <div class="relative flex flex-row justify-between w-full"><p class="text-sm font-semibold uppercase my-4 text-foreground">Tags</p>
            {filter().size > 0 && (
              <button
                onClick={clearFilters}
                aria-label="태그 필터 초기화"
                class="absolute flex justify-center items-center h-full w-10 right-0 top-0 stroke-current hover:text-foreground"
              >
                <svg class="size-5">
                  <use href={`/ui.svg#x`} />
                </svg>
              </button>
            )}</div>
          <ul class="flex flex-wrap sm:flex-col gap-1.5">
            <For each={tags}>
              {(tag) => (
                <li class="sm:w-full">
                  <button
                    onClick={() => toggleTag(tag)}
                    aria-pressed={filter().has(tag)}
                    class={cn(
                      "w-full min-h-9 px-2.5 py-2 rounded-md text-sm border",
                      "flex gap-2 items-center",
                      "transition-colors duration-150",
                      filter().has(tag)
                        ? "bg-accent border-border text-foreground font-semibold"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <svg
                      class={cn(
                        "shrink-0 size-5 fill-muted-foreground",
                        "transition-colors duration-150",
                        filter().has(tag) && "fill-foreground"
                      )}
                    >
                      <use
                        href={`/ui.svg#square`}
                        class={cn(!filter().has(tag) ? "block" : "hidden")}
                      />
                      <use
                        href={`/ui.svg#square-check`}
                        class={cn(filter().has(tag) ? "block" : "hidden")}
                      />
                    </svg>

                    <span class="truncate block min-w-0 pt-[2px]">
                      {tag}
                    </span>
                  </button>

                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
      {/* Posts */}
      <div class="min-w-0 col-span-1 sm:col-span-2">
        <div class="flex flex-col">
          {/* Info Bar */}
          <div id="post-list-top" class='flex flex-wrap items-center justify-between gap-2 mb-4 scroll-mt-24'>
            <div class="text-xs tabular-nums">
              전체 {data.length}개 | 선택됨 {collection().length}개
            </div>
            <button onClick={toggleDescending} class='ui-button stroke-current'>
              <div class="text-sm uppercase">
                {descending() ? "내림차순" : "오름차순"}
              </div>
              <svg
                class="size-5 left-2 top-[0.45rem]"
              >
                <use href={`/ui.svg#sort-descending`} class={descending() ? "block" : "hidden"}></use>
                <use href={`/ui.svg#sort-ascending`} class={descending() ? "hidden" : "block"}></use>
              </svg>
            </button>
          </div>
          <ul class="flex flex-col gap-3">
            {paginatedCollection().map((entry) => (
              <li>
                <ArrowCard entry={entry} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <Show when={totalPages() > 1}>
            <nav aria-label="페이지 이동" class="flex flex-wrap items-center justify-center gap-1 mt-6">
              {/* Previous */}
              <button
                onClick={() => goToPage(Math.max(1, currentPage() - 1))}
                disabled={currentPage() === 1}
                class={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  "stroke-current",
                  currentPage() === 1
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                aria-label="이전 페이지"
              >
                <svg class="size-5">
                  <use href="/ui.svg#chevron-left" />
                </svg>
              </button>

              {/* Page Numbers */}
              <For each={pageNumbers()}>
                {(page) =>
                  page === "..." ? (
                    <span class="px-2 text-muted-foreground select-none">…</span>
                  ) : (
                    <button
                      onClick={() => goToPage(page as number)}
                      aria-current={currentPage() === page ? "page" : undefined}
                      class={cn(
                        "min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors duration-200",
                        currentPage() === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {page}
                    </button>
                  )
                }
              </For>

              {/* Next */}
              <button
                onClick={() => goToPage(Math.min(totalPages(), currentPage() + 1))}
                disabled={currentPage() === totalPages()}
                class={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  "stroke-current",
                  currentPage() === totalPages()
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                aria-label="다음 페이지"
              >
                <svg class="size-5">
                  <use href="/ui.svg#chevron-right" />
                </svg>
              </button>
            </nav>
          </Show>
        </div>
      </div>
    </div>
  )
}
