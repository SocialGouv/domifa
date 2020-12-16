import moment = require("moment");
import { domifaConfig } from "../../../config";
import { DomifaMailTemplateRendering } from "../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../mail-generator/services/domifaMailTemplateRenderer.service";
import { smtpSender } from "../../../mails/services/smtpSender.service";
import { appLogger } from "../../../util";
import { AdminBatchsErrorReportModel } from "./AdminBatchsErrorReportModel.type";

async function _renderMailTemplate(
  model: AdminBatchsErrorReportModel
): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "admin-batchs-error-report",
    {
      ...model,
      lastErrorDate: moment(model.lastErrorDate).format("yyyy-MM-DD HH:mm"),
      envId: model.envId ? model.envId : domifaConfig().envId,
    }
  );
}

async function sendMail(model: AdminBatchsErrorReportModel): Promise<boolean> {
  if (!domifaConfig().email.emailAddressErrorReport.length) {
    return false;
  }
  appLogger.warn(
    `Sending email report to ${
      domifaConfig().email.emailAddressErrorReport.length
    } addresses`
  );
  const content = await _renderMailTemplate(model);

  return smtpSender.sendEmail({
    ...content,
    from: {
      personalName: "Domifa",
      address: domifaConfig().email.emailAddressFrom,
    },
    replyTo: {
      personalName: "Domifa",
      address: domifaConfig().email.emailAddressAdmin,
    },
    to: domifaConfig().email.emailAddressErrorReport.map((x) => ({
      personalName: x,
      address: x,
    })),
  });
}

export const adminBatchsErrorReportSender = { sendMail, _renderMailTemplate };
