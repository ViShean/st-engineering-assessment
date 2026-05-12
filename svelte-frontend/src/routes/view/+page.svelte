<div class="mx-auto max-w-7xl px-6 py-12">

  <!-- Header -->
  <div class="mb-4">
    <div class="flex items-end justify-between">
      <div class="space-y-1">
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">
          Database <span class="text-indigo-600">View</span>
        </h1>
        <p class="text-slate-500 font-medium">
          Managed data: <span class="font-semibold text-slate-700">500</span> records found
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

        <!-- Column multi-select (static) -->
        <div class="relative w-full">
          <button class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:border-slate-300">
            <span>All Columns</span>
            <svg class="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
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
          <!-- Row 1 -->
          <tr class="group transition-colors duration-150 align-top bg-white hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">01</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">1</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">id labore ex et quam laborum</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Eliseo@gardner.biz</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">laudantium enim quasi est quidem magnam voluptate ipsam eos tempora quo necessitatibus dolor quam autem quasi</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#1</span>
            </td>
          </tr>
          <!-- Row 2 -->
          <tr class="group transition-colors duration-150 align-top bg-slate-50/50 hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">02</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">2</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">quo vero reiciendis velit similique earum</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Jayne_Kuhic@sydney.com</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">est natus enim nihil est dolore omnis voluptatem numquam et omnis occaecati quod ullam at</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#1</span>
            </td>
          </tr>
          <!-- Row 3 -->
          <tr class="group transition-colors duration-150 align-top bg-white hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">03</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">3</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">odio adipisci rerum aut animi</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Nikita@garfield.biz</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">quia molestiae reprehenderit quasi aspernatur aut expedita occaecati aliquam eveniet laudantium</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#1</span>
            </td>
          </tr>
          <!-- Row 4 -->
          <tr class="group transition-colors duration-150 align-top bg-slate-50/50 hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">04</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">4</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">alias odio sit</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Lew@alysha.tv</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">non et atque occaecati deserunt quas accusantium unde odit nobis qui voluptatem</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#1</span>
            </td>
          </tr>
          <!-- Row 5 -->
          <tr class="group transition-colors duration-150 align-top bg-white hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">05</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">5</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">vero eaque aliquid doloribus et culpa</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Hayden@althea.biz</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">harum non quasi et ratione tempore iure ex voluptates in ratione</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#1</span>
            </td>
          </tr>
          <!-- Row 6 -->
          <tr class="group transition-colors duration-150 align-top bg-slate-50/50 hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">06</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">6</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">et fugit eligendi deleniti quidem</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Presley.Mueller@myrl.com</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">doloribus at sed quis culpa deserunt consectetur qui praesentium accusamus fugiat dicta</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#2</span>
            </td>
          </tr>
          <!-- Row 7 -->
          <tr class="group transition-colors duration-150 align-top bg-white hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">07</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">7</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">repellat consequatur praesentium</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Dallas@ole.me</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">maiores sed dolores similique labore et inventore et quasi temporibus esse sunt id et eos voluptatem</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#2</span>
            </td>
          </tr>
          <!-- Row 8 -->
          <tr class="group transition-colors duration-150 align-top bg-slate-50/50 hover:bg-indigo-50/60">
            <td class="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">08</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">8</span>
            </td>
            <td class="px-6 py-4"><span class="text-sm font-semibold text-slate-800">et omnis dolorem</span></td>
            <td class="px-6 py-4"><span class="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Mallory_Kunze@marie.org</span></td>
            <td class="px-6 py-4 max-w-lg">
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">ut voluptatem corrupti velit ad voluptatem maiores</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">#2</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  <div class="mt-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30">
    <button disabled class="inline-flex items-center justify-center min-w-[40px] h-[40px] px-4 text-base font-semibold rounded-lg opacity-40 cursor-not-allowed bg-transparent text-slate-400">
      <span class="text-lg">←</span> Previous
    </button>

    <div class="flex items-center gap-1.5">
      <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold rounded-lg bg-transparent text-indigo-600 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 font-extrabold">1</button>
      <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">2</button>
      <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">3</button>
      <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">4</button>
      <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">5</button>
      <span class="px-2 text-slate-300 font-bold">···</span>
      <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">63</button>
    </div>

    <button class="inline-flex items-center justify-center min-w-[40px] h-[40px] px-4 text-base font-semibold transition-all duration-200 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">
      Next <span class="text-lg">→</span>
    </button>
  </div>

</div>
