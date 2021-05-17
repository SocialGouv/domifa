import { domifaConfig } from "../../../../config";
import {
  AdminBatchsErrorReportModel,
  MessageEmailContent,
} from "../../../../database";
import { appLogger } from "../../../../util";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { adminBatchsErrorReportEmailRenderer } from "./adminBatchsErrorReportEmailRenderer.service";

const messageEmailId = "admin-batchs-error-report";
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
  const to = domifaConfig().email.emailAddressErrorReport.map((x) => ({
    personalName: x,
    address: x,
  }));
  const recipients = mailRecipientsFilter.filterRecipients(to, {
    logEnabled: false,
  });
  const renderedTemplate =
    await adminBatchsErrorReportEmailRenderer.renderTemplate({
      ...model,
      toSkipString: recipients.toSkipString,
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
