import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Structure } from "../structure.interface";

@Injectable({
  providedIn: "root"
})
export class StructureService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "structures";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public getStructure(id: number): any {
    return this.http.get(`${this.endPoint}/${id}/`);
  }

  public getAll() {
    return this.http.get(`${this.endPoint}`);
  }

  /* Ajout d'un domicilié */
  public create(structure: Structure) {
    return structure.id !== 0
      ? this.http.patch(`${this.endPoint}`, structure)
      : this.http.post(`${this.endPoint}`, structure);
  }

  public findOne(structureId: number) {
    return this.http.get(`${this.endPoint}/${structureId}`);
  }
}
