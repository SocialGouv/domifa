import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(model: {
  prenom: string;
  usager: string;
  date: string;
  heure: string;
  message: string;
  toSkipString?: string;
}): Promise<DomifaMailTemplateRendering> {
  return domifaMailTemplateRenderer.renderTemplate(
    "usager-appointment-created",
    model
  );
}

export const usagerAppointmentCreatedEmailRenderer = { renderTemplate };
