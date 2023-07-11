import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { fadeInOut } from "../../../../shared";

import { LoadingService } from "../../services/loading.service";

@Component({
  animations: [fadeInOut],
  selector: "app-loading",
  styleUrls: ["./loading.component.css"],
  templateUrl: "./loading.component.html",
})
export class LoadingComponent implements OnInit, OnDestroy {
  public loading = false;
  public loadingSubscription: Subscription;

  constructor(private readonly loadingService: LoadingService) {
    this.loadingSubscription = new Subscription();
  }

  public ngOnInit(): void {
    this.loadingSubscription = this.loadingService.loadingStatus
      .pipe(debounceTime(200))
      .subscribe((value) => {
        this.loading = value;
      });
  }

  public ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }
}
