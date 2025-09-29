import { Component } from "@angular/core";
import { DsfrAccordionModule, DsfrButtonModule } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [DsfrAccordionModule, DsfrButtonModule],
  templateUrl: "./faq.component.html",
  styleUrl: "./faq.component.css",
})
export class FaqComponent {}
