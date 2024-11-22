import { format } from "date-fns";

import {
  AppUserForAdminEmail,
  MessageEmailContent,
  MessageEmailIcalEvent,
} from "../../../../../database";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { usagerAppointmentCreatedEmailRenderer } from "./usagerAppointmentCreatedEmailRenderer.service";
import { getUsagerNomComplet, Usager } from "@domifa/common";
const messageEmailId = "usager-appointment-created";
export const usagerAppointmentCreatedEmailSender = { sendMail };

async function sendMail({
  user,
  usager,
  icalEvent,
  message,
}: {
  user: AppUserForAdminEmail;
  usager: Usager;
  icalEvent: MessageEmailIcalEvent;
  message: string;
}): Promise<void> {
  const date = format(new Date(usager.rdv.dateRdv), "dd/MM/yyyy");
  const heure = format(new Date(usager.rdv.dateRdv), "HH:mm");
  const to = [
    {
      address: user.email,
      personalName: `${user.prenom} ${user.nom}`,
    },
  ];
  const recipients = mailRecipientsFilter.filterRecipients(to, {
    logEnabled: false,
  });
  const model = {
    prenom: user.prenom,
    usager: getUsagerNomComplet(usager),
    date,
    heure,
    message,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate =
    await usagerAppointmentCreatedEmailRenderer.renderTemplate(model);

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
    icalEvent,
  };

  await messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
