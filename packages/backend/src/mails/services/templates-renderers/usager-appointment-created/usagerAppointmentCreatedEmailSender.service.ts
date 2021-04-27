import moment = require("moment");
import {
  AppUserForAdminEmail,
  MessageEmailContent,
  MessageEmailIcalEvent,
} from "../../../../database";
import { UsagerLight } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { usagerAppointmentCreatedEmailRenderer } from "./usagerAppointmentCreatedEmailRenderer.service";
const messageEmailId = "usager-appointment-created";
export const usagerAppointmentCreatedEmailSender = { sendMail };

async function sendMail({
  user,
  usager,
  icalEvent,
  message,
}: {
  user: AppUserForAdminEmail;
  usager: UsagerLight;
  icalEvent: MessageEmailIcalEvent;
  message: string;
}): Promise<void> {
  const prenomUsager =
    (usager.sexe === "homme" ? "M. " : "Mme. ") +
    usager.nom +
    " " +
    usager.prenom;

  const date = moment(new Date(usager.rdv.dateRdv)).locale("fr").format("L");
  const heure = moment(new Date(usager.rdv.dateRdv)).locale("fr").format("LT");
  const to = [
    {
      address: user.email,
      personalName: user.prenom + " " + user.nom,
    },
  ];
  const recipients = mailRecipientsFilter.filterRecipients(to, {
    logEnabled: false,
  });
  const model = {
    prenom: user.prenom,
    usager: prenomUsager,
    date,
    heure,
    message,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await usagerAppointmentCreatedEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: to,
    icalEvent,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
