import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HomeStats } from "@domifa/common";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class GeneralService {
  constructor(private readonly http: HttpClient) {}

  public getHomeStats(): Observable<HomeStats> {
    return this.http.get<HomeStats>(environment.apiUrl + "stats/home");
  }

  public sendContact(data: FormData): Observable<boolean> {
    const uploadURL = `${environment.apiUrl}contact`;
    return this.http.post<boolean>(uploadURL, data);
  }
}
