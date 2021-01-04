export type HealthCheckInfo = {
  status: HealthCheckGlobalStatus;
  info?: Partial<HealthCheckInfoServices>;
  error?: Partial<HealthCheckInfoServices>;
  details?: HealthCheckInfoServices;
};

export type HealthCheckInfoServices = {
  postgres: HealthCheckServiceHealth;
  mongo: HealthCheckServiceHealth;
  frontend: HealthCheckServiceHealth;
  version: { info: string; status: HealthCheckServiceStatus };
};

export type HealthCheckServiceHealth = {
  status: HealthCheckServiceStatus;
  message?: string;
};

export type HealthCheckServiceStatus = "up" | "down";
export type HealthCheckGlobalStatus = "ok" | "error";
