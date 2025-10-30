import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { DsfrSidemenuModule } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [RouterModule, CommonModule, DsfrSidemenuModule],
  templateUrl: "./faq.component.html",
})
export class FaqComponent {}
