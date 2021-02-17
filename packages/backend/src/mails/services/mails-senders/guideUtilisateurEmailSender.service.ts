import moment = require("moment");
import { domifaConfig } from "../../../config";
import { MessageEmailContent } from "../../../database";
import { AppUser } from "../../../_common/model";
import { guideUtilisateurEmailRenderer } from "../templates-renderers";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../_core";

export const guideUtilisateurEmailSender = { sendMail };

async function sendMail({
  user,
}: {
  user: Pick<AppUser, "email" | "nom" | "prenom">;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lienGuide = frontendUrl + "assets/files/guide_utilisateur_domifa.pdf";
  const model = {
    prenom: user.prenom,
    lienGuide,
  };

  const renderedTemplate = await guideUtilisateurEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: [
      {
        address: user.email,
        personalName: user.prenom + " " + user.nom,
      },
    ],
  };

  messageEmailSender.sendMessageLater(messageContent, {
    emailId: "user-guide",
  });
}
