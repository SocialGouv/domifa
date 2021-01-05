import moment = require("moment");
import { DomifaMailTemplateRendering } from "../../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../../mail-generator/services/domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  usager: string;
  date: string;
  heure: string;
  message: string;
}): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "usager-appointment-created",
    model
  );
}

export const usagerAppointmentCreatedEmailRenderer = { renderTemplate };
