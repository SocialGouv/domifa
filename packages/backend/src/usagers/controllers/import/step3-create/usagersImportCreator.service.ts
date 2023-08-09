import { ImportProcessTracker } from "../ImportProcessTracker.type";
import { UsagersImportUsager } from "../step2-validate-row";
import { usagersImportBuilder } from "./usagersImportBuilder.service";
import { v4 as uuidv4 } from "uuid";
import {
  UsagerTable,
  usagerRepository,
  usagerEntretienRepository,
  usagerHistoryRepository,
  UsagerEntretienTable,
} from "../../../../database";
import { UserStructure } from "../../../../_common/model";
import { usagersCreator, usagerHistoryStateManager } from "../../../services";

export const usagersImportCreator = {
  createFromImport,
};

async function createFromImport({
  usagersRows,
  user,
  processTracker,
}: {
  usagersRows: UsagersImportUsager[];
  user: Pick<UserStructure, "id" | "structureId" | "prenom" | "nom">;
  processTracker: ImportProcessTracker;
}) {
  const usagers = usagersImportBuilder.buildUsagers({
    usagersRows,
    user,
  });

  let nextRef = await usagersCreator.findNextUsagerRef(user.structureId);
  const usagersToPersist = usagers.map((data) => {
    const usager = new UsagerTable({
      ...data,
      uuid: uuidv4(), // generate manually to use reference in history table
    });
    usager.ref = nextRef++;
    usagersCreator.setUsagerDefaultAttributes(usager);

    usager.customRef = data?.customRef
      ? data.customRef.trim()
      : `${usager.ref}`;
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

    const nextUsagersHistoryToCreate = nextUsagersToCreate.map((usager) =>
      usagerHistoryStateManager.buildInitialHistoryState({
        isImport: true,
        usager,
        createdAt: usager.decision.dateDecision,
        createdEvent: "new-decision",
        historyBeginDate: usager.decision.dateDebut,
      })
    );

    await (await usagerRepository.typeorm()).save(nextUsagersToCreate);

    await usagerEntretienRepository.save(nextEntretienToSave);

    await usagerHistoryRepository.save(nextUsagersHistoryToCreate);
  }
  processTracker.persist.end = new Date();
  processTracker.persist.duration =
    (processTracker.persist.end.getTime() -
      processTracker.persist.start.getTime()) /
    1000;
}
