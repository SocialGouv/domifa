import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import {
  InteractionInForApi,
  InteractionOutForApi,
  UsagerLight,
} from "../../../../_common/model";

import { Interaction } from "../interfaces";
import { usagersCache } from "../../../shared/store";

@Injectable({
  providedIn: "root",
})
export class InteractionService {
  public endPoint = environment.apiUrl + "interactions/";

  constructor(private http: HttpClient) {}

  public setInteractionIn(
    usagerRef: number,
    interactions: InteractionInForApi[]
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPoint}${usagerRef}`, interactions)
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersCache.updateUsager(newUsager);
        })
      );
  }

  public setInteractionOut(
    usagerRef: number,
    interactions: InteractionOutForApi[]
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPoint}${usagerRef}`, interactions)
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersCache.updateUsager(newUsager);
        })
      );
  }

  public getInteractions({
    usagerRef: usagerRefNumberOrString,
    maxResults,
    filter: filterSearch,
  }: {
    usagerRef: number;
    maxResults: number;
    filter?: "distribution";
  }): Observable<Interaction[]> {
    // NOTE: usagerRef est une chaîne quand il vient d'un paramètre de l'URL, ce qui est incompatible avec la recherche dans le cache
    const usagerRef: number = parseInt(`${usagerRefNumberOrString}`, 10);

    return this.http
      .get<Interaction[]>(
        `${this.endPoint}${usagerRef}?maxResults=${maxResults}&filter=${filterSearch}`
      )
      .pipe(
        tap((interactions) =>
          // update cache
          usagersCache.updateUsagerInteractions({
            usagerRef,
            interactions,
          })
        ),
        startWith(usagersCache.getSnapshot().interactionsByRefMap[usagerRef]), // try to load value from cache
        filter((x) => !!x), // filter out empty cache value
        map((response) => {
          return Array.isArray(response)
            ? response.map((item) => new Interaction(item))
            : [new Interaction(response)];
        })
      );
  }

  public delete(
    usagerRef: number,
    interactionUuid: string
  ): Observable<UsagerLight> {
    return this.http.delete<UsagerLight>(
      `${this.endPoint}${usagerRef}/${interactionUuid}`
    );
  }
}
