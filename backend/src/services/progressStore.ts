export const uploadTracker = new Map<string, number>();

export const setProgress = (jobId: string, percent: number) => {
  uploadTracker.set(jobId, Math.max(0, Math.min(100, percent)));
};

export const getProgress = (jobId: string) => uploadTracker.get(jobId) ?? 0;

export const clearProgressLater = (jobId: string, delayMs = 5000) => {
  setTimeout(() => uploadTracker.delete(jobId), delayMs);
};