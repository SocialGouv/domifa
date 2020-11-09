import moment = require("moment");

import { Column, Entity } from "typeorm";
import { AppTypeormTable } from "../../database/AppTypeormTable.typeorm";

import { Interactions } from "../model";
import { InteractionType } from "../InteractionType.type";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "interactions" })
export class InteractionsTable
  extends AppTypeormTable<Interactions>
  implements Interactions {
  @Column({ type: "text", nullable: true })
  _id: any; // obsolete mongo id: use `uuid` instead

  @Column({ type: "date", default: "now()" })
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
