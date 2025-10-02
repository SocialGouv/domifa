import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DsfrAccordionModule, DsfrButtonModule } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [DsfrAccordionModule, DsfrButtonModule, RouterModule],
  templateUrl: "./faq.component.html",
  styleUrl: "./faq.component.css",
})
export class FaqComponent {}
