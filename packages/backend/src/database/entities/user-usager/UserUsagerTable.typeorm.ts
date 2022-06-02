import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { StructureTable, UsagerTable } from "..";

import { UserStructureResume, UserUsager } from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_usager" })
export class UserUsagerTable
  extends AppTypeormTable<UserUsagerTable>
  implements UserUsager
{
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;

  @Index()
  @Column({ type: "uuid", unique: true })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid)
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id)
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Index()
  @Column({ type: "text", unique: true })
  login: string;

  @Column({ type: "text" })
  password: string;

  @Column({ type: "text" })
  salt: string;

  @Column({ type: "boolean", default: false })
  isTemporaryPassword: boolean;

  @Column({ type: "timestamptz", nullable: true })
  lastLogin: Date;

  @Column({ type: "timestamptz", nullable: true })
  passwordLastUpdate: Date;

  @Column({ type: "timestamptz", nullable: true })
  lastPasswordResetDate: Date;

  @Column({ type: "jsonb", nullable: true })
  lastPasswordResetStructureUser: UserStructureResume;

  @Column({ type: "boolean", default: false })
  enabled: boolean;

  public constructor(entity?: Partial<UserUsagerTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
