export class User {
  public id: string;
  public email: string;
  public lastname: string;
  public firstname: string;
  public password: string;
  public phone: string;
  public structure: string;

  constructor(obj?: any) {
    this.id = obj && obj._id || null;
    this.lastname = obj && obj.lastname || null;
    this.firstname = obj && obj.firstname || null;
    this.password = obj && obj.password || null;
    this.phone = obj && obj.phone || null;
    this.email = obj && obj.email || null;
    this.structure = obj && obj.structure || null;
  }
}
