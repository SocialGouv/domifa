import { Component, Input } from "@angular/core";

export type StatCardStatus =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

@Component({
  selector: "app-stat-card",
  templateUrl: "./stat-card.component.html",
  styleUrl: "./stat-card.component.scss",
  standalone: false,
})
export class StatCardComponent {
  @Input({ required: true }) public label!: string;
  @Input({ required: true }) public value!: number | string;
  @Input({ required: true }) public icon!: string;
  @Input() public status: StatCardStatus = "neutral";
}
