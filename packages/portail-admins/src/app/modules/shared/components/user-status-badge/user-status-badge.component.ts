import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { UserStatus } from "@domifa/common";

import {
  USER_STATUS_BADGE_CLASS,
  USER_STATUS_LABELS,
} from "../users-table/users-table.types";

@Component({
  selector: "app-user-status-badge",
  template: `<span class="fr-badge" [ngClass]="badgeClass">{{ label }}</span>`,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatusBadgeComponent {
  @Input({ required: true }) public status!: UserStatus;

  public get badgeClass(): string {
    return USER_STATUS_BADGE_CLASS[this.status] ?? "";
  }

  public get label(): string {
    return USER_STATUS_LABELS[this.status] ?? this.status;
  }
}
