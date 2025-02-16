import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from "@angular/core";
import { ManageUsersService } from "../../services/manage-users.service";
import { Subscription } from "rxjs";
import { UserStructureProfile } from "@domifa/common";

@Component({
  selector: "app-assign-referrers",
  templateUrl: "./assign-referrers.component.html",
  styleUrls: ["./assign-referrers.component.css"],
})
export class AssignReferrersComponent implements OnInit, OnDestroy {
  public nbReferrers: number = 0;
  public submitted: boolean = false;
  private subscription = new Subscription();

  @Input({ required: true }) @Input() public currentUser: UserStructureProfile;
  @Input() public newReferrerId: number | null;

  @Output() public readonly newReferrerIdChange = new EventEmitter<
    number | null
  >();

  constructor(private readonly manageUsersService: ManageUsersService) {}

  ngOnInit() {
    this.subscription.add(
      this.manageUsersService
        .countReferrers(this.currentUser)
        .subscribe((nbReferrers: number) => {
          this.nbReferrers = nbReferrers;
        })
    );
  }

  public updateReferrers(event: number | null) {
    this.newReferrerIdChange.emit(event);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
