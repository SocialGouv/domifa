import { HttpClient, HttpEventType, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { LoadingService } from "../../loading/loading.service";
import { Interaction } from "../interfaces/interaction";
import { Usager } from "../interfaces/usager";

@Injectable({
  providedIn: "root"
})
export class InteractionService {
  public http: HttpClient;
  public loading: boolean;
  public endPoint = environment.apiUrl + "interactions/";

  constructor(http: HttpClient, private loadingService: LoadingService) {
    this.http = http;
    this.loading = true;
  }

  public setInteraction(
    usagerId: number,
    interaction?: any
  ): Observable<Usager> {
    return this.http.post(`${this.endPoint}${usagerId}`, interaction).pipe(
      map(response => {
        return new Usager(response);
      })
    );
  }

  public getInteractions(usagerId: number): Observable<Interaction[]> {
    return this.http.get(`${this.endPoint}${usagerId}/10`).pipe(
      map(response => {
        return Array.isArray(response)
          ? response.map(item => new Interaction(item))
          : [new Interaction(response)];
      })
    );
  }

  public setPassage(usagerId: number, type: string) {
    return this.http.post(`${this.endPoint}${usagerId}/${type}`, {});
  }

  public delete(usagerId: number, interactionId: string) {
    return this.http.delete(`${this.endPoint}${usagerId}/${interactionId}`);
  }
}
