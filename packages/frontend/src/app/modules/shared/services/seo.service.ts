import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { MetaTag } from "../types";

@Injectable({
  providedIn: "root",
})
export class SeoService {
  constructor(
    private metaService: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  public updateTitleAndTags(title: string, description: string) {
    // Nettoyage des espaces inutiles
    title = title.replace(/\s\s+/g, " ").trim();
    description = description.replace(/\s\s+/g, " ").trim();

    // Mise à jour du titre
    this.titleService.setTitle(title);

    this.generateMetasTags(title, description);

    // Mise à jour de la balise canonical
    this.createLinkForCanonicalURL();
  }

  public createLinkForCanonicalURL() {
    const link: HTMLLinkElement = this.doc.createElement("link");
    let element: HTMLLinkElement | null =
      this.doc.querySelector(`link[rel='canonical']`) || null;
    if (!element) {
      element = this.doc.createElement("link") as HTMLLinkElement;
      this.doc.head.appendChild(link);
    }
    element.setAttribute("rel", "canonical");
    element.setAttribute("href", this.doc.URL);
  }

  public generateMetasTags(title: string, description: string): void {
    description =
      description.length > 155
        ? description.substring(0, 155) + "..."
        : description;

    const tags: MetaTag[] = [
      { name: "description", content: description },
      { name: "og:title", content: title },
      { name: "twitter:title", content: title },
      { name: "og:description", content: description },
      { name: "twitter:description", content: description },
      { name: "twitter:url", content: this.doc.URL },
      { name: "og:url", content: this.doc.URL },
    ];

    // Mise à jour de tous les tags
    tags.forEach((tag: MetaTag) => {
      this.metaService.updateTag(tag);
    });
  }
}
