import { Injectable } from "@nestjs/common";
import { createEvent, ReturnObject } from "ics";
import { format } from "date-fns";
import { getPersonFullName, Usager } from "@domifa/common";
import { domifaConfig } from "../../config";
import { BrevoSenderService } from "../../modules/mails/services/brevo-sender/brevo-sender.service";
import { UserStructureAuthenticated } from "../../_common/model";

export interface AppointmentInvitationData {
  user: Pick<
    UserStructureAuthenticated,
    "id" | "prenom" | "nom" | "email" | "structure"
  >;
  usager: Usager;
  dateRdv: Date;
  assignedByUser?: UserStructureAuthenticated;
}

@Injectable()
export class AppointmentInvitationService {
  constructor(private readonly brevoSenderService: BrevoSenderService) {}

  async sendAppointmentInvitation(
    data: AppointmentInvitationData
  ): Promise<void> {
    const invitationContent = this.generateIcsContent(data);
    const icalBase64 = Buffer.from(invitationContent).toString("base64");
    const formattedData = this.formatAppointmentData(data);
    const message = this.buildAssignmentMessage(data);

    await this.brevoSenderService.sendEmailWithTemplate({
      templateId: domifaConfig().brevo.templates.userStructureAppointment,
      subject: "Rendez-vous confirmé",
      to: [
        {
          email: data.user.email,
          name: `${data.user.prenom} ${data.user.nom}`,
        },
      ],
      params: {
        prenom: data.user.prenom,
        usager: formattedData.usagerName,
        date: formattedData.date,
        heure: formattedData.heure,
        message,
      },
      attachmentContent: icalBase64,
      attachmentName: "rendez-vous-domifa.ics",
    });
  }
  private generateEventUid(data: AppointmentInvitationData): string {
    const dateStr = format(data.dateRdv, "yyyy-MM-dd");
    return `${data.usager.ref}-${dateStr}@domifa.local`;
  }
  private generateIcsContent(data: AppointmentInvitationData): string {
    const title = `Entretien avec ${getPersonFullName(data.usager)}`;
    const dateRdv = data.dateRdv;
    const usagerName = getPersonFullName(data.usager);

    // UID déterministe basé sur usager.ref et la date
    const uid = this.generateEventUid(data);

    const invitation: ReturnObject = createEvent({
      uid,
      productId: `-//${data.user.structure?.nom || "DomiFa"}//DomiFa//FR`,
      sequence: 0,
      title,
      description: `Entretien demande de domiciliation - ${usagerName}`,
      start: [
        dateRdv.getFullYear(),
        dateRdv.getMonth() + 1,
        dateRdv.getDate(),
        dateRdv.getHours(),
        dateRdv.getMinutes(),
      ],
      organizer: {
        name: `${data.user.prenom} ${data.user.nom}`,
        email: data.user.email,
      },
      attendees: [
        {
          name: `${data.user.prenom} ${data.user.nom}`,
          email: data.user.email,
          partstat: "ACCEPTED",
          role: "REQ-PARTICIPANT",
          rsvp: true,
        },
      ],
      startInputType: "local",
      duration: { minutes: 30 },
      categories: ["Entretien", "Domiciliation"],
      status: "CONFIRMED",
      busyStatus: "BUSY",
    });

    if (!invitation.value) {
      throw new Error("Failed to generate ICS content");
    }

    return invitation.value;
  }

  private formatAppointmentData(data: AppointmentInvitationData): {
    usagerName: string;
    date: string;
    heure: string;
  } {
    const dateRdv = new Date(data.usager.rdv.dateRdv);

    return {
      usagerName: getPersonFullName(data.usager),
      date: format(dateRdv, "dd/MM/yyyy"),
      heure: format(dateRdv, "HH:mm"),
    };
  }

  private buildAssignmentMessage(data: AppointmentInvitationData): string {
    if (!data.assignedByUser || data.assignedByUser.id === data.user.id) {
      return "";
    }

    return `Il vous a été assigné par ${data.assignedByUser.prenom} ${data.assignedByUser.nom}`;
  }
}
