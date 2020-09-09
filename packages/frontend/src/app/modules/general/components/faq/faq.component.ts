import { Component, OnInit } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { MatomoTracker } from "ngx-matomo";

@Component({
  selector: "app-faq",
  styleUrls: ["./faq.component.css"],
  templateUrl: "./faq.component.html",
})
export class FaqComponent implements OnInit {
  constructor(
    private titleService: Title,
    private meta: Meta,
    private http: HttpClient,
    private matomo: MatomoTracker,
    private notifService: ToastrService
  ) {}

  public ngOnInit() {
    this.titleService.setTitle("Foire aux question de Domifa");

    this.meta.updateTag({
      name: "description",
      content:
        "Foire aux questions de DOMIFA : RGPD, conditions d'utilisations, réglement, toutes vos questions trouveront leur réponse ici !",
    });
  }

  public download(url: string, nom: string) {
    saveAs(url, nom + ".mp4");
    setTimeout(() => {
      this.notifService.success("Le téléchargement vient de débuter");
    }, 500);
  }

  public scrollTo(el: HTMLElement) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  public trackVideo(name: string) {
    this.matomo.trackEvent("vues_videos_faq", name, "null", 1);
  }
}
