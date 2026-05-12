<div class="relative w-full">
  <button class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2">
    <span>Select columns...</span>
    <svg
      class="w-5 h-5 text-slate-400 transition-transform duration-200"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>

  <div class="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl">
    <div class="p-2">
      <div class="flex justify-between mb-2">
        <button class="text-xs font-bold text-indigo-600 hover:underline">Select All</button>
        <button class="text-xs font-bold text-slate-500 hover:underline">Deselect All</button>
      </div>
      <ul class="space-y-1">
        <li class="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
          <input type="checkbox" checked class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
          <span class="ml-3 text-sm font-medium text-slate-800 capitalize">Option One</span>
        </li>
        <li class="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
          <input type="checkbox" class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
          <span class="ml-3 text-sm font-medium text-slate-800 capitalize">Option Two</span>
        </li>
        <li class="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
          <input type="checkbox" class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
          <span class="ml-3 text-sm font-medium text-slate-800 capitalize">Option Three</span>
        </li>
      </ul>
    </div>
  </div>
</div>
