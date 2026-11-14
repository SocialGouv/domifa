import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

import {
  UsagerLienSuggestionRejetee,
  UserStructureResume,
} from "@domifa/common";

// Persists the "This isn't the same person" dismissal from the linking
// form: one row per rejected (usagerUUID, ayantDroitUUID) keeps the
// matching suggestion from resurfacing for that specific ayant droit
// declaration. If the ayant droit is removed and re-declared, it gets a
// new uuid and therefore a fresh suggestion.
@Entity({ name: "usager_lien_suggestion_rejetee" })
@Unique("UQ_usager_lien_suggestion_rejetee", ["usagerUUID", "ayantDroitUUID"])
export class UsagerLienSuggestionRejeteeTable
  extends AppTypeormTable<UsagerLienSuggestionRejeteeTable>
  implements UsagerLienSuggestionRejetee
{
  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Column({ type: "uuid", nullable: false })
  public ayantDroitUUID: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", nullable: true })
  public createdBy: UserStructureResume;

  public constructor(entity?: Partial<UsagerLienSuggestionRejeteeTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
