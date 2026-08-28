// lib/permissions.ts

// ============================================================
// ===== Permission Keys =====
// ============================================================

export const PERMISSIONS = {
    // Distribution
    VIEW_DISTRIBUTION: 'ViewDistribution',
    VIEW_ALL_DISTRIBUTIONS: 'ViewAllDistributions',
    
    // Approvals
    VIEW_PENDING_APPROVALS: 'ViewPendingApprovals',
    
    // Incoming/Outgoing
    MANAGE_INCOMING_EMAIL: 'ManageIncomingEmail',
    MANAGE_OUTGOING_EMAIL: 'ManageOutgoingEmail',
    
    // Correspondence
    CREATE_CORRESPONDENCE: 'CreateCorrespondence',
    VIEW_CORRESPONDENCE: 'ViewCorrespondence',
    
    // System
    SYSTEM_MANAGE: 'SystemManage',
    MANAGE_TEMP_FILES: 'ManageTempFiles',
    MANAGE_BACKUP: 'ManageBackup',
    MANAGE_FAILED_FILE_DELETIONS: 'ManageFailedFileDeletions',
    
    // Users
    MANAGE_USERS: 'ManageUsers',
    
    // Delegations
    VIEW_DELEGATIONS: 'ViewDelegations',
    CREATE_DELEGATION: 'CreateDelegation',
    UPDATE_DELEGATION: 'UpdateDelegation',
    REVOKE_DELEGATION: 'RevokeDelegation',
    
    // Department
    MANAGE_DEPARTMENT: 'ManageDepartment',
    
    // Sender Entities
    MANAGE_SENDER_ENTITIES: 'ManageSenderEntities',
    
    // Document Types
    MANAGE_DOCUMENT_TYPES: 'ManageDocumentTypes',
    
    // Analytics
    VIEW_ANALYTICS: 'ViewAnalytics',
    
    // Jobs
    MANAGE_JOBS: 'ManageJobs',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];