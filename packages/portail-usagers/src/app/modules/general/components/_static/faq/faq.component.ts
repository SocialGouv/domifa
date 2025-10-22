import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { DsfrMenu, DsfrSidemenuModule } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [RouterModule, CommonModule, DsfrSidemenuModule],
  templateUrl: "./faq.component.html",
})
export class FaqComponent {
  public sideMenu: DsfrMenu = {
    title: "Dans cette rubrique",
    items: [
      {
        label: "Menu 1",
        routerLink: "menu1",
        subItems: [
          {
            label: "Sub item 1-1",
            routerLink: "menu1/subitem1-1",
            routerLinkActiveOptions: { exact: true },
          },
          { label: "Sub item 1-2", routerLink: "menu1/subitem1-2" },
        ],
      },
      {
        label: "Menu 2",
        routerLink: "menu2",
        subItems: [
          { label: "Sub item 2-1", routerLink: "menu2/subitem2-1" },
          { label: "Sub item 2-2", route: "menu2 (action programmatique)" },
          {
            label: "Sub item 2-2 - external link",
            link: "page",
            linkTarget: "_blank",
          },
        ],
      },
    ],
  };
}
