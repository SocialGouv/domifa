import {
  getAyantsDroitForStats,
  getDecisionForStats,
} from "./../usagers/services/dataCleanerForStats.service";
import { In, IsNull, MigrationInterface, MoreThan, QueryRunner } from "typeorm";

import { UsagerHistoryStates } from "../_common/model";
import { addYears, endOfDay, format, startOfDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  myDataSource,
  usagerHistoryStatesRepository,
  usagerRepository,
} from "../database";
import { UsagerDecision, UsagerEntretien, UsagerTypeDom } from "@domifa/common";
import {
  TOULOUSE_STRUCTURE_ID,
  TOULOUSE_USER_ID,
  getDateFromXml,
} from "../_common/tmp-toulouse";
import {
  tmpCourriersRepository,
  tmpHistoriqueRepository,
} from "../database/services/interaction/historiqueRepository.service";
import { getEntretienForStats } from "../usagers/services";
import { UsagerHistoryStatesTable } from "../database/entities/usager/UsagerHistoryStatesTable.typeorm";

export class ImportDecisionsMigration1692216772744
  implements MigrationInterface
{
  name = "ImportDecisionsMigration1692216772744";

  public async up(): Promise<void> {
    if ((await tmpHistoriqueRepository.count()) === 0) {
      throw new Error("Chargement des fichiers historique incomplets");
    }

    console.log("Suppression des courriers temporaires non exploitables");
    await tmpCourriersRepository.delete({
      date: IsNull(),
    });
    await tmpCourriersRepository.delete({
      date: MoreThan(20241231),
    });
    await tmpCourriersRepository.delete({
      Date_recup: MoreThan(20241231),
    });

    const queryRunner = myDataSource.createQueryRunner();

    console.log("");
    console.log("Lancement de la migration d'import des decisions");
    console.log("");
    await queryRunner.startTransaction();
    await usagerHistoryStatesRepository.delete({
      structureId: TOULOUSE_STRUCTURE_ID,
    });

    console.log("Réinitialisation des variables de migration");
    await usagerRepository.update(
      { structureId: TOULOUSE_STRUCTURE_ID, migrated: true },
      { migrated: false }
    );
    await queryRunner.commitTransaction();

    console.log(
      await usagerRepository.countMigratedUsagers(TOULOUSE_STRUCTURE_ID)
    );

    const decisions = await tmpHistoriqueRepository.find({
      where: {
        type: In(["creation", "renouv", "cloture", "resiliation"]),
      },
      order: {
        id_domicilie: "ASC",
        date: "ASC",
      },
    });

    const usagersByRef: { [key: string]: UsagerDecision[] } = {};

    for (const decision of decisions) {
      const key = decision.id_domicilie.toString();
      if (typeof usagersByRef[key] === "undefined") {
        usagersByRef[key] = [];
      }

      const dateFin =
        decision.type === "cloture" || decision.type === "resiliation"
          ? getDateFromXml(decision.date)
          : addYears(getDateFromXml(decision.date), 1);

      const newDecision: UsagerDecision = {
        uuid: uuidv4(),
        statut:
          decision.type === "cloture" || decision.type === "resiliation"
            ? "RADIE"
            : "VALIDE",
        userName: "Croix-Rouge Toulouse",
        userId: TOULOUSE_USER_ID,
        dateDebut: getDateFromXml(decision.date),
        dateFin,
        dateDecision: getDateFromXml(decision.date),
        typeDom:
          decision.type === "creation" ? "PREMIERE_DOM" : "RENOUVELLEMENT",
        motif:
          decision.type === "cloture" || decision.type === "resiliation"
            ? "AUTRE"
            : null,
        motifDetails:
          decision.type === "cloture" || decision.type === "resiliation"
            ? "Non renseigné"
            : null,
      };

      usagersByRef[key].push(newDecision);
    }

    let cpt = 0;

    while (
      (await usagerRepository.countMigratedUsagers(TOULOUSE_STRUCTURE_ID)) > 0
    ) {
      const usagers = await usagerRepository.find({
        where: { structureId: TOULOUSE_STRUCTURE_ID, migrated: false },
        take: 500,
        select: [
          "ref",
          "rdv",
          "ayantsDroits",
          "uuid",
          "decision",
          "historique",
          "typeDom",
          "etapeDemande",
          "structureId",
        ],
        order: {
          ref: "ASC",
        },
      });

      console.log(
        `${cpt} décisions / ${Object.keys(usagersByRef).length} - ${format(
          new Date(),
          "HH:mm:ss"
        )}`
      );

      await queryRunner.startTransaction();
      for (const usager of usagers) {
        cpt++;

        const key = usager.ref.toString();

        if (typeof usagersByRef[key] === "undefined") {
          usagersByRef[key] = [];
        }

        usagersByRef[key].push(usager.decision);
        const uniqueCombinations = new Set();

        const uniqueDecision = usagersByRef[key].filter(
          (decision: UsagerDecision) => {
            const dateDebutFormatted = new Date(decision.dateDebut)
              .toISOString()
              .split("T")[0];
            const key = `${decision.statut}_${dateDebutFormatted}`; // Combine statut and dateDebut

            if (uniqueCombinations.has(key)) {
              return false; // Exclure cet élément, car la combinaison est déjà présente
            }
            uniqueCombinations.add(key);
            return true; // Conserver cet élément, car la combinaison est unique
          }
        );

        uniqueDecision.sort((a: UsagerDecision, b: UsagerDecision) => {
          const dateA = endOfDay(new Date(a.dateDebut)).getTime();
          const dateB = endOfDay(new Date(b.dateDebut)).getTime();
          return dateA - dateB;
        });

        const usagerHistory: UsagerHistoryStates[] = [];

        const typeDom: UsagerTypeDom =
          uniqueDecision.filter((decision) => decision.statut === "VALIDE")
            .length > 1 || usager.typeDom === "RENOUVELLEMENT"
            ? "RENOUVELLEMENT"
            : "PREMIERE_DOM";

        for (const decision of uniqueDecision) {
          usager.decision = decision;
          usager.historique.push(decision);

          const isActive = decision.statut === "VALIDE";

          decision.typeDom = typeDom;

          if (usagerHistory.length >= 1) {
            usagerHistory[usagerHistory.length - 1].historyEndDate = startOfDay(
              new Date(decision.dateDebut)
            );
          }

          const state: UsagerHistoryStates = {
            createdAt: startOfDay(new Date(decision.dateDebut)),
            createdEvent: "new-decision",
            isActive,
            structureId: usager.structureId,
            usagerUUID: usager.uuid,
            usagerRef: usager.ref,
            historyBeginDate: startOfDay(new Date(decision.dateDebut)),
            historyEndDate: null,
            decision: getDecisionForStats(decision),
            typeDom,
            etapeDemande: usager.etapeDemande,
            entretien: getEntretienForStats({} as UsagerEntretien),
            ayantsDroits: getAyantsDroitForStats(usager.ayantsDroits),
            rdv: usager.rdv,
            migrated: false,
          };

          usagerHistory.push(new UsagerHistoryStatesTable(state));
        }

        await usagerHistoryStatesRepository.save(usagerHistory);
        await usagerRepository.update(
          {
            uuid: usager.uuid,
          },
          {
            decision: usager.decision,
            historique: usager.historique,
            migrated: true,
            typeDom,
          }
        );
      }
    }

    console.log(
      `${cpt} décisions / ${Object.keys(usagersByRef).length} - ${format(
        new Date(),
        "HH:mm:ss"
      )}`
    );

    await queryRunner.release();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("down");
  }
}
