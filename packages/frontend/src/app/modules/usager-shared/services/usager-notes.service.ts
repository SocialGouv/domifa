import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { UsagerNote, Usager } from "../../../../_common/model";

@Injectable({
  providedIn: "root",
})
export class UsagerNotesService {
  public endPoint = environment.apiUrl + "usagers-notes";

  constructor(private http: HttpClient) {}

  public getUsagerNotes(usagerRef: number): Observable<UsagerNote[]> {
    return this.http.get<UsagerNote[]>(`${this.endPoint}/${usagerRef}`);
  }

  public createNote({
    note,
    usagerRef,
  }: {
    note: Pick<UsagerNote, "message">;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http.post<Usager>(`${this.endPoint}/${usagerRef}`, note);
  }

  public archiveNote({
    noteUUID,
    usagerRef,
  }: {
    noteUUID: string;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http.put<Usager>(
      `${this.endPoint}/${usagerRef}/archive/${noteUUID}`,
      {}
    );
  }
}
