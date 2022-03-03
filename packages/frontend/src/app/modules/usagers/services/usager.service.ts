import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerNote } from "../../../../_common/model";
import { MessageSms } from "../../../../_common/model/message-sms";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersCache } from "../../../shared/store";
import { SearchPageLoadedUsagersData } from "../../../shared/store/AppStoreModel.type";
import { UsagerFormModel } from "../../usager-shared/interfaces";
import { ImportPreviewTable } from "../components/import/preview";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public patch(usager: UsagerFormModel): Observable<UsagerLight> {
    const response = this.http
      .patch<UsagerLight>(`${this.endPointUsagers}/${usager.ref}`, usager)
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersCache.updateUsager(newUsager);
          return newUsager;
        })
      );

    return response;
  }

  public createNote({
    note,
    usagerRef,
  }: {
    note: Pick<UsagerNote, "message">;
    usagerRef: number;
  }): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${environment.apiUrl}note/${usagerRef}`, note)
      .pipe(
        tap((usager: UsagerLight) => {
          usagersCache.updateUsager(usager);
        })
      );
  }

  public archiveNote({
    noteId,
    usagerRef,
  }: {
    noteId: string;
    usagerRef: number;
  }): Observable<UsagerLight> {
    return this.http
      .put<UsagerLight>(
        `${environment.apiUrl}note/${usagerRef}/archive/${noteId}`,
        {}
      )
      .pipe(
        tap((usager: UsagerLight) => {
          usagersCache.updateUsager(usager);
        })
      );
  }

  public findOne(usagerRef: number): Observable<UsagerLight> {
    return this.http
      .get<UsagerLight>(`${this.endPointUsagers}/${usagerRef}`)
      .pipe(
        tap((x) =>
          // update cache
          usagersCache.updateUsager(x)
        ),
        startWith(usagersCache.getSnapshot().usagersByRefMap[usagerRef]), // try to load value from cache
        filter((x) => !!x) // filter out empty cache value
      );
  }

  /* Recherche */
  public getSearchPageUsagerData({
    chargerTousRadies,
  }: {
    chargerTousRadies: boolean;
  }): Observable<SearchPageLoadedUsagersData> {
    return this.http
      .get<SearchPageLoadedUsagersData>(
        `${environment.apiUrl}usagers/?chargerTousRadies=${chargerTousRadies}`
      )
      .pipe(
        tap((searchPageLoadedUsagersData: SearchPageLoadedUsagersData) => {
          usagersCache.setSearchPageLoadedUsagersData(
            searchPageLoadedUsagersData
          );
        }),
        startWith(usagersCache.getSnapshot().searchPageLoadedUsagersData),
        filter((x) => !!x)
      );
  }

  public getSearchPageRemoteSearchRadies({
    searchString,
  }: {
    searchString: string;
  }): Observable<UsagerLight[]> {
    return this.http
      .post<UsagerLight[]>(`${environment.apiUrl}usagers/search-radies`, {
        searchString,
      })
      .pipe(
        tap((usagers: UsagerLight[]) => {
          usagersCache.updateUsagers(usagers);
        })
      );
  }

  public import(
    mode: UsagersImportMode,
    data: FormData
  ): Observable<{
    importMode: UsagersImportMode;
    previewTable: ImportPreviewTable;
  }> {
    return this.http.post<{
      importMode: UsagersImportMode;
      previewTable: ImportPreviewTable;
    }>(environment.apiUrl + "import/" + mode, data);
  }

  public findMySms(usager: UsagerLight): Observable<MessageSms[]> {
    return this.http.get<MessageSms[]>(
      environment.apiUrl + "sms/usager/" + usager.ref
    );
  }
}
