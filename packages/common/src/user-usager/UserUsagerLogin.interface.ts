import { type AppEntity } from "../_core/types/AppEntity.type";

export interface UserUsagerLogin extends AppEntity {
  usagerUUID: string;
  structureId: number;
}
