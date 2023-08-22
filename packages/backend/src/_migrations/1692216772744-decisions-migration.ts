import { readFile } from "fs-extra";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import {
  Usager,
  UsagerDecision,
  UsagerEntretien,
  UsagerHistory,
  UsagerHistoryState,
} from "../_common/model";
import { addYears, endOfDay, isValid, parse, startOfDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  UsagerHistoryTable,
  UsagerTable,
  myDataSource,
  usagerHistoryRepository,
  usagerRepository,
} from "../database";

const STRUCTURE_ID = 1;

export class ManualMigration1692216772744 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    console.log("");
    console.log("Lancement de la migration d'import des decisions");
    console.log("");

    await usagerHistoryRepository.delete({ structureId: STRUCTURE_ID });
    const decisionJson = await readFile(
      `${domifaConfig().upload.basePath}toulouse/decisions.json`,
      "utf-8"
    );

    const decisions = JSON.parse(decisionJson);
    const usagersByRef: { [key: string]: UsagerDecision[] } = {};

    for (const decision of decisions) {
      if (typeof usagersByRef[decision.id_domicilié] === "undefined") {
        usagersByRef[decision.id_domicilié] = [];
      }

      const dateFin =
        decision.type === "cloture" || decision.type === "resiliation"
          ? this.getDate(decision.date)
          : addYears(this.getDate(decision.date), 1);

      const newDecision: UsagerDecision = {
        uuid: uuidv4(),
        statut:
          decision.type === "cloture" || decision.type === "resiliation"
            ? "RADIE"
            : "VALIDE",
        userId: 0,
        userName: "DomiFa",
        dateDebut: this.getDate(decision.date),
        dateFin,
        dateDecision: this.getDate(decision.date),
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

      usagersByRef[decision.id_domicilié].push(newDecision);
    }

    for (const ref in usagersByRef) {
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
          structureId: STRUCTURE_ID,
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
              commentaires: null,
              typeMenage: null,
              revenus: null,
              revenusDetail: null,
              orientation: null,
              orientationDetail: null,
              liencommune: null,
              liencommuneDetail: null,
              residence: null,
              residenceDetail: null,
              cause: null,
              causeDetail: null,
              rattachement: null,
              raison: null,
              raisonDetail: null,
              accompagnement: null,
              accompagnementDetail: null,
            } as UsagerEntretien,
            ayantsDroits: [...usager.ayantsDroits],
            rdv: usager.rdv,
          };

          usagerHistory.states.push(state);
        }

        console.log(usagerHistory.states);

        if (usagerHistory) {
          throw new Error("kpok");
        }

        console.log(
          "Mise à jour de " +
            usager.ref +
            " " +
            usager.nom +
            " - " +
            usager.historique.length +
            " decisions"
        );

        await usagerRepository.updateOne(
          {
            uuid: usager.uuid,
          },
          { decision: usager.decision, historique: usager.historique }
        );
      }
    }
  }

  public getDate = (dateString: string): Date => {
    const parsedDate = endOfDay(parse(dateString, "yyyyMMdd", new Date()));
    if (!isValid(parsedDate)) {
      console.log(dateString);
      throw new Error("CANNOT ADD DATE " + dateString);
    }
    return parsedDate;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("down");
  }
}
