import { type AppEntity } from "../_core/AppEntity.type";

export interface UserUsagerLogin extends AppEntity {
  usagerUUID: string;
  structureId: number;
}
