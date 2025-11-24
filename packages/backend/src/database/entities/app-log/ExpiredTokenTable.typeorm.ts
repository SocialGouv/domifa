import { Column, Entity, Index } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

import { UserProfile } from "../../../_common/model";

@Entity({ name: "expired_token" })
export class ExpiredTokenTable extends AppTypeormTable<ExpiredTokenTable> {
  @Index()
  @Column({ type: "integer", nullable: false })
  public userId: number; // can be user_structure or user_supervisor

  @Index()
  @Column({ type: "integer", nullable: true })
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
