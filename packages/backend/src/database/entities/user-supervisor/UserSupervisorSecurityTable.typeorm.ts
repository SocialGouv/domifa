import { Entity, Index, ManyToOne, Column, JoinColumn } from "typeorm";
import { BaseUserSecurityTable } from "../_core/BaseUserSecurityTable.typeorm";
import { UserSupervisorTable } from "./UserSupervisorTable.typeorm";

@Entity({ name: "user_supervisor_security" })
export class UserSupervisorSecurityTable extends BaseUserSecurityTable<UserSupervisorTable> {
  @Index()
  @ManyToOne(() => UserSupervisorTable, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false, unique: true })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  public userId: number;

  public constructor(entity?: Partial<UserSupervisorSecurityTable>) {
    super(entity);
  }
}
