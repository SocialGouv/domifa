import { format } from "date-fns";

import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";
import { domifaConfig } from "../../../../../config";
import { AdminBatchsErrorReportModel } from "../../../../../database";

async function renderTemplate(
  model: AdminBatchsErrorReportModel
): Promise<DomifaMailTemplateRendering> {
  return await domifaMailTemplateRenderer.renderTemplate(
    "admin-batchs-error-report",
    {
      ...model,
      lastErrorDate: format(model.lastErrorDate, "yyyy-MM-dd HH:mm"),
      envId: model.envId ? model.envId : domifaConfig().envId,
    }
  );
}

export const adminBatchsErrorReportEmailRenderer = { renderTemplate };
