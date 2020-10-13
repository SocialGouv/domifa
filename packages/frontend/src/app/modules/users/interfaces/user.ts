import { Structure } from "../../structures/structure.interface";
import { UserRole } from "./user-role.type";

export class User {
  public email: string;
  public fonction: string;
  public id: string;
  public lastLogin: Date;
  public nom: string;
  public password: string;
  public phone: string;
  public prenom: string;
  public passwordLastUpdate: Date;
  public role: UserRole;
  public structure: Structure;
  public structureId: number;
  public token: string;
  public verified: boolean;

  constructor(user?: any) {
    this.email = (user && user.email) || null;
    this.fonction = (user && user.fonction) || null;
    this.id = (user && user.id) || null;
    this.nom = (user && user.nom) || null;
    this.password = "";
    this.phone = (user && user.phone) || null;
    this.prenom = (user && user.prenom) || null;

    this.role = (user && user.role) || null;
    this.structureId = (user && user.structureId) || null;
    this.token = (user && user.token) || null;
    this.verified = (user && user.verified) || false;
    this.structure =
      (user && new Structure(user.structure)) || new Structure({});
    this.lastLogin = (user && new Date(user.lastLogin)) || null;

    this.passwordLastUpdate = null;

    if (user && user.passwordLastUpdate) {
      this.passwordLastUpdate = new Date(user.passwordLastUpdate);
    }
  }
}
