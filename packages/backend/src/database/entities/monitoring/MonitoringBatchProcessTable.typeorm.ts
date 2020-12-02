import { Column, Entity } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { MonitoringBatchProcess } from "./MonitoringBatchProcess.type";
import { MonitoringBatchProcessId } from "./MonitoringBatchProcessId.type";
import { MonitoringBatchProcessStatus } from "./MonitoringBatchProcessStatus.type";
import { MonitoringBatchProcessTrigger } from "./MonitoringBatchProcessTrigger.type";
// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "monitor_batch_process" })
export class MonitoringBatchProcessTable<T = any>
  extends AppTypeormTable<MonitoringBatchProcess<T>>
  implements MonitoringBatchProcess {
  @Column({ type: "text" })
  processId: MonitoringBatchProcessId;

  @Column({ type: "timestamptz" })
  beginDate: Date;

  @Column({ type: "timestamptz" })
  endDate: Date;

  @Column({ type: "text" })
  trigger: MonitoringBatchProcessTrigger;

  @Column({ type: "text" })
  status: MonitoringBatchProcessStatus;

  @Column({ type: "jsonb", nullable: true })
  details?: any;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;
}
