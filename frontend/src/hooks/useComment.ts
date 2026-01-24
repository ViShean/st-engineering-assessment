import { useState, useEffect } from "react";
import { fetchComments } from "../api/commentApi";
import type { Comment, PaginationMeta } from "../types/comment";

export const useComments = (
  page: number,
  q?: string,
  columns: string[] = []
) => {
  const [data, setData] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  // Use a stable key for columns to avoid refetching when array identity changes
  const columnsKey = columns.join(",");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Reconstruct columns from the stable key to avoid identity-based reruns
        const cols = columnsKey ? columnsKey.split(",") : [];
        const result = await fetchComments(page, q, cols);
        setData(result.data);
        setMeta(result.meta);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Depend on a stringified key so literal arrays in callers don't trigger refetches
  }, [page, q, columnsKey]);

  return { data, loading, meta };
};