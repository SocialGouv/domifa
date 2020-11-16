import { AppEntity } from "../../database/AppEntity.model";
import { InteractionType } from "../InteractionType.type";

export type Interactions = AppEntity & {
  //  public _id: ObjectID;
  /**
   * @deprecated obsolete mongo id: use `uuid` instead.
   */
  id?: number;
  _id?: any;
  createdAt?: Date;
  content?: string;
  dateInteraction: Date;
  nbCourrier: number;
  structureId: number;
  type: InteractionType;
  usagerId: number;
  userId: number;
  userName: string;
};
