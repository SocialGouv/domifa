import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  lien: string;
  toSkipString?: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "user-account-created-by-admin",
    model
  );
}

export const userAccountCreatedByAdminEmailRenderer = { renderTemplate };
