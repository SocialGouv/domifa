import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  confirmationCode: string;
  toSkipString?: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate("hard-reset", model);
}

export const hardResetEmailRenderer = { renderTemplate };
