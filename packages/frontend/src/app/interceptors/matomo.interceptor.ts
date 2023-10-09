import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd } from "@angular/router";
import { MatomoRouterInterceptor, MatomoTracker } from "ngx-matomo-client";

@Injectable()
export class MatomoInterceptor implements MatomoRouterInterceptor {
  private readonly tracker = inject(MatomoTracker);
  private readonly titleService = inject(Title);

  beforePageTrack(event: NavigationEnd): void {
    const urlParts = event.url.split("/");
    const title = this.titleService.getTitle();

    if (urlParts[1] === "profil" || urlParts[1] === "usager") {
      const newTitle = title.replace(/ de.*/g, " de xxx xxx");
      this.tracker.setDocumentTitle(newTitle);
    }
  }
}
