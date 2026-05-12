<script lang="ts">
  import {createComments} from '$lib/runes/comments.svelte';
  import {createDebounce} from '$lib/runes/debounce.svelte';
  import Table from '../../components/dataView/Table.svelte';
  import MultiSelect from '../../components/dataView/MultiSelect.svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  const searchableColumns = ["name", "email", "body"];
  let params = page.url.searchParams;
  let searchTerm = $state(params.get('q') ?? '');
  let selectedColumns = $state<string[]>(
    params.get('cols')?.split(',') ?? [...searchableColumns]
  );

  let debouncedSearchTerm = createDebounce(() => searchTerm, 500);

  // Pagination state — must be $derived so goTo() triggers a re-fetch
  const cleanedPage = $derived.by(() => {
    const p = Number(page.url.searchParams.get("page") || "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  $effect(() => {
    const newParams = new URLSearchParams();
    if (debouncedSearchTerm.value) newParams.set('q', debouncedSearchTerm.value);
    if (selectedColumns.length !== searchableColumns.length) newParams.set('cols', selectedColumns.join(','));
    goto(`?${newParams.toString()}`, { replaceState: true, noScroll: true });
  });

  const results = createComments(
    () => cleanedPage,
    () => debouncedSearchTerm.value,
    () => selectedColumns
  );

  const btnBase =
    "inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold transition-all duration-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2";

  const btnInactive =
    "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800";

  const btnActive =
    "bg-transparent text-indigo-600 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 font-extrabold";

  const btnDisabled =
    "opacity-40 cursor-not-allowed bg-transparent text-slate-400";

  const arrowBtn = "px-4"; 

  const current = $derived(results.meta?.currentPage ?? cleanedPage);
  const total = $derived(results.meta?.totalPages ?? 1);
  const canPrev = $derived(current > 1);
  const canNext = $derived(current < total);

  const goTo = (p: number) => {
    const newParams = new URLSearchParams(page.url.searchParams);
    newParams.set('page', p.toString());
    goto(`?${newParams.toString()}`, { replaceState: true, noScroll: true });
  };

  const windowSize =5;
  let paginationPages = $derived.by(() => {
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    if (end === total) start = Math.max(1, total - windowSize + 1);
    return {
      start,
      end,
      pages: Array.from({ length: end - start + 1 }, (_, i) => start + i)
    };
  });
</script>

<div class="mx-auto max-w-7xl px-6 py-12">

  <!-- Header -->
  <div class="mb-4">
    <div class="flex items-end justify-between">
      <div class="space-y-1">
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">
          Database <span class="text-indigo-600">View</span>
        </h1>
        <p class="text-slate-500 font-medium">
          Managed data: <span class="font-semibold text-slate-700">
            {results?.meta?.totalCount ?? 0}
          </span> records found
        </p>
      </div>
      <a
        href="/"
        class="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 shadow-sm hover:border-slate-300 hover:text-slate-800 hover:-translate-y-px transition-all"
      >
        + Upload New
      </a>
    </div>

    <!-- Search and Filter Controls -->
    <div class="mt-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Search for comments..."
            bind:value={searchTerm}
            class="w-full h-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <MultiSelect
          options={searchableColumns}
          selected={selectedColumns}
          placeholder="Filter columns"
          onChange={(cols) => selectedColumns = cols}
        />
        
      </div>
    </div>
  </div>

  <!-- Table -->
  <Table data={results?.data} isLoading={results?.loading} searchTerm={debouncedSearchTerm.value} />

  <!-- Pagination -->
  <div class="mt-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30">
  
  <!-- Previous Button -->
  <button
    onclick={() => canPrev && goTo(current - 1)}
    disabled={!canPrev}
    class="{btnBase} {arrowBtn} {canPrev ? btnInactive : btnDisabled}"
  >
    <span class="text-lg">←</span> Previous
  </button>

  <!-- Page Numbers -->
  <div class="flex items-center gap-1.5">
    {#if paginationPages.start > 1}
      <button onclick={() => goTo(1)} class="{btnBase} {btnInactive}">1</button>
      {#if paginationPages.start > 2}
        <span class="px-2 text-slate-300 font-bold">···</span>
      {/if}
    {/if}

    {#each paginationPages.pages as p}
      <button
        onclick={() => goTo(p)}
        class="{btnBase} {p === current ? btnActive : btnInactive}"
        aria-current={p === current ? 'page' : undefined}
      >
        {p}
      </button>
    {/each}

    {#if paginationPages.end < total}
      {#if paginationPages.end < total - 1}
        <span class="px-2 text-slate-300 font-bold">···</span>
      {/if}
      <button onclick={() => goTo(total)} class="{btnBase} {btnInactive}">
        {total}
      </button>
    {/if}
  </div>

  <!-- Next Button -->
  <button
    onclick={() => canNext && goTo(current + 1)}
    disabled={!canNext}
    class="{btnBase} {arrowBtn} {canNext ? btnInactive : btnDisabled}"
  >
    Next <span class="text-lg">→</span>
  </button>

</div>
</div>
