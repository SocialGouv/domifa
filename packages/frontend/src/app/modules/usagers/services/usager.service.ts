import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UsagerNote } from "../../../../_common/model";
import { MessageSms } from "../../../../_common/model/message-sms";
import { UsagerDecisionForm } from "../../../../_common/model/usager/UsagerDecisionForm.type";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";
import { usagersCache } from "../../../shared/store";
import { UsagerFormModel } from "../components/form/UsagerFormModel";
import { ImportPreviewTable } from "../components/import/preview";
import { Rdv } from "../interfaces/rdv";

export type UsagersImportMode = "preview" | "confirm";

@Injectable({
  providedIn: "root",
})
export class UsagerService {
  public endPointUsagers = environment.apiUrl + "usagers";

  constructor(private http: HttpClient) {}

  public create(usager: UsagerFormModel): Observable<UsagerLight> {
    const response =
      usager.ref !== 0
        ? this.http
            .patch<UsagerLight>(`${this.endPointUsagers}/${usager.ref}`, usager)
            .pipe(
              tap((newUsager: UsagerLight) => {
                usagersCache.updateUsager(newUsager);
                return newUsager;
              })
            )
        : this.http.post<UsagerLight>(`${this.endPointUsagers}`, usager).pipe(
            tap((newUsager: UsagerLight) => {
              usagersCache.createUsager(newUsager);
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

  // RDV maintenant : on passe l'étape du formulaire
  public setRdv(
    rdv: Pick<Rdv, "userId" | "dateRdv" | "isNow">,
    usagerRef: number
  ): Observable<UsagerLight> {
    return this.http.post<UsagerLight>(
      `${environment.apiUrl}agenda/${usagerRef}`,
      rdv
    );
  }

  public nextStep(
    usagerRef: number,
    etapeDemande: number
  ): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/next-step/${usagerRef}/${etapeDemande}`
    );
  }

  public renouvellement(usagerRef: number): Observable<UsagerLight> {
    return this.http.get<UsagerLight>(
      `${this.endPointUsagers}/renouvellement/${usagerRef}`
    );
  }

  public deleteRenew(usagerRef: number): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPointUsagers}/renouvellement/${usagerRef}`
    );
  }

  public setDecision(
    usagerRef: number,
    decision: UsagerDecisionForm
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(
        `${this.endPointUsagers}/decision/${usagerRef}`,
        decision
      )
      .pipe(
        tap((usager: UsagerLight) => {
          usagersCache.updateUsager(usager);
        })
      );
  }

  public findOne(
    usagerRefNumberOrString: number | string
  ): Observable<UsagerLight> {
    // NOTE: usagerRef est une chaîne quand il vient d'un paramètre de l'URL, ce qui est incompatible avec la recherche dans le cache
    const usagerRef: number = parseInt(`${usagerRefNumberOrString}`, 10);

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

  public isDoublon(nom: string, prenom: string, usagerRef: number) {
    return this.http.get<UsagerLight[]>(
      `${this.endPointUsagers}/doublon/${nom}/${prenom}/${usagerRef}`
    );
  }

  /* Recherche */
  public getAllUsagers(): Observable<UsagerLight[]> {
    return this.http.get<UsagerLight[]>(`${environment.apiUrl}usagers/`).pipe(
      tap((usagers: UsagerLight[]) => {
        usagersCache.setUsagers(usagers);
      }),
      startWith(usagersCache.getSnapshot().allUsagers),
      filter((x) => !!x)
    );
  }

  public import(
    mode: UsagersImportMode,
    data: FormData
  ): Observable<{
    importMode: UsagersImportMode;
    previewTable: ImportPreviewTable;
  }> {
    return this.http.post<any>(environment.apiUrl + "import/" + mode, data);
  }

  public findMySms(usager: UsagerLight): Observable<MessageSms[]> {
    return this.http.get(environment.apiUrl + "sms/usager/" + usager.ref).pipe(
      map((res: MessageSms[]) => {
        return res;
      })
    );
  }
}
