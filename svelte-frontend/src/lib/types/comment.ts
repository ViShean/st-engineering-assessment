export interface Comment {
    rowNumber: number; 
    commentId: number;
    postId: number;
    name: string;
    email: string;
    body: string;
}

export interface PaginationMeta {
    totalCount: number;
    itemCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export interface CommentResponse {
    data: Comment[];
    meta: PaginationMeta;
}

export interface UploadResult {
    success: number;
    failed: number;
    failures: { id: number | string; reason: string; originalRow: Record<string, string> }[];
}