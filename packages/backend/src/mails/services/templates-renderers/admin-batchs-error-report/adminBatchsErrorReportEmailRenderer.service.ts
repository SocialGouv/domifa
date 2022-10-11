import { format } from "date-fns";

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
      lastErrorDate: format(model.lastErrorDate, "yyyy-MM-dd HH:mm"),
      envId: model.envId ? model.envId : domifaConfig().envId,
    }
  );
}

export const adminBatchsErrorReportEmailRenderer = { renderTemplate };
