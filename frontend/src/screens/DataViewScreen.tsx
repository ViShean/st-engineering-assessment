import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useComments } from "../hooks/useComment";
import { useDebounce } from "../hooks/useDebounce";
import { Table } from "../components/dataView/Table";
import { MultiSelect } from "../components/dataView/MultiSelect";

export const DataTableScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter state
  const searchableColumns = ["name", "email", "body"];
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    const cols = searchParams.get("cols");
    return cols ? cols.split(",") : searchableColumns;
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Pagination state
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // Reset to page 1 when search term or columns change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page"); // Reset to page 1
    if (debouncedSearchTerm) {
      newParams.set("q", debouncedSearchTerm);
    } else {
      newParams.delete("q");
    }
    if (selectedColumns.length > 0) {
      newParams.set("cols", selectedColumns.join(","));
    }
    setSearchParams(newParams);
  }, [debouncedSearchTerm, selectedColumns]);

  // Data fetching
  const { data, loading, meta } = useComments(
    page,
    debouncedSearchTerm,
    selectedColumns,
  );

  const btnBase =
    "inline-flex items-center justify-center min-w-[40px] h-[40px] text-base font-semibold transition-all duration-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2";

  const btnInactive =
    "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800";

  const btnActive =
    "bg-transparent text-indigo-600 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 font-extrabold";

  const btnDisabled =
    "opacity-40 cursor-not-allowed bg-transparent text-slate-400";

  const arrowBtn = "px-4"; // Padding for Previous/Next
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Database <span className="text-indigo-600">View</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Managed data:{" "}
              <span className="font-semibold text-slate-700">
                {meta?.totalCount ?? 0}
              </span>{" "}
              records found
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 shadow-sm hover:border-slate-300 hover:text-slate-800 hover:-translate-y-px transition-all"
          >
            + Upload New
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="Search for comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <MultiSelect
              options={searchableColumns}
              selectedOptions={selectedColumns}
              onChange={setSelectedColumns}
            />
          </div>
        </div>
      </div>

      {/* The Table */}
      <Table data={data} isLoading={loading} searchTerm={debouncedSearchTerm} />

      {/* Pagination Logic Block */}
      {(() => {
        const current = meta?.currentPage ?? page;
        const totalPages = meta?.totalPages ?? 1;
        const canPrev = current > 1;
        const canNext = current < totalPages;
        const goTo = (p: number) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("page", String(p));
          setSearchParams(newParams);
        };

        // Pagination Window Logic
        const windowSize = 5;
        let start = Math.max(1, current - Math.floor(windowSize / 2));
        const end = Math.min(totalPages, start + windowSize - 1);
        if (end === totalPages)
          start = Math.max(1, totalPages - windowSize + 1);

        const pages = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i,
        );

        return (
          <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30">
            {/* Previous Button */}
            <button
              onClick={() => canPrev && goTo(current - 1)}
              disabled={!canPrev}
              className={`${btnBase} ${arrowBtn} ${canPrev ? btnInactive : btnDisabled}`}
            >
              <span className="text-lg">←</span> Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
              {start > 1 && (
                <>
                  <button
                    onClick={() => goTo(1)}
                    className={`${btnBase} ${btnInactive}`}
                  >
                    1
                  </button>
                  {start > 2 && (
                    <span className="px-2 text-slate-300 font-bold">···</span>
                  )}
                </>
              )}

              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`${btnBase} ${p === current ? btnActive : btnInactive}`}
                  aria-current={p === current ? "page" : undefined}
                >
                  {p}
                </button>
              ))}

              {end < totalPages && (
                <>
                  {end < totalPages - 1 && (
                    <span className="px-2 text-slate-300 font-bold">···</span>
                  )}
                  <button
                    onClick={() => goTo(totalPages)}
                    className={`${btnBase} ${btnInactive}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => canNext && goTo(current + 1)}
              disabled={!canNext}
              className={`${btnBase} ${arrowBtn} ${canNext ? btnInactive : btnDisabled}`}
            >
              Next <span className="text-lg">→</span>
            </button>
          </div>
        );
      })()}
    </div>
  );
};
