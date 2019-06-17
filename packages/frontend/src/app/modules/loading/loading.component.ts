import { animate, style, transition, trigger } from "@angular/animations";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { LoadingService } from "./loading.service";

const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate(500, style({ opacity: 1 }))
  ]),
  transition(":leave", [animate(700, style({ opacity: 0 }))])
]);

@Component({
  animations: [fadeInOut],
  selector: "app-loading",
  styleUrls: ["./loading.component.css"],
  templateUrl: "./loading.component.html"
})
export class LoadingComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  public loadingSubscription: Subscription;

  constructor(private loadingService: LoadingService) {}

  public ngOnInit() {
    this.loadingSubscription = this.loadingService.loadingStatus
      .pipe(debounceTime(200))
      .subscribe((value) => {
        this.loading = value;
      });
  }

  public ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }
}
