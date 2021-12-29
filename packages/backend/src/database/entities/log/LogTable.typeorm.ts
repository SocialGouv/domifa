import { Column, Entity } from "typeorm";
import { Log, LogAction } from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

@Entity({ name: "log" })
export class LogTable extends AppTypeormTable<LogTable> implements Log {
  @Column({ type: "integer", nullable: false })
  public userId: number;

  @Column({ type: "integer", nullable: true })
  public usagerRef: number;

  @Column({ type: "integer", nullable: false })
  public structureId: number;

  @Column({ type: "text", nullable: false })
  public action: LogAction;

  public constructor(entity?: Partial<LogTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
