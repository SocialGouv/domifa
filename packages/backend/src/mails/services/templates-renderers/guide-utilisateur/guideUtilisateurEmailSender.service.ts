import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { AppUser } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { guideUtilisateurEmailRenderer } from "./guideUtilisateurEmailRenderer.service";
const messageEmailId = "user-guide";
export const guideUtilisateurEmailSender = { sendMail };

async function sendMail({
  user,
}: {
  user: Pick<AppUser, "email" | "nom" | "prenom">;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lienGuide = frontendUrl + "assets/files/guide_utilisateur_domifa.pdf";

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
    lienGuide,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await guideUtilisateurEmailRenderer.renderTemplate(
    model
  );
  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
