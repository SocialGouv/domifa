import * as moment from "moment";
import { Model } from "mongoose";
import { MigrationInterface, QueryRunner } from "typeorm";
import { appHolder } from "../appHolder";
import { appTypeormManager } from "../database/appTypeormManager.service";
import { StructureStatsTable } from "../stats/pg/StructureStatsTable.typeorm";

import { appLogger } from "../util";
import { Structure } from "../structures/structure-interface";

export class manualMigration1606748548178 implements MigrationInterface {
  public name = "manualMigration1606748548178";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);

    const structureStatsRepository = appTypeormManager.getRepository(
      StructureStatsTable,
      queryRunner.manager
    );

    const structureModel: Model<Structure> = appHolder.app.get(
      "STRUCTURE_MODEL"
    );

    const structures = await structureModel.find().exec();

    appLogger.debug(
      `[Migration] "${this.name}" ${structures.length} structures to check`
    );

    if (structures && structures !== null) {
      for (let index = 0; index < structures.length; index++) {
        //
        const stats = await structureStatsRepository.findOne({
          where: { structureId: structures[index].id },
          order: { date: -1 },
        });

        const stat = new StructureStatsTable({
          date: moment(stats.date).subtract(1, "day").toDate(),
          questions: {
            Q_10: 0,
            Q_10_A: 0,
            Q_10_B: 0,
            Q_11: {
              REFUS: 0,
              RADIE: 0,
              VALIDE: 0,
              VALIDE_AYANTS_DROIT: 0,
              VALIDE_TOTAL: 0,
            },
            Q_12: {
              AUTRE: 0,
              A_SA_DEMANDE: 0,
              ENTREE_LOGEMENT: 0,
              FIN_DE_DOMICILIATION: 0,
              NON_MANIFESTATION_3_MOIS: 0,
              NON_RESPECT_REGLEMENT: 0,
              PLUS_DE_LIEN_COMMUNE: 0,
              TOTAL: 0,
            },
            Q_13: {
              AUTRE: 0,
              HORS_AGREMENT: 0,
              LIEN_COMMUNE: 0,
              SATURATION: 0,
              TOTAL: 0,
            },
            Q_14: {
              ASSO: 0,
              CCAS: 0,
            },
            Q_17: 0,
            Q_18: 0,
            Q_19: {
              COUPLE_AVEC_ENFANT: 0,
              COUPLE_SANS_ENFANT: 0,
              FEMME_ISOLE_AVEC_ENFANT: 0,
              FEMME_ISOLE_SANS_ENFANT: 0,
              HOMME_ISOLE_AVEC_ENFANT: 0,
              HOMME_ISOLE_SANS_ENFANT: 0,
            },
            Q_20: {
              appel: 0,
              colisIn: 0,
              colisOut: 0,
              courrierIn: 0,
              courrierOut: 0,
              recommandeIn: 0,
              recommandeOut: 0,
              npai: 0,
              visite: 0,
            },
            Q_21: {
              AUTRE: 0,
              ERRANCE: 0,
              EXPULSION: 0,
              HEBERGE_SANS_ADRESSE: 0,
              ITINERANT: 0,
              RUPTURE: 0,
              SORTIE_STRUCTURE: 0,
              VIOLENCE: 0,
              NON_RENSEIGNE: 0,
            },
            Q_22: {
              DOMICILE_MOBILE: 0,
              HEBERGEMENT_SOCIAL: 0,
              HEBERGEMENT_TIERS: 0,
              HOTEL: 0,
              SANS_ABRI: 0,
              NON_RENSEIGNE: 0,
              AUTRE: 0,
            },
          },
        });
        stat.capacite = structures[index].capacite;
        stat.structureId = structures[index].id;
        stat.nom = structures[index].nom;
        stat.structureType = structures[index].structureType;
        stat.ville = structures[index].ville;
        stat.codePostal = structures[index].codePostal;
        stat.departement = structures[index].departement;

        await structureStatsRepository.insert(stat);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
