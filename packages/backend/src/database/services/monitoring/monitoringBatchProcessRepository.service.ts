import {
  MonitoringBatchProcess,
  MonitoringBatchProcessTable,
} from "../../entities/monitoring";
import { myDataSource } from "../_postgres";

export const monitoringBatchProcessRepository =
  myDataSource.getRepository<MonitoringBatchProcess>(
    MonitoringBatchProcessTable
  );
