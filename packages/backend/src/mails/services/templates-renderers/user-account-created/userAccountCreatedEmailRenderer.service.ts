import moment = require("moment");
import { DomifaMailTemplateRendering } from "../../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../../mail-generator/services/domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  admin_prenom: string;
  user_email: string;
  user_nom: string;
  user_prenom: string;
  lien: string;
  toSkipString?: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "user-account-created",
    model
  );
}

export const userAccountCreatedEmailRenderer = { renderTemplate };
