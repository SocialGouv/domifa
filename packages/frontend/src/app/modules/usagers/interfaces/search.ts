export class Search {
  public statut: string;
  public name: string;
  public echeance: string;
  public courrier: boolean;
  public id: number;

  constructor(search?: any) {
    this.courrier = search && search.courrier ||  null;
    this.echeance = search && search.echeance ||  null;
    this.id = search && search.id ||  null;
    this.name = search && search.name ||  null;
    this.statut = search && search.statut ||  null;
  }
};
