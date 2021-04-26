import { usagerLightRepository, UsagerTable } from "../../../../database";
import { AppUser } from "../../../../_common/model";
import { usagersCreator } from "../../../services/usagersCreator.service";
import { ImportProcessTracker } from "../ImportProcessTracker.type";
import { UsagersImportUsager } from "../step2-validate-row";
import { usagersImportBuilder } from "./usagersImportBuilder.service";

export const usagersImportCreator = {
  createFromImport,
};

async function createFromImport({
  usagersRows,
  user,
  processTracker,
}: {
  usagersRows: UsagersImportUsager[];
  user: Pick<AppUser, "id" | "structureId" | "prenom" | "nom">;
  processTracker: ImportProcessTracker;
}) {
  const usagers = usagersImportBuilder.buildUsagers({
    usagersRows,
    user,
  });

  let nextRef = await usagersCreator.findNextUsagerRef(user.structureId);
  const usagersToPersist = usagers.map((data) => {
    const usager = new UsagerTable(data);
    usager.ref = nextRef++;
    usagersCreator.setUsagerDefaultAttributes(usager);

    usager.customRef =
      data.customRef && data.customRef.trim()
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
    await (await usagerLightRepository.typeorm()).save(
      usagersToPersist.slice(i, i + 1000)
    );
  }
  processTracker.persist.end = new Date();
  processTracker.persist.duration =
    (processTracker.persist.end.getTime() -
      processTracker.persist.start.getTime()) /
    1000;
}
