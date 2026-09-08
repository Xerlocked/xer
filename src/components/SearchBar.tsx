type Props = {
    onSearchInput: (e: Event) => void;
    query: () => string;
    setQuery: (value: string) => void;
    placeholderText: string;
};

export default function SearchBar({ onSearchInput, query, setQuery, placeholderText }: Props) {
    return (<div class="relative">
        <svg class="absolute size-4 left-3 top-1/2 -translate-y-1/2 stroke-current text-muted-foreground pointer-events-none">
            <use href={`/ui.svg#search`} />
        </svg>
        <input name="search" type="text" aria-label={placeholderText} value={query()} onInput={onSearchInput} autocomplete="off" spellcheck={false} placeholder={placeholderText} class="ui-input" />
        {query().length > 0 && (
            <button
                onClick={() => setQuery("")}
                aria-label="검색어 지우기"
                class="absolute flex justify-center items-center h-full w-10 right-0 top-0 rounded-md stroke-current text-muted-foreground hover:text-foreground"
            >
                <svg class="size-5">
                    <use href={`/ui.svg#x`} />
                </svg>
            </button>
        )}
    </div>)
}
