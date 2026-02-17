import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminAuthRoutingModule } from "src/app/modules/auth/auth.routing.module";

@Component({
  selector: "app-faq-usage",
  standalone: true,
  imports: [CommonModule, AdminAuthRoutingModule],
  templateUrl: "./faq-usage.component.html",
})
export class FaqUsageComponent {}
