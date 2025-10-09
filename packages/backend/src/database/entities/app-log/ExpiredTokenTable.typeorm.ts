import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureTable } from "../user-structure/UserStructureTable.typeorm";
import { UserProfile } from "../../../_common/model";

@Entity({ name: "expired_token" })
export class ExpiredTokenTable extends AppTypeormTable<ExpiredTokenTable> {
  @Index()
  @ManyToOne(() => UserStructureTable, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  public userId: number;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Index()
  @Column({ type: "text", nullable: false })
  public token: string;

  @Column({ type: "text", nullable: false })
  public userProfile: UserProfile;

  public constructor(entity?: Partial<ExpiredTokenTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
