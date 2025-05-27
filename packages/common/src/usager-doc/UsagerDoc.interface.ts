import { CommonDoc } from "../_core";

export interface UsagerDoc extends CommonDoc {
  createdBy: string; // TODO: migrate this to userCreatedBy object
  usagerUUID: string;
  usagerRef: number;
  shared: boolean;
}
