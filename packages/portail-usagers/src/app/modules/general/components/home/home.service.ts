import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { environment } from "../../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  public baseUrl = environment.apiUrl + "stats/";

  constructor(public http: HttpClient) {}
}
