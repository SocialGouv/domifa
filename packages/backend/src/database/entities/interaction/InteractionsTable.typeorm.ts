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
  dateInteraction: Date;

  @Column({ type: "integer", default: 0 })
  nbCourrier: number;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, (structure) => structure.id)
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  @Column({ type: "text" })
  type: InteractionType;

  @Index()
  @Column({ type: "integer" })
  usagerRef: number;

  @Index()
  @Column({ type: "text" })
  usagerUUID: string;

  @ManyToOne(() => UsagerTable, { lazy: true })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  usagerFk?: Promise<UsagerTable>;

  @Index()
  @Column({ type: "integer", nullable: true }) // nullable if user is deleted
  userId: number;

  @Column({ type: "text" })
  userName: string;

  @Column({ type: "text", nullable: true })
  content: string;

  @Column({ type: "text", default: "create" })
  event: InteractionEvent;

  @Index()
  @Column({ type: "text", nullable: true })
  interactionOutUUID: string;

  @ManyToOne(() => InteractionsTable, (interaction) => interaction.uuid)
  @JoinColumn({ name: "interactionOutUUID", referencedColumnName: "uuid" })
  interactionOutUUIDFk?: Promise<Interactions>;

  @Column({ type: "jsonb", nullable: true })
  previousValue?: Interactions; // if event === 'delete'

  public constructor(entity?: Partial<InteractionsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
