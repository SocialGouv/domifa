import { UserStructure } from "@domifa/common";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { guideUtilisateurEmailRenderer } from "./guideUtilisateurEmailRenderer.service";
import { domifaConfig } from "../../../../../config";
import { MessageEmailContent } from "../../../../../database";
const messageEmailId = "user-guide";
export const guideUtilisateurEmailSender = { sendMail };

async function sendMail({
  user,
}: {
  user: Pick<UserStructure, "email" | "nom" | "prenom">;
}): Promise<void> {
  const lienGuide =
    domifaConfig().apps.frontendUrl +
    "assets/files/guide_utilisateur_domifa.pdf";

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
    lienGuide,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await guideUtilisateurEmailRenderer.renderTemplate(
    model
  );
  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
    meta: {
      "lien guide": lienGuide,
    },
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
