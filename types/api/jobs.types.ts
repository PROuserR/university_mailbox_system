// types/api/jobs.types.ts

export interface JobStatusDto {
  jobId: string;
  isEnabled: boolean;
  isActive: boolean;
  cronExpression: string;
  nextExecution: string | null;
  lastExecution: string | null;
  createdAt: string | null;
  displayName: string;
}

export interface UpdateScheduleRequest {
  cronExpression: string;
}

export interface JobsStatusResponse {
  [key: string]: JobStatusDto;
}