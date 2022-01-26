import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { StructureDoc } from "../../../../_common/structure-doc";

@Injectable({
  providedIn: "root",
})
export class StructuresCustomDocsService {
  private endPoint = environment.apiUrl + "admin/structures-docs";

  constructor(private http: HttpClient) {}

  public getAllStructureDocs(): Observable<StructureDoc[]> {
    return this.http.get<StructureDoc[]>(this.endPoint + "/all");
  }

  public getStructureDoc(structureId: number, docUuid: string) {
    return this.http.get(
      this.endPoint + "/structure/" + structureId.toString() + "/" + docUuid,
      {
        responseType: "blob",
      }
    );
  }
}
