import { AppLogsService } from "./../../../../modules/app-logs/app-logs.service";
import { ImportProcessTracker } from "../ImportProcessTracker.type";
import { UsagersImportUsager } from "../step2-validate-row";
import { usagersImportBuilder } from "./usagersImportBuilder.service";
import { v4 as uuidv4 } from "uuid";
import {
  UsagerTable,
  usagerRepository,
  usagerEntretienRepository,
  UsagerEntretienTable,
  usagerHistoryStatesRepository,
} from "../../../../database";

import { UsagerHistoryStateService, usagersCreator } from "../../../services";

import { Injectable } from "@nestjs/common";
import { UserStructure } from "@domifa/common";
import { SuccessfulUsagerImportLogContext } from "../../../../modules/app-logs/types/app-log-context.types";

@Injectable()
export class ImportCreatorService {
  constructor(
    private readonly usagerHistoryStateService: UsagerHistoryStateService,
    private readonly appLogsService: AppLogsService
  ) {}

  public async createFromImport({
    usagersRows,
    user,
    processTracker,
  }: {
    usagersRows: UsagersImportUsager[];
    user: Pick<UserStructure, "id" | "structureId" | "prenom" | "nom" | "role">;
    processTracker: ImportProcessTracker;
  }) {
    const usagers = usagersImportBuilder.buildUsagers({
      usagersRows,
      user,
    });
    const nombreUsagersActifs = usagers.filter(
      (usager) => usager.statut === "VALIDE"
    ).length;

    await this.appLogsService.create<SuccessfulUsagerImportLogContext>({
      action: "IMPORT_USAGERS_SUCCESS",
      userId: user.id,
      structureId: user.structureId,
      role: user.role,
      context: {
        nombreActifs: nombreUsagersActifs,
        nombreTotal: usagers.length,
      },
    });

    let nextRef = await usagersCreator.findNextUsagerRef(user.structureId);
    const usagersToPersist = usagers.map((data) => {
      usagersCreator.setUsagerDefaultAttributes(data);
      data.ref = nextRef++;
      data.customRef = data?.customRef ? data.customRef.trim() : `${data.ref}`;

      const usager = new UsagerTable({
        ...data,
        uuid: uuidv4(), // generate manually to use reference in history table
      });

      return usager;
    });

    processTracker.build.end = new Date();
    processTracker.build.duration =
      (processTracker.build.end.getTime() -
        processTracker.build.start.getTime()) /
      1000;
    processTracker.persist = {
      start: new Date(),
    };

    for (let i = 0; i < usagersToPersist.length; i += 1000) {
      const nextUsagersToCreate = usagersToPersist.slice(i, i + 1000);
      const nextEntretienToSave = nextUsagersToCreate.map((usager) => {
        return new UsagerEntretienTable({
          ...usager.entretien,
          usagerRef: usager.ref,
          usagerUUID: usager.uuid,
          structureId: usager.structureId,
        });
      });

      await usagerRepository.save(nextUsagersToCreate);
      await usagerEntretienRepository.save(nextEntretienToSave);

      const historiesToSave = nextUsagersToCreate.map((usager) => {
        return this.usagerHistoryStateService.createState({
          usager,
          createdAt: usager.decision.dateDecision,
          createdEvent: "new-decision",
          historyBeginDate: usager.decision.dateDebut,
          isActive: usager.decision.statut === "VALIDE",
        });
      });

      await usagerHistoryStatesRepository.save(historiesToSave);
    }

    processTracker.persist.end = new Date();
    processTracker.persist.duration =
      (processTracker.persist.end.getTime() -
        processTracker.persist.start.getTime()) /
      1000;
  }
}
