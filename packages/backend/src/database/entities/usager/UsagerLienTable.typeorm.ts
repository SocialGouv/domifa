import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

import {
  UsagerLien,
  UsagerLienType,
  UserStructureResume,
} from "@domifa/common";

// Stockage "deux lignes miroir" : relier A à B crée une ligne
// (usagerUUID: A, linkedUsagerUUID: B) et une ligne symétrique
// (usagerUUID: B, linkedUsagerUUID: A), toujours dans la même transaction
// (voir UsagerLienService.link/unlink). La contrainte UNIQUE sur
// "usagerUUID" garantit le 1-1 au niveau base : un usager ne peut jamais
// être "usagerUUID" sur plus d'une ligne. Les deux FK en CASCADE font que
// la suppression d'un usager supprime automatiquement les deux côtés du
// lien, sans code applicatif dédié.
@Entity({ name: "usager_lien" })
@Check("CHK_usager_lien_not_self", `"usagerUUID" <> "linkedUsagerUUID"`)
export class UsagerLienTable
  extends AppTypeormTable<UsagerLienTable>
  implements UsagerLien
{
  @Index()
  @Column({ type: "uuid", nullable: false, unique: true })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "linkedUsagerUUID", referencedColumnName: "uuid" })
  public linkedUsagerUUID: string;

  @Column({ type: "text", nullable: false, default: "CONJOINT" })
  public type: UsagerLienType;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", nullable: true })
  public createdBy: UserStructureResume;

  public constructor(entity?: Partial<UsagerLienTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
