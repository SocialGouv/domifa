import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  lien: string;
}): Promise<DomifaMailTemplateRendering> {
  return domifaMailTemplateRenderer.renderTemplate(
    "user-account-activated",
    model
  );
}

export const userAccountActivatedEmailRenderer = { renderTemplate };
