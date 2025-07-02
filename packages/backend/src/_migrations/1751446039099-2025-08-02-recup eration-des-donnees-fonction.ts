import { normalizeString } from "@domifa/common";
import { USER_FONCTION_LABELS } from "@domifa/common/src/users/user-structure/constants/USER_FONCTION_LABELS.const";
import { MigrationInterface, QueryRunner } from "typeorm";

// Define the function values using the actual labels from USER_FONCTION_LABELS
const UserFonction = {
  PRESIDENT: USER_FONCTION_LABELS.president,
  DIRECTEUR_RESPONSABLE: USER_FONCTION_LABELS.directeur_responsable,
  DIRECTEUR_GENERAL_DES_SERVICES:
    USER_FONCTION_LABELS.directeur_general_des_services,
  MAIRE: USER_FONCTION_LABELS.maire,
  CHEF_DE_SERVICE: USER_FONCTION_LABELS.chef_de_service,
  ADJOINT_ADMINISTRATIF: USER_FONCTION_LABELS.adjoint_administratif,
  SECRETAIRE_ASSISTANT_ADMINISTRATIF:
    USER_FONCTION_LABELS.secretaire_assistant_administratif,
  TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL:
    USER_FONCTION_LABELS.travailleur_social_assistant_social,
  AGENT_ACCUEIL: USER_FONCTION_LABELS.agent_accueil,
  CHARGE_DE_MISSION_ACTION_SOCIALE:
    USER_FONCTION_LABELS.charge_de_mission_action_sociale,
  CONSEILLER_ECONOMIE_SOCIALE_ET_FAMILIALE:
    USER_FONCTION_LABELS.conseiller_economie_sociale_et_familiale,
  MEDIATION_SOCIALE: USER_FONCTION_LABELS.mediation_sociale,
  RSA_INSERTION: USER_FONCTION_LABELS.rsa_insertion,
  DOMICILIATION: USER_FONCTION_LABELS.domiciliation,
  BENEVOLE: USER_FONCTION_LABELS.benevole,
  AUTRE: USER_FONCTION_LABELS.autre,
};

export class AutoMigration1751446039099 implements MigrationInterface {
  name = "AutoMigration1751446039099";

  /**
   * Maps a user-entered function to a standardized UserFonction
   * @param userFunction The user-entered function
   * @returns The matching UserFonction or UserFonction.AUTRE if no match is found
   */
  private mapToStandardFunction(userFunction: string | null): string {
    if (!userFunction) {
      return UserFonction.AUTRE;
    }

    // Normalize the user function using the common normalizeString function
    const normalizedUserFunction = normalizeString(userFunction.trim());

    // Map of normalized user functions to standardized functions
    const functionMap: { [key: string]: string } = {
      // President
      president: UserFonction.PRESIDENT,
      presidente: UserFonction.PRESIDENT,
      "president du ccas": UserFonction.PRESIDENT,
      "president du c.c.a.s.": UserFonction.PRESIDENT,
      "president ccas": UserFonction.PRESIDENT,
      "president du ccas et maire de la commune": UserFonction.PRESIDENT,
      presidence: UserFonction.PRESIDENT,

      // Directeur / Responsable
      directeur: UserFonction.DIRECTEUR_RESPONSABLE,
      directrice: UserFonction.DIRECTEUR_RESPONSABLE,
      responsable: UserFonction.DIRECTEUR_RESPONSABLE,
      "directeur du ccas": UserFonction.DIRECTEUR_RESPONSABLE,
      "directrice du ccas": UserFonction.DIRECTEUR_RESPONSABLE,
      "responsable ccas": UserFonction.DIRECTEUR_RESPONSABLE,
      "responsable du ccas": UserFonction.DIRECTEUR_RESPONSABLE,
      "directeur des services": UserFonction.DIRECTEUR_RESPONSABLE,
      "directrice des services": UserFonction.DIRECTEUR_RESPONSABLE,
      respensable: UserFonction.DIRECTEUR_RESPONSABLE,
      diretrice: UserFonction.DIRECTEUR_RESPONSABLE,

      // Directeur général des services
      dgs: UserFonction.DIRECTEUR_GENERAL_DES_SERVICES,
      "directrice generale des services":
        UserFonction.DIRECTEUR_GENERAL_DES_SERVICES,

      // Maire
      maire: UserFonction.MAIRE,
      "maire de montelier": UserFonction.MAIRE,
      "maire, president du ccas": UserFonction.MAIRE,

      // Chef de service
      "chef de service": UserFonction.CHEF_DE_SERVICE,
      "cheffe de service": UserFonction.CHEF_DE_SERVICE,
      "responsable de service": UserFonction.CHEF_DE_SERVICE,
      "chef de service logement specifique": UserFonction.CHEF_DE_SERVICE,

      // Adjoint administratif
      "adjoint administratif": UserFonction.ADJOINT_ADMINISTRATIF,
      "adjointe administrative": UserFonction.ADJOINT_ADMINISTRATIF,
      "adjoint administratif 2eme classe": UserFonction.ADJOINT_ADMINISTRATIF,
      "adjoint administratif principal": UserFonction.ADJOINT_ADMINISTRATIF,
      "adjoint administratif service ccas": UserFonction.ADJOINT_ADMINISTRATIF,
      "adjoint administrative": UserFonction.ADJOINT_ADMINISTRATIF,
      "adjointe  administrative": UserFonction.ADJOINT_ADMINISTRATIF,

      // Secrétaire / Assistant administratif
      secretaire: UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire de mairie": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire du ccas": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire ccas": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire generale": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire mairie": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire ul": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire accueil": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretaire en charge des affaires sociales":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "secretariat service social":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "assistante administrative":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "assistante administrative ccas logements":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "assistante ccas": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "assistante de direction":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "assistante direction": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "agent administratif": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "agent adminstraitf en charge du ccas":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "agent ccas": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "agent en charge du ccas":
        UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "agent du ccas": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      "cadre administratif": UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,
      assistante: UserFonction.SECRETAIRE_ASSISTANT_ADMINISTRATIF,

      // Travailleur social / Assistant social
      "travailleur social": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "travailleuse sociale": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "assistante sociale": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "assistant de service social":
        UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "assistante de service social":
        UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "assistante de service social lhss babinski":
        UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "assistant social rr": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "conseillere sociale": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "conseillere sociale - chu romain rolland":
        UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "referente sociale": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,
      "gestionnaire sociale": UserFonction.TRAVAILLEUR_SOCIAL_ASSISTANT_SOCIAL,

      // Agent d'accueil
      "agent d'accueil": UserFonction.AGENT_ACCUEIL,
      "agent d'accueil administratif": UserFonction.AGENT_ACCUEIL,
      "agent d'accueil social": UserFonction.AGENT_ACCUEIL,
      "agent de premier accueil social": UserFonction.AGENT_ACCUEIL,
      accueillant: UserFonction.AGENT_ACCUEIL,
      "charge d'accueil social": UserFonction.AGENT_ACCUEIL,
      agent: UserFonction.AGENT_ACCUEIL,
      agen: UserFonction.AGENT_ACCUEIL,

      // Chargé de mission action sociale
      "charge de domiciliation": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "agent charge des elections de domicile":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "er accueil en charge des domiciliations":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "coordinateur pole social ccas moulins":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "coordinatrice d'appui aux interventions sociales":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "coordinatrice de l'accueil social universel":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "coordinatrice de la politique sociale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "coordinatrice medico sociale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      coordonnateur: UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable action sociale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable administrative":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable admissions": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable ccas de guipry-messac":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable d'action sociale et logement":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable de la direction animation intergenerationnelle":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable de la paal": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable de l'epicerie solidaire":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable des affaires sociales":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable des aides legales et extra-legales":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable du pole de developpement social":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable du pole precarite":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable du pole social":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable du service action sociale du ccas":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable pole action sociale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable pole social": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable pole social animations":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable service administration generale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "responsable service logement":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      referente: UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "referente d'equipe": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "referente pole action sociale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "agent social": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "conseillere municipale": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "conseillere municipale deleguee au social":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "elue en charge du social": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "directrice locale de l'action sociale":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "directrice des services adultes en difficultes":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "adjointe aux affaires sociales - vice-presidente du ccas":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "ajoint au maire ccas": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "adjoint au directeur": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "vice-president": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "vice president du ca du ccas":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "vice president du c.c.a.s":
        UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "vice presidente": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "vice-presidente": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      "presidente du ccas": UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,
      ccas: UserFonction.CHARGE_DE_MISSION_ACTION_SOCIALE,

      // Conseiller en économie sociale et familiale
      cesf: UserFonction.CONSEILLER_ECONOMIE_SOCIALE_ET_FAMILIALE,
      "conseillere esf": UserFonction.CONSEILLER_ECONOMIE_SOCIALE_ET_FAMILIALE,

      // Médiation sociale
      "animateur socio educatif": UserFonction.MEDIATION_SOCIALE,
      educatrice: UserFonction.MEDIATION_SOCIALE,
      equipiere: UserFonction.MEDIATION_SOCIALE,

      // Bénévole
      benevole: UserFonction.BENEVOLE,
      "benevole domiciliation": UserFonction.BENEVOLE,

      // Catch-all for testing or null values
      test: UserFonction.AUTRE,
      null: UserFonction.AUTRE,
    };

    // Try to find a direct match
    return functionMap[normalizedUserFunction] || UserFonction.AUTRE;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Process users in batches to avoid memory issues
    const batchSize = 500;
    let offset = 0;
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      // Get a batch of users with their current fonction values
      const users = await queryRunner.query(
        `SELECT id, fonction FROM user_structure 
         WHERE fonction IS NOT NULL 
         ORDER BY id 
         LIMIT $1 OFFSET $2`,
        [batchSize, offset]
      );

      // If we got fewer users than the batch size, this is the last batch
      if (users.length < batchSize) {
        hasMoreUsers = false;
      }

      // Prepare batch update
      if (users.length > 0) {
        // Create a batch update query with multiple cases
        const cases = [];
        const params = [];
        let paramIndex = 1;

        for (const user of users) {
          const originalFonction = user.fonction;
          const standardizedFonction =
            this.mapToStandardFunction(originalFonction);

          cases.push(`WHEN id = $${paramIndex++} THEN $${paramIndex++}`);
          params.push(user.id, standardizedFonction);

          // Store original fonction in detailFonction
          cases.push(`WHEN id = $${paramIndex - 2} THEN $${paramIndex++}`);
          params.push(originalFonction);
        }

        // Execute batch update if we have users to update
        if (cases.length > 0) {
          const fonctionCases = cases.filter((_, i) => i % 2 === 0);
          const detailFonctionCases = cases.filter((_, i) => i % 2 === 1);

          await queryRunner.query(
            `UPDATE user_structure 
             SET fonction = CASE ${fonctionCases.join(" ")} ELSE fonction END,
                 detailFonction = CASE ${detailFonctionCases.join(
                   " "
                 )} ELSE detailFonction END
             WHERE id IN (${users.map((user: any) => user.id).join(",")})`,
            params
          );
        }
      }

      // Move to the next batch
      offset += batchSize;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore original fonction values from detailFonction
    await queryRunner.query(
      `UPDATE user_structure 
       SET fonction = detailFonction, 
           detailFonction = NULL
       WHERE detailFonction IS NOT NULL`
    );
  }
}
