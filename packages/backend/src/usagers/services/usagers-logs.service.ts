import { Injectable } from "@nestjs/common";
import { AppLogsService } from "../../modules/app-logs/app-logs.service";
import { LogAction, UserStructureAuthenticated } from "../../_common/model";
import { Telephone, Usager } from "@domifa/common";
import isEqual from "lodash.isequal";

export type UsagerForLogs = Pick<
  Usager,
  "ref" | "structureId" | "telephone" | "email"
>;

export type UserForLogs = Pick<
  UserStructureAuthenticated,
  "structureId" | "nom" | "id" | "prenom"
>;

@Injectable()
export class UsagersLogsService {
  constructor(private readonly appLogsService: AppLogsService) {}

  async checkAndLogEmailChanges(
    usager: UsagerForLogs,
    user: UserForLogs,
    oldEmail?: string,
    newEmail?: string
  ): Promise<void> {
    if (oldEmail && !newEmail) {
      await this.createLog(
        "USAGERS_EMAIL_DELETE",
        {
          oldEmail: this.anonymizeText(oldEmail),
          newEmail: null,
        },
        usager,
        user
      );
      return;
    }

    if (oldEmail !== newEmail && newEmail) {
      await this.createLog(
        "USAGERS_EMAIL_UPDATE",
        {
          oldEmail: oldEmail ? this.anonymizeText(oldEmail) : null,
          newEmail: this.anonymizeText(newEmail),
        },
        usager,
        user
      );
    }
  }

  async checkAndLogPhoneChanges(
    usager: UsagerForLogs,
    user: UserForLogs,
    oldPhone?: Telephone,
    newPhone?: Telephone
  ): Promise<void> {
    if (oldPhone?.numero && !newPhone?.numero) {
      await this.createLog(
        "USAGERS_PHONE_DELETE",
        {
          oldPhone: this.anonymizeText(oldPhone.numero),
          newPhone: null,
        },
        usager,
        user
      );
      return;
    }

    if (!isEqual(oldPhone, newPhone) && newPhone?.numero) {
      await this.createLog(
        "USAGERS_PHONE_UPDATE",
        {
          oldPhone: oldPhone?.numero
            ? this.anonymizeText(oldPhone.numero)
            : null,
          newPhone: this.anonymizeText(newPhone.numero),
        },
        usager,
        user
      );
    }
  }

  private async createLog(
    action: LogAction,
    context: any,
    usager: UsagerForLogs,
    user: UserForLogs
  ): Promise<void> {
    await this.appLogsService.create({
      userId: user.id,
      usagerRef: usager.ref,
      structureId: user.structureId,
      action,
      context: {
        ...context,
        user: this.anonymizeText(user.nom + " " + user.prenom),
      },
    });
  }

  private anonymizeText(text: string): string {
    return text;
  }
}
