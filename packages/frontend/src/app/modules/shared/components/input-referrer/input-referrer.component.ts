import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { ManageUsersService } from "../../../manage-users/services/manage-users.service";
import { Subscription } from "rxjs";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-input-referrer",
  templateUrl: "./input-referrer.component.html",
  styleUrls: ["./input-referrer.component.css"],
  standalone: false,
})
export class InputReferrerComponent implements OnInit {
  @Input({ required: true }) public submitted!: boolean;

  @Input() public parentFormGroup!: UntypedFormGroup;
  @Input() public referrerId: number | null = null;
  @Input() public label = "Référent du dossier";
  @Input() public displayHint = true;

  @Input({ required: true }) public required = false;
  @Input({ required: true }) public displayLabel = true;

  @Output() outputFunction = new EventEmitter<number | null>();

  public users: Pick<UserStructure, "nom" | "prenom" | "id">[] = [];
  public subscription = new Subscription();

  constructor(private readonly manageUsersService: ManageUsersService) {}

  ngOnInit() {
    this.subscription.add(
      this.manageUsersService.referrers$.subscribe((referrers) => {
        this.users = referrers;
      })
    );
  }

  onModelChange(event: number | null) {
    if (this.parentFormGroup) {
      this.parentFormGroup.controls.referrerId.setValue(event);
    } else {
      this.outputFunction.emit(event);
    }
  }
}
