import { AppEntity } from "../../../_common/model";
import { MonitoringBatchProcessId } from "./MonitoringBatchProcessId.type";
import { MonitoringBatchProcessStatus } from "./MonitoringBatchProcessStatus.type";
import { MonitoringBatchProcessTrigger } from "./MonitoringBatchProcessTrigger.type";

export type MonitoringBatchProcess<T = any> = AppEntity & {
  processId: MonitoringBatchProcessId;
  beginDate: Date;
  endDate: Date;
  trigger: MonitoringBatchProcessTrigger;
  status: MonitoringBatchProcessStatus;
  details?: T;
  errorMessage?: string;
  alertMailSent?: boolean;
};
