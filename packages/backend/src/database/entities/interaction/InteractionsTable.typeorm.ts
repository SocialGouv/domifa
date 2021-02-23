import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  Interactions,
  InteractionType,
} from "../../../_common/model/interaction";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "../usager";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "interactions" })
export class InteractionsTable
  extends AppTypeormTable<Interactions>
  implements Interactions {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "text", nullable: true })
  _id: string; // obsolete mongo id: use `uuid` instead

  @Column({ type: "timestamptz" })
  dateInteraction: Date;

  @Column({ type: "integer" })
  nbCourrier: number;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
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
  @Column({ type: "integer", nullable: true }) // nullable is user is deleted
  userId: number;

  // NOTE: pas de FK car les users peuvent être supprimés (si on ajoute la FK, il faudra rendre nullable les userId)
  // @ManyToOne(() => AppUserTable, { lazy: true })
  // @JoinColumn({ name: "userId", referencedColumnName: "id" })
  // userFk?: Promise<AppUserTable>;

  @Column({ type: "text" })
  userName: string;

  @Column({ type: "text", nullable: true })
  content: string;
}
