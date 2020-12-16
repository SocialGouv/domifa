import { DomifaEnvId } from "../../../config";
import { MonitoringBatchProcessId } from "../../entities";

export type AdminBatchsErrorReportModel = {
  errorsCount: number;
  processIds: MonitoringBatchProcessId[];
  lastErrorDate: Date;
  lastErrorMessage: string;
  envId?: DomifaEnvId;
};
