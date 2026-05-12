
<script lang="ts">
    import FileUpload from '../components/landing/FileUpload.svelte';
    import {uploadCsv} from '$lib/api/commentApi.svelte';
    import {API_BASE_URL} from '$lib/config';
    import type {UploadResult} from '$lib/types/comment';
    import { goto } from '$app/navigation';
    import Modal from '../components/common/Modal.svelte';
  
    let result = $state<UploadResult | null>(null);
    let error = $state<string | null>(null);
    let isModalOpen = $state(false);
    let isLoading = $state(false);
    let uploadProgress = $state(0);
    let processProgress = $state(0);
    let expandedGroups = $state<Record<string, boolean>>({});

    const groupFailures = $derived.by(()=>{
      if (!result?.failures) return {};
      const groups: Record<string, (number | string)[]> = {};

      result.failures.forEach((failure) => {
        // Split "Validation: error1, error2" into individual errors
        const reasons = failure.reason.startsWith("Validation: ")
          ? failure.reason
              .replace("Validation: ", "")
              .split(", ")
              .map((r) => `Validation: ${r}`)
          : [failure.reason];

        reasons.forEach((reason) => {
          if (!groups[reason]) groups[reason] = [];
          groups[reason].push(failure.id);
        });
      });

      return groups;
    });

    function toggleGroup(reason: string) {
      expandedGroups[reason] = !expandedGroups[reason];
    };

    function escapeCell(value: string): string {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }
    function downloadFailedRowsCsv(){
      if (!result?.failures || result.failures.length === 0) return;

      // Get headers from first failed row + add reason column
      const originalHeaders = Object.keys(result.failures[0].originalRow);
      const headers = [...originalHeaders, "error_reason"];

      // Build CSV content
      const csvRows = [
        headers.join(","), // Header row
        ...result.failures.map((failure) => {
          const rowValues = originalHeaders.map((h) => 
            escapeCell(failure.originalRow[h] || "")
          );
          // Add the reason column (escaped)
          const reason = failure.reason || "";
          const escapedReason = escapeCell(reason);

          return [...rowValues, escapedReason].join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      // Add BOM for Excel compatibility
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `failed_rows_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    async function handleFileUpload(file: File) {
      isLoading = true;
      uploadProgress = 0;
      processProgress = 0;
      error = null;
      expandedGroups = {};
      const jobId = crypto.randomUUID(); // Generate a unique job ID for tracking
      const sse = new EventSource(`${API_BASE_URL}/upload/progress/${jobId}`);
      
      sse.onmessage = (event) => {
        try {
          const { progress } = JSON.parse(event.data);
          processProgress = progress;
          if (progress >= 100) sse.close();
        } catch {
          // ignore malformed chunks
        }
      };
      sse.onerror = () => {
        sse.close();
      };
      try {
        const uploadResult : any = await uploadCsv(
          file,
          (p :number) => uploadProgress = p,
          jobId,
        );
        result=uploadResult.results;
        error = null;
        isModalOpen = true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.message ||
          "Upload failed. Please try again.";
        error = errorMessage;
        result = null;
        isModalOpen = true;
      } finally {
        isLoading = false;
        sse.close();
      }
    };

    function closeModal(){
      isModalOpen = false;
      result = null;
      error = null;
      uploadProgress = 0;
      processProgress = 0;
    }


    function viewData(){
      uploadProgress = 0;
      processProgress = 0;
      goto('/view');
    }
</script>

<div class="min-h-screen w-full px-6 py-12 flex flex-col items-center bg-slate-50">
  <header class="text-center mb-12 w-full max-w-4xl">
    <h1 class="text-4xl font-black text-slate-800 tracking-tight">
      CSV <span class="text-indigo-600">Processor</span>
    </h1>
    <p class="text-slate-500 mt-3 text-lg">
      Drag and drop your dataset below to begin processing.
    </p>
  </header>

  <div class="w-full max-w-4xl">
    <FileUpload 
      onFileSelect={handleFileUpload}
      isUploading={isLoading}
      uploadProgress={uploadProgress}
      processProgress={processProgress}
    />
  </div>

  <div class="mt-6 text-center">
    <button
          onclick={() => goto("/view")}
          class="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Or, view already uploaded data →
        </button>
  </div>

  <Modal 
    isOpen={isModalOpen}
    title={error ? "Upload Failed" : "Upload Complete"}
    onClose={closeModal}
  >
    {#if error}
      <div>
        <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg
            class="w-6 h-6 text-red-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width=2
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-red-700 font-medium">{error}</p>
        </div>
        <div class="mt-6 flex justify-end">
          <button
            onclick={closeModal}
            class="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    {:else if result}
      <div>
        <div class="flex gap-6 mt-3 text-slate-600">
          <p>
            <span class="font-bold text-green-600">
              {result.success}
            </span>
            successful records
          </p>
          <p>
            <span class="font-bold text-red-600">{result.failed}</span>{" "}
            failed records
          </p>
        </div>

        {#if result.failures && result.failures.length > 0}
        
          <div class="mt-6">
            <h4 class="font-bold text-slate-800 mb-3">
              Failure Details:
            </h4>
            <div class="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
              {#each Object.entries(groupFailures) as [reason, ids]}
                <div
                  class="border-b border-slate-200 last:border-b-0"
                >
                  <button
                    onclick={() => toggleGroup(reason)}
                    class="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100 transition-colors"
                  >
                    <span class="font-medium text-red-700">
                      {reason}
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {ids.length}
                      </span>
                      <svg
                        class="w-4 h-4 text-slate-400 transition-transform {expandedGroups[reason] ? 'rotate-180' : ''}"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width=2
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  {#if expandedGroups[reason]}
                    <div class="px-3 pb-3">
                      <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 p-2 bg-white rounded-md border border-slate-100">
                        {#each ids as id}
                          <span
                            class="text-xs font-mono text-center bg-slate-100 text-slate-600 px-1.5 py-1 rounded"
                          >
                            {String(id)}
                          </span>
                        {/each}
                      </div>
                    </div>
                  
                  {/if}
                </div>
              {/each}
            </div>
            <button
              onclick={downloadFailedRowsCsv}
              class="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width=2
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download failed rows as CSV
            </button>
          </div>
        {/if}

        <div class="mt-8 flex justify-end gap-3">
          <button
            onclick={closeModal}
            class="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onclick={viewData}
            class="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            View Uploaded Data →
          </button>
        </div>
      </div>
    {/if}
  </Modal>

</div>