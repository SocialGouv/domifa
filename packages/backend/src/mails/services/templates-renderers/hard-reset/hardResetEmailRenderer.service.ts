import moment = require("moment");
import { DomifaMailTemplateRendering } from "../../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../../mail-generator/services/domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  confirmationCode: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate("hard-reset", model);
}

export const hardResetEmailRenderer = { renderTemplate };
