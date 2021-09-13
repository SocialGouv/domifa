import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  InteractionEvent,
  Interactions,
  InteractionType,
} from "../../../_common/model/interaction";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "../usager";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "interactions" })
export class InteractionsTable
  extends AppTypeormTable<InteractionsTable>
  implements Interactions
{
  @Column({ type: "timestamptz" })
  public dateInteraction: Date;

  @Column({ type: "integer" })
  public nbCourrier: number;

  @Index()
  @Column({ type: "integer" })
  public structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureFk?: Promise<StructureTable>;

  @Column({ type: "text" })
  public type: InteractionType;

  @Index()
  @Column({ type: "integer" })
  public usagerRef: number;

  @Index()
  @Column({ type: "text" })
  public usagerUUID: string;

  @ManyToOne(() => UsagerTable, { lazy: true })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerFk?: Promise<UsagerTable>;

  @Index()
  @Column({ type: "integer", nullable: true }) // nullable if user is deleted
  public userId: number;

  // NOTE: pas de FK car les users peuvent être supprimés (si on ajoute la FK, il faudra rendre nullable les userId)
  // @ManyToOne(() => UserStructureTable, { lazy: true })
  // @JoinColumn({ name: "userId", referencedColumnName: "id" })
  // userFk?: Promise<UserStructureTable>;

  @Column({ type: "text" })
  public userName: string;

  @Column({ type: "text", nullable: true })
  public content: string;

  @Column({ type: "text", default: "create" })
  public event: InteractionEvent;

  @Column({ type: "jsonb", nullable: true })
  public previousValue?: Interactions; // if event === 'delete'

  public constructor(entity?: Partial<InteractionsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
