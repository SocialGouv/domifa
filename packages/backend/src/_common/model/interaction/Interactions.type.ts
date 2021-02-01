import { AppEntity } from "..";
import { InteractionType } from "./InteractionType.type";

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
  usagerRef: number;
  usagerUUID: string;
  userId: number;
  userName: string;
};
