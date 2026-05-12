<script lang="ts">
  interface Props {
    options: string[];
    selected: string[];
    placeholder?: string;
    onChange: (value: string[]) => void;
  }
  let { options, selected, placeholder = "Select columns...", onChange }: Props = $props();

  function createClickOutside(
    getElement: () => HTMLElement | null,
    handler: () => void
  ){
    $effect(()=>{
      function listener(event: MouseEvent | TouchEvent) {
        const el = getElement();
        if (!el || el.contains(event.target as Node)) return;
        handler();
      }
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    })
  }

  let isOpen = $state(false);
  let dropdownRef: HTMLElement;
  createClickOutside(() => dropdownRef, () => isOpen=false);

  const handleSelectAll = () => onChange(options);
  const handleDeselectAll = () => onChange([]);

  function handleOptionToggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter(o => o !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  function getButtonLabel(){
    if (selected.length === 0) return placeholder;
    if (selected.length === options.length) return "All columns selected";
    return `${selected.length} column${selected.length > 1 ? 's' : ''} selected`;
  }
</script>


<!-- MultiSelect.svelte -->
<div class="relative w-full" bind:this={dropdownRef}>
  <button 
    class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
    onclick = {() => isOpen = !isOpen}
    >
    
    <span>{getButtonLabel()}</span>
    <svg
      class={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>
  {#if isOpen}
  <div class="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl">
    <div class="p-2">
      <div class="flex justify-between mb-2">
        <button 
          class="text-xs font-bold text-indigo-600 hover:underline"
          onclick = {handleSelectAll}
          >
            Select All
          </button>
        <button 
          class="text-xs font-bold text-slate-500 hover:underline"
          onclick = {handleDeselectAll}
        >
          Deselect All
        </button>
      </div>
      <ul class="space-y-1">
        {#each options as option}
        <li class="rounded-md hover:bg-slate-100">
          <label class="flex items-center p-2 cursor-pointer w-full">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onchange={() => handleOptionToggle(option)}
              class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
            <span class="ml-3 text-sm font-medium text-slate-800 capitalize">{option}</span>
          </label>
        </li>
        {/each}
      </ul>
    </div>
  </div>
  {/if}
</div>
