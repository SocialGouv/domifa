import { Component, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo-client";
import {
  GeneralService,
  TYPE_CONSULTATION_DOCUMENT,
} from "../../services/general.service";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.scss"],
  templateUrl: "./faq.component.html",
})
export class FaqComponent implements OnInit {
  constructor(
    private readonly titleService: Title,
    private readonly meta: Meta,
    private readonly matomo: MatomoTracker,
    private readonly generalService: GeneralService
  ) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Foire aux question de DomiFa");

    this.meta.updateTag({
      name: "description",
      content:
        "Foire aux questions de DomiFa : RGPD, conditions d'utilisations, réglement, toutes vos questions trouveront leur réponse ici !",
    });
  }

  public scrollTo(el: HTMLElement): void {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  public doLogDownloadAction(): void {
    this.generalService.logDownloadAction(TYPE_CONSULTATION_DOCUMENT.GUIDE);
  }

  public trackVideo(name: string): void {
    this.matomo.trackEvent("vues_videos_faq", name, "null", 1);
  }
}
