import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { UsagerNote, Usager } from "../../../../_common/model";
import { PageOptions, PageResults } from "../../../../_common/model/pagination";

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

  public getNotes(
    usagerRef: number,
    pageOptions: PageOptions,
    archived: boolean
  ): Observable<PageResults<UsagerNote>> {
    return this.http.post<PageResults<UsagerNote>>(
      `${this.endPoint}/search/${usagerRef}/${archived}`,
      pageOptions
    );
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

  public pinNote({
    noteUUID,
    usagerRef,
  }: {
    noteUUID: string;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http.put<Usager>(
      `${this.endPoint}/${usagerRef}/pin/${noteUUID}`,
      {}
    );
  }

  public deleteNote({
    noteUUID,
    usagerRef,
  }: {
    noteUUID: string;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http.delete<Usager>(
      `${this.endPoint}/${usagerRef}/archive/${noteUUID}`,
      {}
    );
  }
}
