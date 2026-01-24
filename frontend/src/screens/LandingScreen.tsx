import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/landing/FileUpload";
import { uploadCsv } from "../api/commentApi";
import Modal from "../components/common/Modal";
import type { UploadResult } from "../types/comment";
import { API_BASE_URL } from "../config";

export const LandingScreen = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processProgress, setProcessProgress] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group failures by reason (split multiple errors into separate groups)
  const groupedFailures = useMemo(() => {
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
  }, [result?.failures]);

  const toggleGroup = (reason: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) {
        next.delete(reason);
      } else {
        next.add(reason);
      }
      return next;
    });
  };

  const downloadFailedRowsCsv = () => {
    if (!result?.failures || result.failures.length === 0) return;

    // Get headers from first failed row + add reason column
    const originalHeaders = Object.keys(result.failures[0].originalRow);
    const headers = [...originalHeaders, "error_reason"];

    // Build CSV content
    const csvRows = [
      headers.join(","), // Header row
      ...result.failures.map((failure) => {
        const rowValues = originalHeaders.map((header) => {
          const value = failure.originalRow[header] || "";
          // Escape values with commas, quotes, or newlines
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        // Add the reason column (escaped)
        const reason = failure.reason || "";
        const escapedReason =
          reason.includes(",") || reason.includes('"') || reason.includes("\n")
            ? `"${reason.replace(/"/g, '""')}"`
            : reason;
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
  };

  const handleFileAction = async (file: File) => {
    setLoading(true);
    setUploadProgress(0);
    setProcessProgress(0);
    setResult(null);
    setExpandedGroups(new Set());
    const jobId = crypto.randomUUID();
    const sse = new EventSource(`${API_BASE_URL}/comments/status/${jobId}`);
    sse.onmessage = (event) => {
      try {
        const { progress } = JSON.parse(event.data);
        setProcessProgress(progress);
        if (progress >= 100) sse.close();
      } catch {
        // ignore malformed chunks
      }
    };
    sse.onerror = () => {
      // If SSE fails, we'll still rely on upload progress fallback
      sse.close();
    };
    try {
      const uploadResult = await uploadCsv(
        file,
        (p) => setUploadProgress(p),
        jobId,
      );
      setResult(uploadResult.results);
      setIsModalOpen(true);
    } catch {
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
      sse.close();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setResult(null);
    setUploadProgress(0);
    setProcessProgress(0);
  };

  const handleViewData = () => {
    setUploadProgress(0);
    setProcessProgress(0);
    navigate("/comments");
  };

  return (
    <div className="min-h-screen w-full px-6 py-12 flex flex-col items-center bg-slate-50">
      <header className="text-center mb-12 w-full max-w-4xl">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          CSV <span className="text-indigo-600">Processor</span>
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Drag and drop your dataset below to begin processing.
        </p>
      </header>

      <div className="w-full max-w-4xl">
        <FileUpload
          onFileSelect={handleFileAction}
          isUploading={loading}
          uploadProgress={uploadProgress}
          processProgress={processProgress}
        />
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/comments")}
          className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Or, view already uploaded data →
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Upload Complete"
      >
        {result && (
          <div>
            <div className="flex gap-6 mt-3 text-slate-600">
              <p>
                <span className="font-bold text-green-600">
                  {result.success}
                </span>{" "}
                successful records
              </p>
              <p>
                <span className="font-bold text-red-600">{result.failed}</span>{" "}
                failed records
              </p>
            </div>

            {result.failures && result.failures.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-slate-800 mb-3">
                  Failure Details:
                </h4>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
                  {Object.entries(groupedFailures).map(([reason, ids]) => (
                    <div
                      key={reason}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <button
                        onClick={() => toggleGroup(reason)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100 transition-colors"
                      >
                        <span className="font-medium text-red-700">
                          {reason}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            {ids.length}
                          </span>
                          <svg
                            className={`w-4 h-4 text-slate-400 transition-transform ${expandedGroups.has(reason) ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </button>
                      {expandedGroups.has(reason) && (
                        <div className="px-3 pb-3">
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 p-2 bg-white rounded-md border border-slate-100">
                            {ids.map((id, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-mono text-center bg-slate-100 text-slate-600 px-1.5 py-1 rounded"
                              >
                                {String(id)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={downloadFailedRowsCsv}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download failed rows as CSV
                </button>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleViewData}
                className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
              >
                View Uploaded Data →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
