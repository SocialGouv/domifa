import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class StructureService {
  public http: HttpClient;
  private endPoint = environment.apiUrl + "structures/";

  constructor(http: HttpClient) {
    this.http = http;
  }

  public getStructure(id: number) {
    return this.http.get(`${this.endPoint}${id}/`);
  }
}
