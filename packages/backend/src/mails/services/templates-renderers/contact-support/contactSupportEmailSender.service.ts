import { ContactSupport } from "../../../../_common/model/contact-support/ContactSupport.type";
import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { appLogger } from "../../../../util";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../../_core";
import { contactSupportEmailRenderer } from "./contactSupportEmailRenderer.service";

const messageEmailId = "contact-support";
export const contactSupportEmailSender = { sendMail };

async function sendMail(model: ContactSupport): Promise<void> {
  if (!domifaConfig().email.emailAddressErrorReport.length) {
    return;
  }
  appLogger.warn(
    `Sending email report to ${
      domifaConfig().email.emailAddressErrorReport.length
    } addresses`
  );

  const to = [
    {
      address: domifaConfig().email.emailAddressAdmin,
      personalName: "Domifa",
    },
  ];

  const renderedTemplate = await contactSupportEmailRenderer.renderTemplate({
    ...model,
  });

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
