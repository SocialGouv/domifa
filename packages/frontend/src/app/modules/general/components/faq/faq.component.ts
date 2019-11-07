import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.css"],
  templateUrl: "./faq.component.html"
})
export class FaqComponent implements OnInit {
  public title: string;

  public ngOnInit() {
    this.title = "Foire aux question de Domifa";
  }

  public scrollTo(el: HTMLElement) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}
