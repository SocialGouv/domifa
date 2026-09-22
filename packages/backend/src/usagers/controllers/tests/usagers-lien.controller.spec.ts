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

// Nest sends an empty response (no literal `null` JSON body) when a
// handler returns `null` — supertest then exposes `response.body` as
// `{}` by default, since there's no content to parse.
function expectNullBody(response: { text: string }): void {
  expect(response.text).toEqual("");
}

describe("UsagersLien Controller", () => {
  let context: AppTestContext;

  let usagerA: Usager; // has a CONJOINT ayant droit matching B
  let usagerB: Usager; // target of automatic matching
  let usagerC: Usager; // will be linked to E before the tests (already linked to someone else)
  let usagerE: Usager;
  let usagerF: Usager; // "neutral" dossier, no link and no ayant droit
  let usagerD: Usager; // different structure (3)
  let usagerG: Usager; // ENFANT + PARENT + AUTRE ayants droit, no CONJOINT
  let usagerH: Usager; // ENFANT + CONJOINT ayant droit (matches I)
  let usagerI: Usager; // target of the CONJOINT declared on H
  let ayantDroitUuidA: string;

  afterAll(async () => {
    // Explicit cleanup: this test creates real usagers via the API on a
    // database shared across successive local runs — without this, "Martin
    // Sonia" homonyms pile up run after run and throw off the search
    // assertions.
    const structure1Admin =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    const structure3Admin =
      TESTS_USERS_STRUCTURE.BY_EMAIL["s3-admin@yopmail.com"];

    await AppTestHelper.authenticateStructure(structure1Admin, { context });
    for (const usager of [
      usagerA,
      usagerB,
      usagerC,
      usagerE,
      usagerF,
      usagerG,
      usagerH,
      usagerI,
    ]) {
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

    // Ayants droit of every kind, no CONJOINT: must never trigger a
    // suggestion, regardless of their number or type.
    usagerG = await createUsager(context, {
      nom: "Usager",
      prenom: "Golf",
      ayantsDroits: [
        {
          uuid: "",
          lien: "ENFANT",
          nom: "Usager",
          prenom: "Junior",
          dateNaissance: new Date("2015-01-01"),
        },
        {
          uuid: "",
          lien: "PARENT",
          nom: "Usager",
          prenom: "Senior",
          dateNaissance: new Date("1950-01-01"),
        },
        {
          uuid: "",
          lien: "AUTRE",
          nom: "Usager",
          prenom: "Cousin",
          dateNaissance: new Date("1985-01-01"),
        },
      ],
    });

    usagerI = await createUsager(context, {
      nom: "Hotel",
      prenom: "Conjointe",
      dateNaissance: new Date("1992-07-14"),
    });
    // An ENFANT (not relevant to matching) is declared alongside the
    // CONJOINT, to check that the suggestion correctly targets the latter
    // and ignores other ayant droit types.
    usagerH = await createUsager(context, {
      nom: "Usager",
      prenom: "Hotel",
      ayantsDroits: [
        {
          uuid: "",
          lien: "ENFANT",
          nom: "Usager",
          prenom: "Petit",
          dateNaissance: new Date("2020-01-01"),
        },
        {
          uuid: "",
          lien: "CONJOINT",
          nom: "Hotel",
          prenom: "Conjointe",
          dateNaissance: new Date("1992-07-14"),
        },
      ],
    });

    // C is already linked to E before the tests start, to check the
    // "already linked to someone else" behavior in search/link.
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

  describe("ayants droit de toute sorte", () => {
    it("aucune suggestion quand le dossier n'a que des ayants droit ENFANT / PARENT / AUTRE", async () => {
      expect(usagerG.ayantsDroits.map((a) => a.lien).sort()).toEqual(
        ["AUTRE", "ENFANT", "PARENT"].sort()
      );

      const response = await AppTestHttpClient.get(
        `${ENDPOINT}/${usagerG.ref}/suggestion`,
        { context }
      );
      expect(response.status).toBe(200);
      expectNullBody(response);
    });

    it("un dossier sans lien reste lisible et sans conjoint quels que soient ses ayants droit", async () => {
      const response = await AppTestHttpClient.get(
        `${ENDPOINT}/${usagerG.ref}`,
        { context }
      );
      expect(response.status).toBe(200);
      expectNullBody(response);
    });

    it("la suggestion cible le CONJOINT et ignore les autres ayants droit du même dossier", async () => {
      const ayantDroitEnfant = usagerH.ayantsDroits.find(
        (a) => a.lien === "ENFANT"
      );
      const ayantDroitConjoint = usagerH.ayantsDroits.find(
        (a) => a.lien === "CONJOINT"
      );
      expect(ayantDroitEnfant).toBeDefined();
      expect(ayantDroitConjoint).toBeDefined();

      const response = await AppTestHttpClient.get(
        `${ENDPOINT}/${usagerH.ref}/suggestion`,
        { context }
      );
      expect(response.status).toBe(200);
      expect(response.body.candidate.uuid).toEqual(usagerI.uuid);
      expect(response.body.ayantDroitUuid).toEqual(ayantDroitConjoint.uuid);
      expect(response.body.ayantDroitUuid).not.toEqual(ayantDroitEnfant.uuid);
    });

    it("relier H et I fonctionne normalement malgré l'ayant droit ENFANT présent sur H", async () => {
      const linkResponse = await AppTestHttpClient.post(
        `${ENDPOINT}/${usagerH.ref}/link`,
        {
          context,
          body: { targetUsagerUuid: usagerI.uuid, acceptedSuggestion: true },
        }
      );
      expect(linkResponse.status).toBe(201);
      expect(linkResponse.body.linkedUsager.uuid).toEqual(usagerI.uuid);

      const sideI = await AppTestHttpClient.get(`${ENDPOINT}/${usagerI.ref}`, {
        context,
      });
      expect(sideI.body.linkedUsager.uuid).toEqual(usagerH.uuid);

      const unlinkResponse = await AppTestHttpClient.delete(
        `${ENDPOINT}/${usagerH.ref}`,
        { context }
      );
      expect(unlinkResponse.status).toBe(200);
    });

    it("refuse de créer un dossier avec deux ayants droit CONJOINT", async () => {
      const response = await AppTestHttpClient.post("/usagers", {
        context,
        body: buildUsagerPayload({
          nom: "Usager",
          prenom: "Juliett",
          ayantsDroits: [
            {
              uuid: "",
              lien: "CONJOINT",
              nom: "Un",
              prenom: "Premier",
              dateNaissance: new Date("1980-01-01"),
            },
            {
              uuid: "",
              lien: "CONJOINT",
              nom: "Deux",
              prenom: "Second",
              dateNaissance: new Date("1981-01-01"),
            },
          ],
        }),
      });
      expect(response.status).toBe(400);
    });
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
