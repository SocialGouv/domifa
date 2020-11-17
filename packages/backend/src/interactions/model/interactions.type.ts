import { InteractionType } from "../InteractionType.type";
import { AppEntity } from "../../_common/model";

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
