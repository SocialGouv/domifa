import { UsagersImportUsager } from "../step2-validate-row/schema/UsagersImportUsagerSchema.yup";
import { usagersImportBuilder } from "./usagersImportBuilder.service";

// Row as produced by usagersImportValidator on a valid spreadsheet line
const VALID_ROW: UsagersImportUsager = {
  customRef: "15b",
  civilite: "H",
  nom: "Dupont",
  prenom: "Paul",
  surnom: "Polo",
  dateNaissance: new Date(Date.UTC(2000, 5, 15, 12)),
  lieuNaissance: "Paris",
  telephone: { countryCode: "fr", numero: "06 02 03 04 05" },
  email: "paul.dupont@example.org",
  statutDom: "VALIDE",
  typeDom: "PREMIERE_DOM",
  dateDebutDom: new Date(Date.UTC(2019, 2, 10, 12)),
  dateFinDom: new Date(Date.UTC(2020, 2, 10, 12)),
  datePremiereDom: new Date(Date.UTC(2019, 2, 10, 12)),
  dateDernierPassage: new Date(Date.UTC(2020, 11, 18, 12)),
  orientation: false,
  orientationDetail: "détails orientation",
  domiciliationExistante: false,
  revenus: true,
  revenusDetail: "détails revenus",
  situationPro: "SALARIE",
  situationProDetail: "détails situation pro",
  liencommune: "SOCIAL",
  liencommuneDetail: "suivi social",
  typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
  residence: "HEBERGEMENT_TIERS",
  residenceDetail: "détails situation",
  causeInstabilite: "ERRANCE",
  causeDetail: "détails cause",
  raisonDemande: "EXERCICE_DROITS",
  raisonDemandeDetail: "détails raison demande",
  accompagnement: false,
  accompagnementDetail: "détails accompagnement",
  commentaires: "commentaires sur l'usager",
  ayantsDroits: [],
} as UsagersImportUsager;

const user = { id: 1, structureId: 1, prenom: "Jane", nom: "Doe" };

const build = (row: Partial<UsagersImportUsager>) =>
  usagersImportBuilder.buildUsagers({
    usagersRows: [{ ...VALID_ROW, ...row } as UsagersImportUsager],
    user,
  })[0];

describe("usagersImportBuilder — same rules as the HTTP DTOs", () => {
  it("stores the phone like the API does (national, no spaces)", () => {
    expect(build({}).telephone).toEqual({
      countryCode: "fr",
      numero: "0602030405",
    });
  });

  it("nulls entretien details whose discriminator is not AUTRE / true", () => {
    const { entretien } = build({});
    expect(entretien.orientationDetail).toBeNull();
    expect(entretien.accompagnementDetail).toBeNull();
    expect(entretien.situationProDetail).toBeNull();
    expect(entretien.liencommuneDetail).toBeNull();
    expect(entretien.residenceDetail).toBeNull();
    expect(entretien.causeDetail).toBeNull();
    expect(entretien.raisonDetail).toBeNull();
    expect(entretien.revenusDetail).toEqual("détails revenus");
    expect(entretien.commentaires).toEqual("commentaires sur l'usager");
  });

  it("keeps every detail when its discriminator is AUTRE / true", () => {
    const { entretien } = build({
      orientation: true,
      accompagnement: true,
      situationPro: "AUTRE",
      liencommune: "AUTRE",
      residence: "AUTRE",
      causeInstabilite: "AUTRE",
      raisonDemande: "AUTRE",
    });
    expect(entretien).toMatchObject({
      orientationDetail: "détails orientation",
      accompagnementDetail: "détails accompagnement",
      situationProDetail: "détails situation pro",
      liencommuneDetail: "suivi social",
      residenceDetail: "détails situation",
      causeDetail: "détails cause",
      raisonDetail: "détails raison demande",
    });
  });

  it("stores null, not undefined, for a missing detail", () => {
    const { entretien } = build({
      residence: "AUTRE",
      residenceDetail: undefined,
      revenus: true,
      revenusDetail: undefined,
    });
    expect(entretien.residenceDetail).toBeNull();
    expect(entretien.revenusDetail).toBeNull();
  });
});
