// login-dropdown.component.ts
import { Component, Input, OnInit } from "@angular/core";
import { DsfrLink } from "@edugouvfr/ngx-dsfr";

import { AuthService } from "../../../../../shared/services";
import { UserStructure } from "@domifa/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-login-dropdown",
  templateUrl: "./login-dropdown.component.html",
})
export class LoginDropdownComponent implements OnInit {
  @Input() me: UserStructure | null = null;

  public dsfrLinks: DsfrLink[] = [];
  public loginLinks: DsfrLink[] = [];
  public userName = "";

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.buildLoginLinks();
    if (this.me) {
      this.buildUserLinks();
      this.userName = `${this.me.nom} ${this.me.prenom}`;
    }
  }

  private buildLoginLinks(): void {
    this.loginLinks = [
      {
        label: "CCAS, organismes agréés",
        routerLink: "/connexion",
        icon: "fr-icon-home-4-line",
      },
      {
        label: "Domiciliés",
        link: "https://mon-domifa.fabrique.social.gouv.fr/",
        target: "_blank",
        icon: "fr-icon-mail-line",
      },
      {
        label: "DGCS",
        link: "https://admin.fabrique.social.gouv.fr/",
        target: "_blank",
        icon: "fr-icon-building-line",
      },
    ];

    console.log(this.loginLinks);
  }

  private buildUserLinks(): void {
    this.dsfrLinks = [
      {
        label: "Nouveautés",
        routerLink: "/news",
        icon: "fr-icon-newspaper-line",
      },
      {
        label: "Gérer mon compte",
        routerLink: "/users/mon-compte",
        icon: "fr-icon-admin-line",
      },
    ];

    if (this.isAdminOrResponsable) {
      this.dsfrLinks.push(
        {
          label: "Gérer les utilisateurs",
          routerLink: "/users/comptes",
          icon: "fr-icon-group-line",
        },
        {
          label: "Informations de la structure",
          routerLink: "/structures/edit",
          icon: "fr-icon-community-line",
        },
        {
          label: "Documents de la structure",
          routerLink: "/structures/documents",
          icon: "fr-icon-file-line",
        }
      );

      if (this.isSmsEnabled) {
        this.dsfrLinks.push({
          label: "Gérer l'envoi de SMS",
          routerLink: "/structures/sms",
          icon: "fr-icon-smartphone-line",
        });
      }
    }

    this.dsfrLinks.push(
      {
        label: "Gérer le portail domicilié",
        routerLink: "/structures/portail-usager",
        icon: "fr-icon-computer-line",
      },
      {
        label: "Consulter les statistiques",
        routerLink: "/structure-stats",
        icon: "fr-icon-bar-chart-box-line",
      },
      {
        label: "Importer des domiciliés",
        routerLink: "/import",
        icon: "fr-icon-upload-line",
      }
    );
  }

  onLinkSelect(link: DsfrLink): void {
    if (link.route) {
      this.router.navigate([link.route]);
    }
  }

  logoutSelect(): void {
    this.authService.logout();
  }

  get userEmail(): string {
    return this.me?.email ?? "";
  }

  get isAdminOrResponsable(): boolean {
    return this.me ? ["admin", "responsable"].includes(this.me.role) : false;
  }

  get isSmsEnabled(): boolean {
    return this.me?.structure?.sms?.enabledByDomifa ?? false;
  }
}
