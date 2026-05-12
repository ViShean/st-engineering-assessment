<script lang="ts"> 
  import type {Comment} from "$lib/types/comment";
  import TableSkeleton from "./TableSkeleton.svelte";
  import HighlightedText from "./HighlightedText.svelte";
  interface Props {
    data: Comment[];
    isLoading: boolean;
    searchTerm?: string;
  }

  let { data, isLoading, searchTerm }: Props = $props();

  let expandedRows = $state<Record<string, boolean>>({});

  function toggleRow(id: string) {
    expandedRows[id] = !expandedRows[id];
  }
</script>

{#if (!isLoading && data.length === 0)}
<div class="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-lg">
        <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-inner">
          {searchTerm ? "🔍" : "📁"}
        </div>
        <h3 class="text-slate-800 font-bold text-xl">
          {searchTerm ? "No matches found" : "No data available"}
        </h3>
        <p class="text-slate-500 mt-2 text-sm max-w-xs text-center">
          {searchTerm
            ? `We couldn't find any results for "${searchTerm}"`
            : "Upload a CSV file to get started"}
        </p>
      </div>
{:else}
<div class="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-left border-separate border-spacing-0">
      <thead>
        <tr class="bg-gradient-to-r from-slate-100 to-slate-200/60">
          <th class="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 w-12 text-center">#</th>
          <th class="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 w-20 text-center">Id</th>
          <th class="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 min-w-[150px] text-left">Name</th>
          <th class="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 min-w-[200px] text-left">Email</th>
          <th class="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 text-left">Body</th>
          <th class="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 text-center w-20">Post</th>
        </tr>
      </thead>
      <tbody>
      {#if isLoading}
        {#each Array(10) as _}
          <TableSkeleton />
        {/each}
      {:else}
        {#each data as row, idx}
        {@const rowKey = `${row.commentId}-${row.rowNumber}`}
        {@const isExpanded = expandedRows[rowKey]}
        {@const isEven = idx % 2 === 0}
        
        <tr 
          class="group transition-colors duration-150 align-top {isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/60">
          <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">{row.rowNumber.toString().padStart(2, '0')}</td>
          <td class="px-6 py-4 text-center">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
              {row.commentId}
            </span>
          </td>
          <td class="px-6 py-4">
            <span class="text-sm font-semibold text-slate-800">
              <HighlightedText text={row.name} highlight={searchTerm} />
            </span>
          </td>
          <td class="px-6 py-4">
            <span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
              <HighlightedText text={row.email} highlight={searchTerm} />
            </span>
          </td>
          <td class="px-6 py-4 max-w-lg">
            <div class="cursor-pointer group/content">
              <p class="text-sm text-slate-600 leading-relaxed {isExpanded ? '' : 'line-clamp-2'}">
                <HighlightedText text={row.body} highlight={searchTerm} />
              </p>
              <button
                onclick={() => toggleRow(rowKey)} 
                class="mt-2 text-xs font-medium text-indigo-500 hover:text-indigo-700 opacity-0 group-hover/content:opacity-100 transition-all flex items-center gap-1">
                {#if isExpanded}
                  <span>Show less</span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                {:else}
                <span>Show more</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                {/if}
              </button>
            </div>
          </td>
          <td class="px-6 py-4 text-center">
            <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">
              #{row.postId}
            </span>
          </td>
        </tr>
        {/each}
      {/if}
      </tbody>
      
    </table>
  </div>
</div>
{/if}
