import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  lienImport: string;
  lienGuide: string;
  lienFaq: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate("guide-import", model);
}

export const guideImportEmailRenderer = { renderTemplate };
