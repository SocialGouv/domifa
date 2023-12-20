import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from "typeorm";
import {
  UsagerHistory,
  UsagerHistoryImport,
  UsagerHistoryState,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager_history" })
@Unique(["structureId", "usagerRef"])
export class UsagerHistoryTable
  extends AppTypeormTable<UsagerHistoryTable>
  implements UsagerHistory
{
  @Index()
  @Column({ type: "uuid", unique: true, update: false })
  @OneToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Column({ type: "integer", update: false })
  public usagerRef: number;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", nullable: true })
  import?: UsagerHistoryImport;
  // ces objets sont stockées au moment de leur créations, jamais modifiés par la suite (on stocke une nouvelle version)

  @Column({ type: "jsonb" })
  states: UsagerHistoryState[];

  @Column({ type: "boolean", default: false })
  migrated: boolean;

  public constructor(entity?: Partial<UsagerHistoryTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
