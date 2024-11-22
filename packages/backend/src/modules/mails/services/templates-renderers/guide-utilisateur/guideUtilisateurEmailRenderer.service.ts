import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  lienGuide: string;
  toSkipString?: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "guide-utilisateur",
    model
  );
}

export const guideUtilisateurEmailRenderer = { renderTemplate };
