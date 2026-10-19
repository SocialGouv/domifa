import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

import { DEFAULT_LOADING_LABEL } from "./loading.constants";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  public loadingStatus: Subject<boolean> = new Subject();
  public loadingLabel = new BehaviorSubject<string>(DEFAULT_LOADING_LABEL);
  public loading = false;

  public startLoading(label: string = DEFAULT_LOADING_LABEL) {
    this.loading = true;
    this.loadingLabel.next(label);
    this.loadingStatus.next(true);
  }

  public setLabel(label: string) {
    this.loadingLabel.next(label);
  }

  public stopLoading() {
    setTimeout(() => {
      this.loading = false;
      this.loadingStatus.next(false);
      this.loadingLabel.next(DEFAULT_LOADING_LABEL);
    }, 200);
  }
}
