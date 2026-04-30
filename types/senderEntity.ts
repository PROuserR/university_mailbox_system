// src/types/senderEntity.ts

/**
 * Response DTO - When getting sender entity from API
 */
export interface SenderEntityResponse {
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

/**
 * Request DTO - When creating a new sender entity
 */
export interface CreateSenderEntityRequest {
  /** Name of the sender entity */
  name: string;
}

/**
 * Request DTO - When updating an existing sender entity
 */
export interface UpdateSenderEntityRequest {
  /** New name (optional, if not provided, name stays same) */
  name?: string;
}