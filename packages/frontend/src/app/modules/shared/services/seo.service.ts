import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { environment } from "../../../../environments/environment";
import { MetaTag } from "../types";

@Injectable({
  providedIn: "root",
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  public updateTitleAndTags(
    title: string,
    description: string,
    follow = false
  ) {
    // Nettoyage des espaces inutiles
    title = title.replace(/\s\s+/g, " ").trim();
    description = description.replace(/\s\s+/g, " ").trim();

    // Mise à jour du titre
    this.title.setTitle(title);

    this.generateMetasTags(title, description, follow);

    // Mise à jour de la balise canonical
    this.createLinkForCanonicalURL();
  }

  public createLinkForCanonicalURL() {
    const link: HTMLLinkElement = this.doc.createElement("link");
    link.setAttribute("rel", "canonical");
    this.doc.head.appendChild(link);
    link.setAttribute("href", this.doc.URL);
  }

  public generateMetasTags(
    title: string,
    description: string,
    follow = true
  ): void {
    description =
      description.length > 155
        ? description.substring(0, 155) + "..."
        : description;

    const robots =
      follow && environment.production
        ? { name: "robots", content: "index, follow" }
        : { name: "robots", content: "noindex, nofollow" };

    const tags: MetaTag[] = [
      { name: "description", content: description },
      { name: "og:title", content: title },
      { name: "twitter:title", content: title },
      { name: "og:description", content: description },
      { name: "twitter:description", content: description },
      { name: "twitter:url", content: this.doc.URL },
      { name: "og:url", content: this.doc.URL },
      robots,
    ];

    // Mise à jour de tous les tags
    tags.forEach((tag: MetaTag) => {
      this.meta.updateTag(tag);
    });
  }
}
