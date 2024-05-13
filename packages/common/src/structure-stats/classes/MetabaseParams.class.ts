import { type StructureType } from "../..";

export class MetabaseParams {
  public year: number;
  public region?: string;
  public department?: string;
  public structureId?: number;
  public structureType?: StructureType;

  constructor() {
    this.year = new Date().getFullYear();
  }
}
