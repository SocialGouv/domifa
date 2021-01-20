import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import {
  InteractionType,
  Interactions,
} from "../../../_common/model/interaction";

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

  @Column({ type: "text" })
  type: InteractionType;

  @Index()
  @Column({ type: "integer" })
  usagerId: number;

  @Index()
  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "text" })
  userName: string;

  @Column({ type: "text", nullable: true })
  content: string;
}
