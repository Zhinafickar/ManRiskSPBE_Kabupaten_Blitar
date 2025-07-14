export interface AdminToken {
    id: string;
    name: string;
    token: string;
    createdBy: string;
    createdAt: string;
    used?: boolean; // Now optional as we don't track usage for reusable tokens
}
