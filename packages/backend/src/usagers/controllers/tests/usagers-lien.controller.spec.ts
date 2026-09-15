import { UsagersModule } from "../../usagers.module";
import { UsersModule } from "../../../modules/users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";

import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { CreateUsagerDto } from "../../dto";
import { Usager } from "@domifa/common";

const ENDPOINT = "/usagers-lien";
const CONJOINT_DOB = new Date("1988-05-03T00:00:00.000Z");

function buildUsagerPayload(
  overrides: Partial<CreateUsagerDto>
): CreateUsagerDto {
  return {
    numeroDistribution: null,
    ayantsDroits: [],
    langue: null,
    dateNaissance: new Date("1990-01-01"),
    customRef: null,
    email: null,
    nom: "Nom",
    telephone: { countryCode: "fr", numero: "" },
    contactByPhone: false,
    prenom: "Prenom",
    sexe: "homme",
    surnom: null,
    villeNaissance: "Paris",
    nationalite: null,
    referrerId: null,
    ...overrides,
  } as CreateUsagerDto;
}

async function createUsager(
  context: AppTestContext,
  overrides: Partial<CreateUsagerDto>
): Promise<Usager> {
  const response = await AppTestHttpClient.post("/usagers", {
    context,
    body: buildUsagerPayload(overrides),
  });
  expect(response.status).toBe(200);
  return response.body as Usager;
}

// Nest envoie une réponse vide (pas de `null` JSON littéral) quand un
// handler renvoie `null` — supertest expose alors `response.body` comme
// `{}` par défaut, faute de contenu à parser.
function expectNullBody(response: { text: string }): void {
  expect(response.text).toEqual("");
}

describe("UsagersLien Controller", () => {
  let context: AppTestContext;

  let usagerA: Usager; // a un ayant droit CONJOINT correspondant à B
  let usagerB: Usager; // cible du matching automatique
  let usagerC: Usager; // sera relié à E avant les tests (déjà relié à un tiers)
  let usagerE: Usager;
  let usagerF: Usager; // dossier "neutre", sans lien ni ayant droit
  let usagerD: Usager; // structure différente (3)
  let ayantDroitUuidA: string;

  afterAll(async () => {
    // Nettoyage explicite : ce test crée de vrais usagers via l'API sur une
    // base partagée entre exécutions locales successives — sans ça, des
    // "Martin Sonia" homonymes s'accumulent au fil des runs et faussent les
    // assertions de recherche.
    const structure1Admin =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    const structure3Admin =
      TESTS_USERS_STRUCTURE.BY_EMAIL["s3-admin@yopmail.com"];

    await AppTestHelper.authenticateStructure(structure1Admin, { context });
    for (const usager of [usagerA, usagerB, usagerC, usagerE, usagerF]) {
      if (usager) {
        await AppTestHttpClient.delete(`/usagers/${usager.ref}`, { context });
      }
    }

    if (usagerD) {
      await AppTestHelper.authenticateStructure(structure3Admin, { context });
      await AppTestHttpClient.delete(`/usagers/${usagerD.ref}`, { context });
    }

    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        imports: [UsagersModule, UsersModule],
      },
      { initApp: true }
    );

    const structure1Admin =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    const structure3Admin =
      TESTS_USERS_STRUCTURE.BY_EMAIL["s3-admin@yopmail.com"];

    await AppTestHelper.authenticateStructure(structure1Admin, { context });

    usagerA = await createUsager(context, {
      nom: "Usager",
      prenom: "Alpha",
      ayantsDroits: [
        {
          uuid: "",
          lien: "CONJOINT",
          nom: "Martin",
          prenom: "Sonia",
          dateNaissance: CONJOINT_DOB,
        },
      ],
    });
    ayantDroitUuidA = usagerA.ayantsDroits[0].uuid;

    usagerB = await createUsager(context, {
      nom: "Martin",
      prenom: "Sonia",
      dateNaissance: CONJOINT_DOB,
    });
    usagerC = await createUsager(context, {
      nom: "Conjoint",
      prenom: "Existant",
    });
    usagerE = await createUsager(context, { nom: "Autre", prenom: "Lien" });
    usagerF = await createUsager(context, {
      nom: "Usager",
      prenom: "Foxtrot",
    });

    // C est déjà relié à E avant le début des tests, pour vérifier le
    // comportement "déjà relié à un tiers" en recherche/liaison.
    await AppTestHttpClient.post(`${ENDPOINT}/${usagerC.ref}/link`, {
      context,
      body: { targetUsagerUuid: usagerE.uuid, acceptedSuggestion: false },
    });

    await AppTestHelper.authenticateStructure(structure3Admin, { context });
    usagerD = await createUsager(context, {
      nom: "Structure3",
      prenom: "Usager",
    });

    await AppTestHelper.authenticateStructure(structure1Admin, { context });
  });

  it("GET renvoie null quand aucun lien n'existe", async () => {
    const response = await AppTestHttpClient.get(`${ENDPOINT}/${usagerA.ref}`, {
      context,
    });
    expect(response.status).toBe(200);
    expectNullBody(response);
  });

  it("refuse de relier un dossier à lui-même", async () => {
    const response = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerA.ref}/link`,
      {
        context,
        body: { targetUsagerUuid: usagerA.uuid, acceptedSuggestion: false },
      }
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("CANNOT_LINK_TO_SELF");
  });

  it("refuse de relier un dossier d'une autre structure", async () => {
    const response = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerA.ref}/link`,
      {
        context,
        body: { targetUsagerUuid: usagerD.uuid, acceptedSuggestion: false },
      }
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("CROSS_STRUCTURE_LINK_FORBIDDEN");
  });

  it("la recherche est scopée à la structure, exclut le dossier courant et ne renvoie que les champs prévus", async () => {
    const response = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerF.ref}/search`,
      { context, body: { query: "Marti" } }
    );
    expect(response.status).toBe(201);
    const result = response.body.find(
      (r: { uuid: string }) => r.uuid === usagerB.uuid
    );
    expect(result).toBeDefined();
    expect(Object.keys(result).sort()).toEqual(
      [
        "uuid",
        "nom",
        "prenom",
        "dateNaissance",
        "customRef",
        "alreadyLinkedTo",
      ].sort()
    );
    expect(
      response.body.find((r: { uuid: string }) => r.uuid === usagerD.uuid)
    ).toBeUndefined();
  });

  it("la recherche grise un dossier déjà relié à un tiers", async () => {
    const response = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerF.ref}/search`,
      { context, body: { query: "Conjoint" } }
    );
    expect(response.status).toBe(201);
    const result = response.body.find(
      (r: { uuid: string }) => r.uuid === usagerC.uuid
    );
    expect(result.alreadyLinkedTo).toEqual({ nom: "Autre", prenom: "Lien" });
  });

  it("empêche de relier un dossier déjà relié, y compris via l'API directement", async () => {
    const response = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerF.ref}/link`,
      {
        context,
        body: { targetUsagerUuid: usagerC.uuid, acceptedSuggestion: false },
      }
    );
    expect(response.status).toBe(409);
    expect(response.body.message).toEqual("ALREADY_LINKED");
  });

  it("la suggestion automatique trouve le dossier correspondant à l'ayant droit conjoint", async () => {
    const response = await AppTestHttpClient.get(
      `${ENDPOINT}/${usagerA.ref}/suggestion`,
      { context }
    );
    expect(response.status).toBe(200);
    expect(response.body.candidate.uuid).toEqual(usagerB.uuid);
    expect(response.body.ayantDroitUuid).toEqual(ayantDroitUuidA);
  });

  it("relie A et B (en acceptant la suggestion) et affiche le lien des deux côtés", async () => {
    const linkResponse = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerA.ref}/link`,
      {
        context,
        body: { targetUsagerUuid: usagerB.uuid, acceptedSuggestion: true },
      }
    );
    expect(linkResponse.status).toBe(201);
    expect(linkResponse.body.linkedUsager.uuid).toEqual(usagerB.uuid);

    const sideA = await AppTestHttpClient.get(`${ENDPOINT}/${usagerA.ref}`, {
      context,
    });
    expect(sideA.body.linkedUsager.uuid).toEqual(usagerB.uuid);

    const sideB = await AppTestHttpClient.get(`${ENDPOINT}/${usagerB.ref}`, {
      context,
    });
    expect(sideB.body.linkedUsager.uuid).toEqual(usagerA.uuid);
  });

  it("la suggestion disparaît une fois le dossier relié", async () => {
    const response = await AppTestHttpClient.get(
      `${ENDPOINT}/${usagerA.ref}/suggestion`,
      { context }
    );
    expect(response.status).toBe(200);
    expectNullBody(response);
  });

  it("délier depuis B supprime le lien des deux côtés", async () => {
    const unlinkResponse = await AppTestHttpClient.delete(
      `${ENDPOINT}/${usagerB.ref}`,
      { context }
    );
    expect(unlinkResponse.status).toBe(200);
    expect(unlinkResponse.body).toEqual({ message: "UNLINK_SUCCESS" });

    const sideA = await AppTestHttpClient.get(`${ENDPOINT}/${usagerA.ref}`, {
      context,
    });
    expectNullBody(sideA);

    const sideB = await AppTestHttpClient.get(`${ENDPOINT}/${usagerB.ref}`, {
      context,
    });
    expectNullBody(sideB);
  });

  it("délier un dossier sans lien renvoie 404", async () => {
    const response = await AppTestHttpClient.delete(
      `${ENDPOINT}/${usagerA.ref}`,
      { context }
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("NO_LINK");
  });

  it("le rejet d'une suggestion est persisté", async () => {
    const before = await AppTestHttpClient.get(
      `${ENDPOINT}/${usagerA.ref}/suggestion`,
      { context }
    );
    expect(before.body.candidate.uuid).toEqual(usagerB.uuid);

    const rejectResponse = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerA.ref}/reject-suggestion`,
      { context, body: { ayantDroitUuid: ayantDroitUuidA } }
    );
    expect(rejectResponse.status).toBe(201);

    const after = await AppTestHttpClient.get(
      `${ENDPOINT}/${usagerA.ref}/suggestion`,
      { context }
    );
    expectNullBody(after);
  });

  it("l'historique contient la création et la suppression du lien", async () => {
    const response = await AppTestHttpClient.get(
      `${ENDPOINT}/${usagerA.ref}/history`,
      { context }
    );
    expect(response.status).toBe(200);
    const actions = response.body.data.map(
      (log: { action: string }) => log.action
    );
    expect(actions).toContain("USAGERS_LIEN_CREATE");
    expect(actions).toContain("USAGERS_LIEN_DELETE");
  });

  it("le facteur voit le lien mais ne peut ni relier ni délier", async () => {
    const facteurAuth =
      TESTS_USERS_STRUCTURE.BY_EMAIL["s1-facteur@yopmail.com"];
    await AppTestHelper.authenticateStructure(facteurAuth, { context });

    const readResponse = await AppTestHttpClient.get(
      `${ENDPOINT}/${usagerF.ref}`,
      { context }
    );
    expect(readResponse.status).toBe(200);

    const linkResponse = await AppTestHttpClient.post(
      `${ENDPOINT}/${usagerF.ref}/link`,
      {
        context,
        body: { targetUsagerUuid: usagerE.uuid, acceptedSuggestion: false },
      }
    );
    expect(linkResponse.status).toBe(403);
  });
});
