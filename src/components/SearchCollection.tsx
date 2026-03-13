import type { CollectionEntry } from "astro:content"
import { createEffect, createMemo, createSignal, For, onMount } from "solid-js"
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
  const [descending, setDescending] = createSignal(false);
  const [currentPage, setCurrentPage] = createSignal(1);

  const collection = createMemo(() => {
    const q = query().toLowerCase();
    const f = filter();
    
    // First, filter by query
    let filtered = coerced;
    if (q.length >= 2) {
      filtered = coerced.filter(entry => {
        return (
          entry.slug.toLowerCase().includes(q) ||
          entry.data.title.toLowerCase().includes(q) ||
          (entry.data.summary && entry.data.summary.toLowerCase().includes(q)) ||
          entry.data.tags.some((tag: string) => tag.toLowerCase().includes(q))
        );
      });
    }

    // Then, filter by selected tags
    if (f.size > 0) {
      filtered = filtered.filter((entry) =>
        Array.from(f).every((value) =>
          entry.data.tags.some((tag: string) =>
            tag.toLowerCase() === String(value).toLowerCase()
          )
        )
      );
    }
    
    return descending() ? filtered.toReversed() : filtered;
  });

  createEffect(() => {
    // Reset page to 1 when search, filter, or sort changes
    query();
    filter();
    descending();
    setCurrentPage(1);
  });

  const totalPages = createMemo(() => Math.max(1, Math.ceil(collection().length / POSTS_PER_PAGE)));

  const paginatedCollection = createMemo(() => {
    const start = (currentPage() - 1) * POSTS_PER_PAGE;
    return collection().slice(start, start + POSTS_PER_PAGE);
  });

  // Generate visible page numbers with ellipsis
  const pageNumbers = createMemo(() => {
    const total = totalPages();
    const current = currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("ellipsis-start");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("ellipsis-end");
      pages.push(total);
    }
    return pages;
  });

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages())));
  }

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
      <div class="col-span-3 sm:col-span-1">
        <div class="sticky top-24 mt-7">
          {/* Search Bar */}
          <SearchBar onSearchInput={onSearchInput} query={query} setQuery={setQuery} placeholderText={`${entry_name} 검색`} />
          {/* Tag Filters */}
          <div class="relative flex flex-row justify-between w-full"><p class="text-sm font-semibold uppercase my-4 text-black dark:text-white">Tags</p>
            {filter().size > 0 && (
              <button
                onClick={clearFilters}
                class="absolute flex justify-center items-center h-full w-10 right-0 top-0 stroke-neutral-400 dark:stroke-neutral-500 hover:stroke-neutral-600 hover:dark:stroke-neutral-300"
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
                    class={cn(
                      "w-full px-2 py-1 rounded",
                      "flex gap-2 items-center",
                      "bg-black/5 dark:bg-white/10",
                      "hover:bg-black/10 hover:dark:bg-white/15",
                      "transition-colors duration-300 ease-in-out",
                      filter().has(tag) && "text-black dark:text-white"
                    )}
                  >
                    <svg
                      class={cn(
                        "shrink-0 size-5 fill-black/50 dark:fill-white/50",
                        "transition-colors duration-300 ease-in-out",
                        filter().has(tag) && "fill-black dark:fill-white"
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
      <div class="col-span-3 sm:col-span-2">
        <div class="flex flex-col">
          {/* Info Bar */}
          <div class='flex justify-between flex-row mb-2'>
            <div class="text-sm uppercase">
              전체 {data.length}개 | 선택됨 {collection().length}개
            </div>
            <button onClick={toggleDescending} class='flex flex-row gap-1 stroke-neutral-400 dark:stroke-neutral-500 hover:stroke-neutral-600 hover:dark:stroke-neutral-300 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 hover:dark:text-neutral-300'>
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
            <For each={paginatedCollection()}>
              {(entry) => (
                <li>
                  <ArrowCard entry={entry} />
                </li>
              )}
            </For>
          </ul>

          {/* Pagination */}
          {totalPages() > 1 && (
            <nav class="flex items-center justify-center gap-1 mt-6" aria-label="Pagination">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage() - 1)}
                disabled={currentPage() === 1}
                class={cn(
                  "px-3 py-2 rounded-lg text-sm transition-colors duration-300 ease-in-out",
                  currentPage() === 1
                    ? "text-black/25 dark:text-white/25 cursor-not-allowed"
                    : "text-black/75 dark:text-white/75 hover:bg-black/5 hover:dark:bg-white/10 hover:text-black hover:dark:text-white"
                )}
                aria-label="이전 페이지"
              >
                «
              </button>

              {/* Page Numbers */}
              <For each={pageNumbers()}>
                {(page) =>
                  typeof page === "string" ? (
                    <span class="px-2 py-2 text-sm text-black/50 dark:text-white/50">…</span>
                  ) : (
                    <button
                      onClick={() => goToPage(page)}
                      class={cn(
                        "min-w-[2.25rem] px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ease-in-out",
                        currentPage() === page
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-black/75 dark:text-white/75 hover:bg-black/5 hover:dark:bg-white/10 hover:text-black hover:dark:text-white"
                      )}
                      aria-label={`${page}페이지`}
                      aria-current={currentPage() === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  )
                }
              </For>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage() + 1)}
                disabled={currentPage() === totalPages()}
                class={cn(
                  "px-3 py-2 rounded-lg text-sm transition-colors duration-300 ease-in-out",
                  currentPage() === totalPages()
                    ? "text-black/25 dark:text-white/25 cursor-not-allowed"
                    : "text-black/75 dark:text-white/75 hover:bg-black/5 hover:dark:bg-white/10 hover:text-black hover:dark:text-white"
                )}
                aria-label="다음 페이지"
              >
                »
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
