import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import { UsagerLight } from "../../../../_common/model";

import { usagerActions, UsagerState } from "../../../shared";
import { Store } from "@ngrx/store";
import { PageOptions, PageResults, UsagerNote, Usager } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class UsagerNotesService {
  public endPoint = environment.apiUrl + "usagers-notes";

  constructor(
    private readonly http: HttpClient,
    public store: Store<UsagerState>
  ) {}

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
    usager: UsagerLight,
    pageOptions: PageOptions,
    archived: boolean
  ): Observable<PageResults<UsagerNote>> {
    return this.http
      .post<PageResults<UsagerNote>>(
        `${this.endPoint}/search/${usager.ref}/${archived}`,
        pageOptions
      )
      .pipe(
        tap((notes: PageResults<UsagerNote>) => {
          this.store.dispatch(
            usagerActions.updateUsagerNotes({
              ref: usager.ref,
              nbNotes: notes.meta.itemCount,
            })
          );
          return notes;
        })
      );
  }

  public archiveNote({
    noteUUID,
    usagerRef,
  }: {
    noteUUID: string;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http
      .put<Usager>(`${this.endPoint}/${usagerRef}/archive/${noteUUID}`, {})
      .pipe(
        tap((newUsager: Usager) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
          return newUsager;
        })
      );
  }

  public pinNote({
    noteUUID,
    usagerRef,
  }: {
    noteUUID: string;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http
      .put<Usager>(`${this.endPoint}/${usagerRef}/pin/${noteUUID}`, {})
      .pipe(
        tap((newUsager: Usager) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
          return newUsager;
        })
      );
  }

  public deleteNote({
    noteUUID,
    usagerRef,
  }: {
    noteUUID: string;
    usagerRef: number;
  }): Observable<Usager> {
    return this.http
      .delete<Usager>(`${this.endPoint}/${usagerRef}/${noteUUID}`, {})
      .pipe(
        tap((newUsager: Usager) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
          return newUsager;
        })
      );
  }
}
