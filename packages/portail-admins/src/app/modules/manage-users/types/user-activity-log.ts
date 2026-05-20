export interface UserActivityLog {
  id: number;
  action: string;
  role?: string;
  context?: Record<string, unknown> | null;
  createdAt: string | Date;
}
