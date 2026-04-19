export type errorLog = {
  id: string;
  message: string;
  project_id: string;
  source: string;
  lineno: number;
  colno: number;
  stack: string;
  os: string;
  browser: string;
  status: errorLogStatus;
  created_at: string;
  assignee_id: number;
  image: string;
};

export type errorLogPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type paginatedErrorLogs = {
  data: errorLog[];
  pagination: errorLogPagination;
};

export enum errorLogStatus {
  UNRESOLVED = 0,
  PENDING = 1,
  RESOLVED = 2,
}
