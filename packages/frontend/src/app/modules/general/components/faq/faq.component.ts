import { Component, OnInit } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.css"],
  templateUrl: "./faq.component.html",
})
export class FaqComponent implements OnInit {
  constructor(private titleService: Title, private meta: Meta) {}

  public ngOnInit() {
    this.titleService.setTitle("Foire aux question de Domifa");

    this.meta.updateTag({
      name: "description",
      content:
        "Foire aux questions de DOMIFA : RGPD, conditions d'utilisations, réglement, toutes vos questions trouveront leur réponse ici !",
    });
  }

  public scrollTo(el: HTMLElement) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
