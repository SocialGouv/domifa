import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";
import { AppEntity } from "../../../_common/model";

export class AppTypeormTable<T extends AppEntity> implements AppEntity {
  @PrimaryGeneratedColumn("uuid")
  public uuid?: string;

  @CreateDateColumn({ type: "timestamptz" })
  public createdAt?: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  public updatedAt?: Date;

  @VersionColumn()
  public version?: number;

  public constructor(entity?: Partial<T>) {
    Object.assign(this, entity);
  }
}
