export class Doc {
  public label: string;
  public createdAt: Date;
  public createdBy: string;
  public filetype: string;

  constructor(doc?: any) {
    this.label = (doc && doc.label) || "";
    this.createdBy = (doc && doc.createdBy) || "";
    this.filetype = (doc && doc.filetype) || "";
    this.createdAt = (doc && new Date(doc.createdAt)) || new Date();
  }
}
