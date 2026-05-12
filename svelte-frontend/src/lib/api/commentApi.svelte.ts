// src/lib/api/commentApi.ts
import type { CommentResponse } from "$lib/types/comment";
import { API_BASE_URL } from "$lib/config";
export const fetchComments = async (
  page: number,
  q?: string,
  columns: string[] = []
): Promise<CommentResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    ...(q && { q }),
    ...(columns.length && { columns: columns.join(",") }),
  });

  const response = await fetch(`${API_BASE_URL}/data?${params}`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
};

export const uploadCsv = async (
  file: File,
  onProgress?: (percent: number) => void,
  jobId?: string
): Promise<unknown> => {
  const formData = new FormData();
  formData.append("file", file);

  // Native fetch doesn't support progress — use XMLHttpRequest for that
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${API_BASE_URL}/upload${jobId ? `?jobId=${jobId}` : ""}`;

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        onProgress?.(Math.min(100, Math.max(0, Math.round((evt.loaded * 100) / evt.total))));
      } else {
        onProgress?.(Math.min(99, Math.max(0, Math.round(evt.loaded / 1000))));
      }
    };

    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.open("POST", url);
    xhr.send(formData);
  });

  
};