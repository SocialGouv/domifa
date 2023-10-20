import { In, MigrationInterface, QueryRunner } from "typeorm";

import {
  Usager,
  UsagerDecision,
  UsagerHistory,
  UsagerHistoryState,
} from "../_common/model";
import { addYears, endOfDay, format, startOfDay, subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  UsagerHistoryTable,
  UsagerTable,
  myDataSource,
  usagerHistoryRepository,
  usagerRepository,
} from "../database";
import { UsagerEntretien } from "@domifa/common";
import { TOULOUSE_STRUCTURE_ID, getDateFromXml } from "../_common/tmp-toulouse";
import { tmpHistoriqueRepository } from "../database/services/interaction/historiqueRepository.service";

export class ManualMigration1692216772744 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    console.log("");
    console.log("Lancement de la migration d'import des decisions");
    console.log("");

    await usagerHistoryRepository.delete({
      structureId: TOULOUSE_STRUCTURE_ID,
    });

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
    const queryRunner = myDataSource.createQueryRunner();

    for (const decision of decisions) {
      if (typeof usagersByRef[decision.id_domicilie] === "undefined") {
        usagersByRef[decision.id_domicilie] = [];
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
        userId: 0,
        userName: "DomiFa",
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

      usagersByRef[decision.id_domicilie].push(newDecision);
    }

    let cpt = 0;

    await queryRunner.startTransaction();
    for (const ref in usagersByRef) {
      cpt++;
      if (cpt % 1000 === 0) {
        await queryRunner.commitTransaction();
        console.log(
          `${cpt} décisions importés ${format(new Date(), "HH:mm:ss")}`
        );
        await queryRunner.startTransaction();
      }

      const usager = await myDataSource
        .getRepository<Usager>(UsagerTable)
        .findOne({
          where: {
            ref: parseInt(ref, 10),
            structureId: 1,
          },
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

      if (usager) {
        usagersByRef[ref].push(usager.decision);

        const uniqueCombinations = new Set();

        const uniqueDecision = usagersByRef[ref].filter(
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

          const state: UsagerHistoryState = {
            uuid: uuidv4(),
            createdAt: startOfDay(new Date(decision.dateDebut)),
            createdEvent: "new-decision",
            isActive,
            historyBeginDate: startOfDay(new Date(decision.dateDebut)),
            historyEndDate: undefined,
            decision,
            typeDom: usager.typeDom,
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
          { decision: usager.decision, historique: usager.historique }
        );
      }
    }
    await queryRunner.release();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("down");
  }
}
