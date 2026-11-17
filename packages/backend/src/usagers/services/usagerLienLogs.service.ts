import { Injectable } from "@nestjs/common";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import {
  buildStructureActorFields,
  buildUsagerFields,
} from "../../modules/app-logs/app-logs.helpers";
import { anonymizeFullName } from "../../util";
import { UsagerForLogs, UserForLogs } from "./usagers-logs.service";
import { LogAction } from "../../modules/app-logs/types";

export type UsagerLienLogTarget = Pick<UsagerForLogs, "ref" | "uuid"> & {
  nom: string;
  prenom: string;
};

// Writes two app_log entries per event (one per dossier) so the
// link/unlink is visible in the history of both dossiers. The context
// carries `acceptedSuggestion` (suggestion accepted vs. manual link) to
// measure the feature's adoption.
@Injectable()
export class UsagerLienLogsService {
  constructor(private readonly appLogsService: AppLogsService) {}

  async logLink(params: {
    currentUsager: UsagerLienLogTarget;
    linkedUsager: UsagerLienLogTarget;
    user: UserForLogs;
    acceptedSuggestion: boolean;
  }): Promise<void> {
    const { currentUsager, linkedUsager, user, acceptedSuggestion } = params;

    await Promise.all([
      this.createLog("USAGERS_LIEN_CREATE", currentUsager, linkedUsager, user, {
        acceptedSuggestion,
      }),
      this.createLog("USAGERS_LIEN_CREATE", linkedUsager, currentUsager, user, {
        acceptedSuggestion,
      }),
    ]);
  }

  async logUnlink(params: {
    currentUsager: UsagerLienLogTarget;
    linkedUsager: UsagerLienLogTarget;
    user: UserForLogs;
  }): Promise<void> {
    const { currentUsager, linkedUsager, user } = params;

    await Promise.all([
      this.createLog("USAGERS_LIEN_DELETE", currentUsager, linkedUsager, user),
      this.createLog("USAGERS_LIEN_DELETE", linkedUsager, currentUsager, user),
    ]);
  }

  private async createLog(
    action: LogAction,
    subject: UsagerLienLogTarget,
    other: UsagerLienLogTarget,
    user: UserForLogs,
    extraContext: Record<string, unknown> = {}
  ): Promise<void> {
    await this.appLogsService.create({
      ...buildStructureActorFields(user),
      ...buildUsagerFields(subject),
      structureId: user.structureId,
      action,
      context: {
        type: "CONJOINT",
        linkedUsagerRef: other.ref,
        linkedUsagerNom: anonymizeFullName(other),
        user: anonymizeFullName(user),
        ...extraContext,
      },
    });
  }
}
