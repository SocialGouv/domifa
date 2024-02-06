import { In, IsNull, MigrationInterface, MoreThan, QueryRunner } from "typeorm";

import { UsagerHistory, UsagerHistoryState } from "../_common/model";
import { addYears, endOfDay, format, startOfDay, subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  UsagerHistoryTable,
  myDataSource,
  usagerHistoryRepository,
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
    await usagerHistoryRepository.delete({
      structureId: TOULOUSE_STRUCTURE_ID,
    });

    console.log("Réinitialisation des variables de migration");
    await usagerRepository.update(
      { structureId: TOULOUSE_STRUCTURE_ID },
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
        ],
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

        const usagerHistory: UsagerHistory = new UsagerHistoryTable({
          usagerUUID: usager.uuid,
          usagerRef: usager.ref,
          structureId: TOULOUSE_STRUCTURE_ID,
          import: null,
          states: [],
        });

        const typeDom: UsagerTypeDom =
          uniqueDecision.filter((decision) => decision.statut === "VALIDE")
            .length > 1 || usager.typeDom === "RENOUVELLEMENT"
            ? "RENOUVELLEMENT"
            : "PREMIERE_DOM";

        for (const decision of uniqueDecision) {
          usager.decision = decision;
          usager.historique.push(decision);

          const previousState = usagerHistory?.states.length
            ? usagerHistory.states[usagerHistory.states.length - 1]
            : undefined;

          const isActive =
            decision.statut === "VALIDE" ||
            ((decision.statut === "ATTENTE_DECISION" ||
              decision.statut === "INSTRUCTION") &&
              (previousState?.isActive ?? false));

          decision.typeDom = typeDom;
          const state: UsagerHistoryState = {
            uuid: uuidv4(),
            createdAt: startOfDay(new Date(decision.dateDebut)),
            createdEvent: "new-decision",
            isActive,
            historyBeginDate: startOfDay(new Date(decision.dateDebut)),
            historyEndDate: undefined,
            decision,
            typeDom,
            etapeDemande: usager.etapeDemande,
            entretien: {
              domiciliation: null,
              typeMenage: null,
              revenus: null,
              orientation: null,
              liencommune: null,
              residence: null,
              cause: null,
              rattachement: null,
              raison: null,
              accompagnement: null,
              accompagnementDetail: null,
            } as UsagerEntretien,
            ayantsDroits: [...usager.ayantsDroits],
            rdv: usager.rdv,
          };

          usagerHistory.states = [
            ...usagerHistory.states.map((s, i) => {
              if (i === usagerHistory.states.length - 1) {
                // finish previous history state
                s.historyEndDate = endOfDay(
                  subDays(new Date(state.historyBeginDate), 1)
                );
              }
              return s;
            }),
            state,
          ];
        }

        await usagerHistoryRepository.save(usagerHistory);
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
