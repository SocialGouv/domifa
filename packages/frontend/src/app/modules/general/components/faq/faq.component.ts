import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.css"],
  templateUrl: "./faq.component.html",
})
export class FaqComponent {
  public title: string;

  constructor() {
    this.title = "Foire aux question de Domifa";
  }

  public scrollTo(el: HTMLElement) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
