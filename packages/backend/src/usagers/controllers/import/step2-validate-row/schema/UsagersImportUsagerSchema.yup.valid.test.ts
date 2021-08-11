import { TEST_VALID_IMPORT_USAGER } from "./test-data";
import {
  UsagersImportUsager,
  UsagersImportUsagerSchema,
} from "./UsagersImportUsagerSchema.yup";
import { UsagersImportUsagerSchemaContext } from "./UsagersImportUsagerSchemaContext.type";

const today = new Date(Date.UTC(2021, 0, 1));
const nextYear = new Date(Date.UTC(2022, 0, 1));
const minDate = new Date(Date.UTC(1900, 0, 1));

const context: UsagersImportUsagerSchemaContext = {
  today,
  nextYear,
  minDate,
};

describe("UsagersImportCiviliteSchema schema", () => {
  it("valid usager", async () => {
    await expect(
      await UsagersImportUsagerSchema.validate(TEST_VALID_IMPORT_USAGER, {
        context,
      })
    ).toEqual<UsagersImportUsager>({
      customId: "15b",
      civilite: "H",
      nom: "Dupont",
      prenom: "Paul",
      surnom: "Polo",
      dateNaissance: new Date(Date.UTC(2018, 6 - 1, 15)),
      lieuNaissance: "Paris",
      phone: "0102030405",
      email: "paul.dupont.168436@gmail.com",
      statutDom: "VALIDE",
      motifRefus: undefined,
      motifRadiation: undefined,
      typeDom: "PREMIERE_DOM",
      dateDebutDom: new Date(Date.UTC(2019, 3 - 1, 10)),
      dateFinDom: new Date(Date.UTC(2020, 3 - 1, 10)),
      datePremiereDom: new Date(Date.UTC(2019, 3 - 1, 10)),
      dateDernierPassage: new Date(Date.UTC(2020, 12 - 1, 18)),
      orientation: false,
      orientationDetails: "détails orientation",
      domiciliationExistante: false,
      revenus: true,
      revenusDetail: "détails revenus",
      liencommune: "SOCIAL",
      liencommuneDetail: "Suivi social",
      compositionMenage: "FEMME_ISOLE_AVEC_ENFANT",
      situationResidentielle: "HEBERGEMENT_TIERS",
      situationDetails: "détails situation",
      causeInstabilite: "ERRANCE",
      causeDetail: "détails cause",
      raisonDemande: "EXERCICE_DROITS",
      raisonDemandeDetail: "détails raison demande",
      accompagnement: false,
      accompagnementDetail: "détails accompagnement",
      commentaires: "commentaires sur l'usager",
      ayantsDroits: [
        {
          nom: "Dupont",
          prenom: "Paula",
          dateNaissance: new Date(Date.UTC(2018, 7 - 1, 15)),
          lienParente: "ENFANT",
        },
        {
          nom: "Dupont",
          prenom: "John",
          dateNaissance: new Date(Date.UTC(1938, 7 - 1, 15)),
          lienParente: "PARENT",
        },
      ],
    });
  });
});
