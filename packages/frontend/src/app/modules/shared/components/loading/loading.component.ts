import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { fadeInOut } from "../../../../shared";

import { LoadingService } from "../../services/loading.service";
import { DEFAULT_LOADING_LABEL } from "../../services/loading.constants";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";

@Component({
  animations: [fadeInOut],
  selector: "app-loading",
  imports: [DsfrSpinnerComponent],
  styleUrls: ["./loading.component.css"],
  templateUrl: "./loading.component.html",
})
export class LoadingComponent implements OnInit, OnDestroy {
  public loading = false;
  public label = DEFAULT_LOADING_LABEL;
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
    this.loadingSubscription.add(
      this.loadingService.loadingLabel.subscribe((label) => {
        this.label = label;
      })
    );
  }

  public ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }
}
