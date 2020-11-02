import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { Observable } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { environment } from '../environments/environment';
import { User } from "./modules/users/interfaces/user";
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

  public modal: any;
  public matomoInfo: boolean;

  public me: User;

  @ViewChild("newsCenter", { static: true })
  public newsCenter!: TemplateRef<any>;

  constructor(
    public authService: AuthService,
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

    this.authService.currentUser.subscribe((user: User) => {
      this.me = user;
    });
  }

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );

    this.authService.currentUser.subscribe((user: User) => {
      this.me = user;
    });

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

    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";

    this.matomo.setUserId("0");
  }

  public getJSON(): Observable<any> {
    return this.http.get("assets/files/news.json");
  }

  public openModal(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
  }

  public closeModal() {
    this.modal.close();
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
