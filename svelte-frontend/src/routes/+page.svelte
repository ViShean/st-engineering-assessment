
<script lang="ts">
    import FileUpload from '../components/landing/FileUpload.svelte';
    import {uploadCsv} from '$lib/api/commentApi.svelte';
    import {API_BASE_URL} from '$lib/config';
    import type {UploadResult} from '$lib/types/comment';
    import { goto } from '$app/navigation';

    let result = $state<UploadResult | null>(null);
    let error = $state<string | null>(null);
    let isModalOpen = $state(false);
    let isLoading = $state(false);
    let uploadProgress = $state(0);
    let processProgress = $state(0);
    let expandedGroups = $state<Set<string>>(new Set());

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

      if (expandedGroups.has(reason)) {
        expandedGroups.delete(reason);
      } else {
        expandedGroups.add(reason);
      }
      expandedGroups = expandedGroups; // needed to trigger reactivity, because .add and .delete don't change the reference 
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
      expandedGroups = new Set();
      const jobId = crypto.randomUUID(); // Generate a unique job ID for tracking
      const sse = new EventSource(`${API_BASE_URL}/upload/progress?jobId=${jobId}`);
      
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
    
    />
  </div>

  <div class="mt-6 text-center">
    <a href="/view" class="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
      Or, view already uploaded data →
    </a>
  </div>
</div>