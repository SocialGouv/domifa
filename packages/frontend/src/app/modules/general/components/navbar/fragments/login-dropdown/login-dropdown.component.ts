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
  @Input({ required: true }) me: UserStructure | null = null;

  public dsfrLinks: DsfrLink[] = [];
  public userName = "";
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.buildLinks();
    this.userName = this.me ? `${this.me.nom} ${this.me.prenom}` : "";
  }

  private buildLinks(): void {
    this.dsfrLinks = [
      {
        label: "Nouveautés",
        route: "/news",
        icon: "fr-icon-newspaper-line",
      },
      {
        label: "Gérer mon compte",
        route: "/users/mon-compte",
        icon: "fr-icon-admin-line",
      },
    ];

    if (this.isAdminOrResponsable) {
      this.dsfrLinks.push(
        {
          label: "Gérer les utilisateurs",
          route: "/users/comptes",
          icon: "fr-icon-group-line",
        },
        {
          label: "Informations de la structure",
          route: "/structures/edit",
          icon: "fr-icon-community-line",
        },
        {
          label: "Documents de la structure",
          route: "/structures/documents",
          icon: "fr-icon-file-line",
        }
      );

      if (this.isSmsEnabled) {
        this.dsfrLinks.push({
          label: "Gérer l'envoi de SMS",
          route: "/structures/sms",
          icon: "fr-icon-smartphone-line",
        });
      }
    }

    this.dsfrLinks.push(
      {
        label: "Gérer le portail domicilié",
        route: "/structures/portail-usager",
        icon: "fr-icon-computer-line",
      },
      {
        label: "Consulter les statistiques",
        route: "/structure-stats",
        icon: "fr-icon-bar-chart-box-line",
      },
      {
        label: "Importer des domiciliés",
        route: "/import",
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
