import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";


@Component({
  selector: 'app-plan-site',
  templateUrl: './plan-site.component.html',
  styleUrls: ['./plan-site.component.css']
})

export class PlanSiteComponent implements OnInit {
  sitemapLinks = [
    { label: 'Accueil' , path: '/'},
    { label: 'Nos statistiques' , path: '/stats'},
    { label: 'Contacter l\'équipe de Domifa' , path: '/contact'},
    { label: 'FAQ' , path: '/faq'},
    { label: 'Mention légales' , path: '/mentions-legales'},
    { label: 'CGU' , path: '/cgu'},
    { label: 'Nouveautés' , path: '/news'},
    { label: 'Contactez-nous' , path: '/contact'},
  ];
  partnerLinks = [
    { label: 'La fabrique numérique' , path: 'https://www.fabrique.social.gouv.fr/'},
    { label: 'Beta.gouv.fr' , path: 'https://beta.gouv.fr/'},
    { label: 'France relance' , path: 'https://www.gouvernement.fr/les-priorites/france-relance'},
    { label: 'Dihal' , path: 'https://www.gouvernement.fr/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement'},
    { label: 'Ministère des solidarités et de la santé' , path: 'https://www.gouvernement.fr/le-ministere-des-solidarites-et-de-la-sante'},
    { label: 'UNCCAS' , path: 'https://www.unccas.org/'},
  ]
  constructor(
    private titleService: Title,
    ) {}

  
  public ngOnInit(): void {
    this.titleService.setTitle("Plan de site de Domifa");
  }

}



