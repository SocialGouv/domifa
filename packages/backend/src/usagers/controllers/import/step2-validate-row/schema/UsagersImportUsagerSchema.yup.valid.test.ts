import {
  TEST_VALID_IMPORT_USAGER,
  TEST_VALID_IMPORT_USAGER_REFUS,
} from "./test-data";
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
  countryCode: "fr",
};

describe("UsagersImportCiviliteSchema schema", () => {
  it("usager VALIDE", async () => {
    expect(
      await UsagersImportUsagerSchema.validate(TEST_VALID_IMPORT_USAGER, {
        context,
      })
    ).toEqual<UsagersImportUsager>({
      customRef: "15b",
      civilite: "H",
      nom: "Dupont",
      prenom: "Paul",
      surnom: "Polo",
      dateNaissance: new Date(Date.UTC(2018, 6 - 1, 15)),
      lieuNaissance: "Paris",
      telephone: {
        countryCode: "fr",
        numero: "06 02 03 04 05",
      },
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
      orientationDetail: "détails orientation",
      domiciliationExistante: false,
      situationPro: "SALARIE",
      situationProDetail: "détails situation pro",
      revenus: true,
      revenusDetail: "détails revenus",
      liencommune: "SOCIAL",
      liencommuneDetail: "Suivi social",
      typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
      situationResidentielle: "HEBERGEMENT_TIERS",
      situationResidentielleDetail: "",
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

  it("usager REFUS", async () => {
    expect(
      await UsagersImportUsagerSchema.validate(TEST_VALID_IMPORT_USAGER_REFUS, {
        context,
      })
    ).toEqual<Partial<UsagersImportUsager>>({
      accompagnement: true,
      accompagnementDetail: "Ici le détail",
      ayantsDroits: [
        {
          dateNaissance: new Date(Date.UTC(1991, 7 - 1, 11)),
          lienParente: "AUTRE",
          nom: "Auguy",
          prenom: "Marcelo",
        },
      ],
      causeDetail: "",
      civilite: "F",
      commentaires: "Un commentaire",
      customRef: "XX_0111",
      dateFinDom: new Date(Date.UTC(2020, 5 - 1, 12)),
      dateNaissance: new Date(Date.UTC(1929, 6 - 1, 15)),
      domiciliationExistante: false,
      email: "marcelo-bielsa@yopmail.com",
      liencommune: "SOCIAL",
      liencommuneDetail: "Suivi social",
      lieuNaissance: "Paris",
      nom: "Auguy",
      orientation: false,
      orientationDetail: "détails orientation",
      telephone: {
        countryCode: "fr",
        numero: "06 02 03 04 05",
      },
      prenom: "Paul",
      raisonDemande: "EXERCICE_DROITS",
      raisonDemandeDetail: "détails raison demande",
      revenus: true,
      revenusDetail: "détails revenus",
      situationResidentielle: "HEBERGEMENT_TIERS",
      situationResidentielleDetail: "détails situation",
      statutDom: "REFUS",
      typeDom: "RENOUVELLEMENT",
      typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
    });
  });
});
