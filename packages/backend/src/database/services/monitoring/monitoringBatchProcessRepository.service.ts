import {
  MonitoringBatchProcess,
  MonitoringBatchProcessTable,
} from "../../entities/monitoring";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<
  MonitoringBatchProcessTable,
  MonitoringBatchProcess
>(MonitoringBatchProcessTable);

export const monitoringBatchProcessRepository = {
  ...baseRepository,
};
