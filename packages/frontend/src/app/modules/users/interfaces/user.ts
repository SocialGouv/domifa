import { Structure } from "../../structures/structure.interface";

export class User {
  public nom: string;
  public prenom: string;
  public email: string;
  public fonction: string;
  public role: string;
  public password: string;
  public phone: string;
  public statut: string;
  public token: string;
  public structureId: number;
  public structure: Structure;

  constructor(user?: any) {
    this.statut = (user && user.statut) || "instructeur";
    this.prenom = (user && user.prenom) || null;
    this.nom = (user && user.nom) || null;
    this.email = (user && user.email) || null;
    this.fonction = (user && user.fonction) || null;
    this.role = (user && user.role) || null;
    this.phone = (user && user.phone) || null;
    this.statut = (user && user.statut) || null;
    this.token = (user && user.token) || null;
    this.structureId = (user && user.structureId) || null;
    this.structure =
      (user && new Structure(user.structure)) || new Structure({});
  }
}
