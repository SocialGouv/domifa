import { ContactSupport } from "../../../../../_common/model";
import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(
  model: Partial<ContactSupport>
): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "contact-support",
    model
  );
}

export const contactSupportEmailRenderer = { renderTemplate };
