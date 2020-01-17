import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.css"],
  templateUrl: "./faq.component.html"
})
export class FaqComponent implements OnInit {
  public title: string;

  constructor() {
    this.title = "Foire aux question de Domifa";
  }

  public ngOnInit() {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
  }

  public scrollTo(el: HTMLElement) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}
