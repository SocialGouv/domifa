import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LoadingService {
  public loadingStatus: Subject<boolean> = new Subject();
  public loading: boolean = false;

  public startLoading() {
    this.loading = true;
    this.loadingStatus.next(true);
  }

  public stopLoading() {
    setTimeout(() => {
      this.loading = false;
      this.loadingStatus.next(false);
    }, 200);
  }
}
