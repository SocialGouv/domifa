import { Structure } from "../../structures/structure.interface";

export class User {
  public id: string;
  public nom: string;
  public prenom: string;
  public email: string;
  public fonction: string;
  public role: string;
  public password: string;
  public phone: string;
  public token: string;
  public structureId: number;
  public structure: Structure;
  public lastLogin: Date;

  constructor(user?: any) {
    this.prenom = (user && user.prenom) || null;
    this.nom = (user && user.nom) || null;
    this.password = "";
    this.email = (user && user.email) || null;
    this.fonction = (user && user.fonction) || null;
    this.role = (user && user.role) || null;
    this.phone = (user && user.phone) || null;
    this.token = (user && user.token) || null;
    this.structureId = (user && user.structureId) || null;
    this.id = (user && user.id) || null;
    this.structure =
      (user && new Structure(user.structure)) || new Structure({});
    this.lastLogin = (user && new Date(user.lastLogin)) || null;
  }
}
