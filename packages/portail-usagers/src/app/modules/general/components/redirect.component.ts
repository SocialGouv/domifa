import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { filterMatomoParams } from "@domifa/common";

@Component({
  standalone: true,
  template: "",
})
export class RedirectComponent implements OnInit {
  constructor(private readonly router: Router) {}

  ngOnInit() {
    this.redirectToLogin();
  }

  private redirectToLogin(): void {
    const matomoParams = this.getMatomoParams();
    this.router.navigate(["/auth/login"], { queryParams: matomoParams });
  }

  private getMatomoParams(): Record<string, string> {
    try {
      const urlTree = this.router.parseUrl(this.router.url);
      return filterMatomoParams(urlTree.queryParams);
    } catch (error) {
      console.warn("Failed to parse URL for Matomo params:", error);
      return {};
    }
  }
}
