import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure";
import { UsagerTable } from "./UsagerTable.typeorm";
import { UsagerDoc } from "@domifa/common";

@Entity({ name: "usager_docs" })
export class UsagerDocsTable
  extends AppTypeormTable<UsagerDocsTable>
  implements UsagerDoc
{
  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "integer", update: false, nullable: false })
  public usagerRef: number;

  @Column({ type: "text", nullable: false })
  public path: string;

  @Column({ type: "text", nullable: false })
  public label: string;

  @Column({ type: "text", nullable: false })
  public filetype: string;

  @Column({ type: "integer", nullable: true })
  public filesize: number;

  @Column({ type: "text", nullable: false })
  public createdBy: string;

  @Column({ type: "text", nullable: true })
  public encryptionContext: string;

  @Column({ type: "integer", nullable: true })
  public encryptionVersion: number;

  @Column({ type: "boolean", default: false })
  public shared: boolean;

  public constructor(entity?: Partial<UsagerDocsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
