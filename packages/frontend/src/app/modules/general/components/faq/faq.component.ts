import { Component, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo-client";
import { CustomToastService } from "../../../shared/services/custom-toast.service";

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
    private readonly toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Foire aux question de DomiFa");

    this.meta.updateTag({
      name: "description",
      content:
        "Foire aux questions de DomiFa : RGPD, conditions d'utilisations, réglement, toutes vos questions trouveront leur réponse ici !",
    });
  }

  public download(url: string, nom: string): void {
    saveAs(url, nom + ".mp4");
    setTimeout(() => {
      this.toastService.success("Le téléchargement vient de débuter");
    }, 500);
  }

  public scrollTo(el: HTMLElement): void {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  public trackVideo(name: string): void {
    this.matomo.trackEvent("vues_videos_faq", name, "null", 1);
  }
}
