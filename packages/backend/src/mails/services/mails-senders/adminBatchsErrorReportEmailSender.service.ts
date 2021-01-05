import { domifaConfig } from "../../../config";
import {
  AdminBatchsErrorReportModel,
  MessageEmailContent,
} from "../../../database";
import { appLogger } from "../../../util";
import { adminBatchsErrorReportEmailRenderer } from "../templates-renderers";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../_core";

export const adminBatchsErrorReportEmailSender = { sendMail };

async function sendMail(model: AdminBatchsErrorReportModel): Promise<void> {
  if (!domifaConfig().email.emailAddressErrorReport.length) {
    return;
  }
  appLogger.warn(
    `Sending email report to ${
      domifaConfig().email.emailAddressErrorReport.length
    } addresses`
  );
  const renderedTemplate = await adminBatchsErrorReportEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: domifaConfig().email.emailAddressErrorReport.map((x) => ({
      personalName: x,
      address: x,
    })),
  };

  messageEmailSender.sendMessageLater(messageContent, {
    emailId: "admin-batchs-error-report",
  });
}
