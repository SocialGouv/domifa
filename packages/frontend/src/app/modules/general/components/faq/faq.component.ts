import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.css"],
  templateUrl: "./faq.component.html",
})
export class FaqComponent implements OnInit {
  constructor(private titleService: Title) {}

  public ngOnInit() {
    this.titleService.setTitle("Foire aux question de Domifa");
  }

  public scrollTo(el: HTMLElement) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
