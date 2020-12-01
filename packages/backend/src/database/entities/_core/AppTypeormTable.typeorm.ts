import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";
import { AppEntity } from "../../../_common/model";

export abstract class AppTypeormTable<T extends AppEntity>
  implements AppEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid?: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt?: Date;

  @VersionColumn()
  version?: number;

  constructor(entity?: Partial<T>) {
    Object.assign(this, entity);
  }
}
