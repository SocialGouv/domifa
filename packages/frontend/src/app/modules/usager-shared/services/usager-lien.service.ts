import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, tap } from "rxjs";
import { environment } from "src/environments/environment";
import {
  ApiMessage,
  LogAction,
  PageOptions,
  PageResults,
  UsagerLienSearchResult,
  UsagerLienSuggestion,
  UsagerLienSummary,
} from "@domifa/common";

export interface UsagerLienLogEntry {
  action: LogAction;
  createdAt: Date;
  userName?: string;
  context?: {
    linkedUsagerRef?: number;
    linkedUsagerNom?: string;
    acceptedSuggestion?: boolean;
  };
}

@Injectable({
  providedIn: "root",
})
export class UsagerLienService {
  public endPoint = environment.apiUrl + "usagers-lien";

  // Emits on every successful link/unlink, so components that display the
  // conjoint elsewhere on the same page (header + form in the Dossier tab)
  // resync without a page reload.
  private readonly changedSource = new Subject<void>();
  public readonly changed$ = this.changedSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  public getLien(usagerRef: number): Observable<UsagerLienSummary | null> {
    return this.http.get<UsagerLienSummary | null>(
      `${this.endPoint}/${usagerRef}`
    );
  }

  public getSuggestion(
    usagerRef: number
  ): Observable<UsagerLienSuggestion | null> {
    return this.http.get<UsagerLienSuggestion | null>(
      `${this.endPoint}/${usagerRef}/suggestion`
    );
  }

  public search(
    usagerRef: number,
    query: string
  ): Observable<UsagerLienSearchResult[]> {
    return this.http.post<UsagerLienSearchResult[]>(
      `${this.endPoint}/${usagerRef}/search`,
      { query }
    );
  }

  public link(
    usagerRef: number,
    targetUsagerUuid: string,
    acceptedSuggestion: boolean
  ): Observable<UsagerLienSummary> {
    return this.http
      .post<UsagerLienSummary>(`${this.endPoint}/${usagerRef}/link`, {
        targetUsagerUuid,
        acceptedSuggestion,
      })
      .pipe(tap(() => this.changedSource.next()));
  }

  public unlink(usagerRef: number): Observable<ApiMessage> {
    return this.http
      .delete<ApiMessage>(`${this.endPoint}/${usagerRef}`)
      .pipe(tap(() => this.changedSource.next()));
  }

  public rejectSuggestion(
    usagerRef: number,
    ayantDroitUuid: string
  ): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.endPoint}/${usagerRef}/reject-suggestion`,
      { ayantDroitUuid }
    );
  }

  public getHistory(
    usagerRef: number,
    pageOptions: PageOptions
  ): Observable<PageResults<UsagerLienLogEntry>> {
    return this.http.get<PageResults<UsagerLienLogEntry>>(
      `${this.endPoint}/${usagerRef}/history`,
      { params: { page: pageOptions.page, take: pageOptions.take } }
    );
  }
}
