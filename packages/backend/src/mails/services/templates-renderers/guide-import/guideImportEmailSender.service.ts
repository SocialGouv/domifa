import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { UserStructure } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { guideImportEmailRenderer } from "./guideImportEmailRenderer.service";
const messageEmailId = "import-guide";
export const guideImportEmailSender = { sendMail };

async function sendMail({
  user,
}: {
  user: Pick<UserStructure, "email" | "nom" | "prenom">;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lienImport = frontendUrl + "import";
  const lienFaq = frontendUrl + "faq";
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
    lienImport,
    lienGuide,
    lienFaq,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await guideImportEmailRenderer.renderTemplate(model);

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
