import axios from "axios";
import type { CommentResponse } from "../types/comment";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchComments = async (
  page: number,
  q?: string,
  columns: string[] = [],
) => {
  // We use params so Axios handles the URL encoding (like spaces or special chars)
  const response = await api.get<CommentResponse>("/comments", {
    params: {
      page,
      limit: 10,
      q,
      columns: columns.join(","),
    },
  });
  return response.data;
};

export const uploadCsv = async (
  file: File,
  onProgress?: (percent: number) => void,
  jobId?: string,
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/comments/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    params: jobId ? { jobId } : undefined,
    onUploadProgress: (evt) => {
      const total = evt.total ?? 0;
      if (total > 0) {
        const percent = Math.round((evt.loaded * 100) / total);
        onProgress?.(Math.min(100, Math.max(0, percent)));
      } else {
        // Fallback when total is unavailable; emit a best-effort progress
        const approx = Math.min(99, Math.max(0, Math.round(evt.loaded / 1000)));
        onProgress?.(approx);
      }
    },
  });
  return response.data;
};
