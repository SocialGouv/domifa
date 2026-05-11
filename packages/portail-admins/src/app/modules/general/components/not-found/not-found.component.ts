import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";

@Component({
  selector: "app-not-found",
  styleUrls: ["./not-found.component.css"],
  templateUrl: "./not-found.component.html",
})
export class NotFoundComponent implements OnInit {
  constructor(
    private readonly titleService: Title,
    private readonly router: Router
  ) {}
  public ngOnInit() {
    this.titleService.setTitle("La page que vous recherchez n'éxiste pas");
  }

  public backToHomeSelect(): void {
    this.router.navigate(["/"]);
  }
}
