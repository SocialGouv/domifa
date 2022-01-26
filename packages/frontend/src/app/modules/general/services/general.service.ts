import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { HomeStats } from "../components/home/HomeStats.type";

@Injectable({
  providedIn: "root",
})
export class GeneralService {
  public baseUrl: string;

  constructor(public http: HttpClient) {}

  public getHomeStats(): Observable<HomeStats> {
    return this.http.get(environment.apiUrl + "stats/home-stats").pipe(
      map((retour) => {
        return retour as HomeStats;
      })
    );
  }

  public sendContact(data: FormData): Observable<boolean> {
    const uploadURL = `${environment.apiUrl}contact`;
    return this.http.post<boolean>(uploadURL, data);
  }
}
