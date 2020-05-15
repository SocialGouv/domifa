import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { Observable } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { fadeInOut } from "./shared/animations";
import { Router, NavigationEnd } from "@angular/router";
import { Title } from "@angular/platform-browser";
@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public help: boolean;
  public isNavbarCollapsed: boolean;
  public isAllowed: any;

  public domifaNews: any;
  public newsLabels: any;

  public modal: any;

  @ViewChild("newsCenter", { static: true })
  public newsCenter!: TemplateRef<any>;

  constructor(
    public authService: AuthService,
    private matomoInjector: MatomoInjector,
    private matomoTracker: MatomoTracker,
    private modalService: NgbModal,
    private http: HttpClient,
    private router: Router,
    private titleService: Title
  ) {
    this.help = false;
    this.isNavbarCollapsed = false;
    this.newsLabels = {
      bug: "Améliorations",
      new: "Nouveauté",
    };

    this.domifaNews = null;
    this.matomoInjector.init("https://matomo.fabrique.social.gouv.fr/", 17);
  }

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.authService.isAuth().subscribe();

    this.getJSON().subscribe((domifaNews) => {
      this.domifaNews = domifaNews[0];

      const lastNews = localStorage.getItem("news");

      if (
        !lastNews ||
        (lastNews && new Date(lastNews) < new Date(domifaNews[0].date))
      ) {
        this.modal = this.modalService.open(this.newsCenter, {
          backdrop: "static",
        });
      }
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scroll({
        behavior: "smooth",
        left: 0,
        top: 0,
      });
    });

    this.matomoTracker.setUserId("0");
  }

  public getJSON(): Observable<any> {
    return this.http.get("assets/files/news.json");
  }

  public closeModal() {
    this.modal.close();
    localStorage.setItem("news", new Date(this.domifaNews.date).toISOString());
  }
}
