import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { Observable } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { environment } from "../environments/environment";
import { AppUser } from "../_common/model";
import { fadeInOut } from "./shared/animations";
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

  public matomoInfo: boolean;

  public me: AppUser;

  @ViewChild("newsCenter", { static: true })
  public newsCenter!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private matomoInjector: MatomoInjector,
    private matomo: MatomoTracker,
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
    this.matomoInjector.init(environment.matomo.url, environment.matomo.siteId);
  }

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.authService.currentUserSubject.subscribe((user: any) => {
      this.me = user;
    });

    this.getJSON().subscribe((domifaNews) => {
      this.domifaNews = domifaNews[0];

      const lastNews = localStorage.getItem("news");

      if (
        !lastNews ||
        (lastNews && new Date(lastNews) < new Date(domifaNews[0].date))
      ) {
        this.modalService.open(this.newsCenter, {
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

    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";

    this.matomo.setUserId("0");
  }

  public getJSON(): Observable<any> {
    return this.http.get("assets/files/news.json");
  }

  public openModal(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeHelpModal() {
    this.modalService.dismissAll();
  }

  public closeNewsModal() {
    this.modalService.dismissAll();
    localStorage.setItem("news", new Date(this.domifaNews.date).toISOString());
  }

  public closeMatomo() {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(["/connexion"]);
  }
}
