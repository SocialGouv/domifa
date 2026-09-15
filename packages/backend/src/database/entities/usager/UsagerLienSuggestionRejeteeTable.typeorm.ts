import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

import {
  UsagerLienSuggestionRejetee,
  UserStructureResume,
} from "@domifa/common";

// Persiste le "Ce n'est pas la même personne" du formulaire de liaison :
// une ligne par (usagerUUID, ayantDroitUUID) rejetée empêche la suggestion
// de matching de ressortir pour cette déclaration d'ayant droit précise.
// Si l'ayant droit est retiré puis redéclaré, il obtient un nouvel uuid
// donc une suggestion à nouveau fraîche.
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
