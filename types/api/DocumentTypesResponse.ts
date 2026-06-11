/**
 * Response DTO - When getting sender entity from API
 */
export interface DocumentType {
    /** Unique identifier */
    id: number;

    /** Name of the sender entity (e.g., "رئاسة الجامعة") */
    name: string;

    /** Whether the entity is active (shown in dropdowns) */
    isActive: boolean;

    /** Creation date (ISO format) */
    createdAt: string;

    /** Last update date (ISO format), null if never updated */
    updatedAt: string | null;
}

export interface DocumentTypeResponse {
    data: DocumentType[]
};