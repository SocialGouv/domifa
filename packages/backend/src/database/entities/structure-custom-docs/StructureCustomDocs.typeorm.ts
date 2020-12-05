import { Column, Entity, Generated, Index } from "typeorm";
import {
  AppUser,
  AppUserMails,
  AppUserTokens,
  UserRole,
} from "../../../_common/model";
import { StructureCustomDocs } from "../../../_common/model/structure-custom-docs";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_custom_docs" })
export class StructureCustomDocsTable
  extends AppTypeormTable<StructureCustomDocsTable>
  implements StructureCustomDocs {
  @Index()
  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", nullable: true })
  fonction: string;

  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;
}
