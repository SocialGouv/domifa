import moment = require("moment");
import { DomifaMailTemplateRendering } from "../../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../../mail-generator/services/domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  lien: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "user-account-activated",
    model
  );
}

export const userAccountActivatedEmailRenderer = { renderTemplate };
