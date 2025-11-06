import { MigrationInterface } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { domifaConfig } from "../config";
import { structureRepository } from "../database";

export class AutoMigration1762382467280 implements MigrationInterface {
  name = "AutoMigration1762382467280";

  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await structureRepository.update(
        { statut: "EN_ATTENTE" },
        {
          statut: "VALIDE",
          decision: {
            uuid: uuidv4(),
            dateDecision: new Date(),
            statut: "VALIDE",
            motif: null,
            motifDetails: null,
            userId: 1,
            userName: "Migration DomiFa",
          },
        }
      );
    }
  }

  public async down(): Promise<void> {}
}
