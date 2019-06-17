import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LoadingService {
  get loading(): boolean {
    return this._loading;
  }

  set loading(value) {
    this._loading = value;
    this.loadingStatus.next(value);
  }

  public loadingStatus: Subject<boolean> = new Subject();
  private _loading: boolean = false;

  public startLoading() {
    this.loading = true;
  }

  public stopLoading() {
    setTimeout(() => {
      this.loading = false;
    }, 200);
  }
}
