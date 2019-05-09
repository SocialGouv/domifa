export class Doc{

  public documentName: string;
  public dateImport: Date;
  public importBy: string;
  public filetype: string;

  constructor(doc?: any) {
    this.documentName = doc && doc.documentName || '';
    this.importBy = doc && doc.importBy || '';
    this.filetype = doc && doc.filetype || '';
    this.dateImport = doc && new Date(doc.dateImport) || new Date();
  }
}
