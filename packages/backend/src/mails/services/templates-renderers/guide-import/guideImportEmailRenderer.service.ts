import { DomifaMailTemplateRendering } from "../../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../../mail-generator/services/domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  lienImport: string;
  lienGuide: string;
  lienFaq: string;
}): Promise<DomifaMailTemplateRendering> {
  return domifaMailTemplateRenderer.renderTemplate("guide-import", model);
}

export const guideImportEmailRenderer = { renderTemplate };
