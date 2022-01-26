import moment = require("moment");
import { domifaConfig } from "../../../../config";
import { AdminBatchsErrorReportModel } from "../../../../database";
import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

async function renderTemplate(
  model: AdminBatchsErrorReportModel
): Promise<DomifaMailTemplateRendering> {
  return domifaMailTemplateRenderer.renderTemplate(
    "admin-batchs-error-report",
    {
      ...model,
      lastErrorDate: moment(model.lastErrorDate).format("yyyy-MM-DD HH:mm"),
      envId: model.envId ? model.envId : domifaConfig().envId,
    }
  );
}

export const adminBatchsErrorReportEmailRenderer = { renderTemplate };
