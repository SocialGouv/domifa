import { UsagersModule } from "./../../usagers.module";
import { UsersModule } from "../../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
  JEST_FAKE_TIMER,
} from "../../../util/test";

import { UsagersController } from "../usagers.controller";

import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { POST_USAGER } from "../../../_common/mocks";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { InteractionsModule } from "../../../modules/interactions/interactions.module";
import { UsagersService, UsagerOptionsHistoryService } from "../../services";
import { UsagerHistoryStateService } from "../../services/usagerHistoryState.service";
import { FileManagerService } from "../../../util/file-manager/file-manager.service";
import { Usager } from "@domifa/common";

const ENDPOINT = "/usagers";

describe("Usagers Controller", () => {
  let controller: UsagersController;
  let context: AppTestContext;

  afterAll(async () => {
    jest.useRealTimers();
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    jest
      .useFakeTimers(JEST_FAKE_TIMER)
      .setSystemTime(new Date("2021-09-23T09:45:30.000Z"));

    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [UsagersController],
        imports: [UsagersModule, UsersModule, InteractionsModule],
        providers: [
          UsagersService,
          UsagerOptionsHistoryService,
          AppLogsService,
          UsagerHistoryStateService,
          FileManagerService,
        ],
      },
      { initApp: true }
    );

    const authInfo =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateStructure(authInfo, { context });

    controller = context.module.get<UsagersController>(UsagersController);
  });

  it("Start component", async () => {
    expect(controller).toBeDefined();
  });

  describe("> Création d'un domicilié", () => {
    it("✅ OK", async () => {
      const response = await AppTestHttpClient.post(ENDPOINT, {
        context,
        body: POST_USAGER.payload,
      });
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();

      const usager: Usager = response.body;
      const exceptedResponse: Usager = POST_USAGER.response;
      // Test des dates
      expect(new Date(usager.decision.dateDebut)).toEqual(new Date());
      expect(new Date(usager.decision.dateFin)).toEqual(new Date());
      expect(new Date(usager.decision.dateDecision)).toEqual(new Date());
      expect(new Date(usager.historique[0].dateDecision)).toEqual(new Date());

      expect(usager.typeDom).toEqual("PREMIERE_DOM");
      expect(usager.decision.typeDom).toEqual("PREMIERE_DOM");
      expect(usager.historique[0].typeDom).toEqual("PREMIERE_DOM");

      expect(usager.nom).toEqual(exceptedResponse.nom);
      expect(usager.prenom).toEqual(exceptedResponse.prenom);
      expect(usager.surnom).toEqual(exceptedResponse.surnom);

      expect(usager.ayantsDroits[0].nom).toEqual(
        exceptedResponse.ayantsDroits[0].nom
      );

      expect(usager.ayantsDroits[0].prenom).toEqual(
        exceptedResponse.ayantsDroits[0].prenom
      );
      expect(usager.ayantsDroits.length).toEqual(1);
      expect(usager.historique.length).toEqual(1);

      expect(usager.email).toEqual("test@test.fr");

      const responseDelete = await AppTestHttpClient.delete(
        ENDPOINT + "/" + usager.ref.toString(),
        {
          context,
        }
      );

      expect(responseDelete.status).toBe(200);
      expect(responseDelete.body).toBeDefined();
    });

    it("✅ OK avec datas supplémentaires qu'il ne faut pas récupérer", async () => {
      const OK_DATAS_SUPP: any = {
        ...POST_USAGER.payload,
        decision: {
          dateDebut: "2010-01-20T09:45:30.000Z",
          dateFin: "2010-01-20T09:45:30.000Z",
          dateDecision: "2010-01-20T09:45:30.000Z",
        },
      };

      const response = await AppTestHttpClient.post(ENDPOINT, {
        context,
        body: OK_DATAS_SUPP,
      });
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();

      const usager: Usager = response.body;

      // Test des dates
      expect(new Date(usager.decision.dateDebut)).toEqual(new Date());
      expect(new Date(usager.decision.dateFin)).toEqual(new Date());
      expect(new Date(usager.decision.dateDecision)).toEqual(new Date());
      expect(new Date(usager.historique[0].dateDecision)).toEqual(new Date());

      const responseDelete = await AppTestHttpClient.delete(
        ENDPOINT + "/" + usager.ref.toString(),
        {
          context,
        }
      );

      expect(responseDelete.status).toBe(200);
      expect(responseDelete.body).toBeDefined();
    });

    it("❌ Données manquantes", async () => {
      const NOT_OK = { ...POST_USAGER.payload };
      delete NOT_OK.prenom;

      const response = await AppTestHttpClient.post(ENDPOINT, {
        context,
        body: NOT_OK,
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
    });
  });

  describe("> Edition d'un domicilié", () => {
    let usagerPatch: Usager = null;

    // Créer le dossier
    beforeAll(async () => {
      const response = await AppTestHttpClient.post(ENDPOINT, {
        context,
        body: POST_USAGER.payload,
      });

      usagerPatch = response.body;
    });

    // Supprimer le dossier
    afterAll(async () => {
      await AppTestHttpClient.delete(
        ENDPOINT + "/" + usagerPatch.ref.toString(),
        {
          context,
        }
      );
    });

    it("✅ Patch Infos générales OK", async () => {
      const response = await AppTestHttpClient.patch(
        ENDPOINT + "/" + usagerPatch.ref,
        {
          context,
          body: {
            ayantsDroits: [],
            ayantsDroitsExist: false,
            customRef: "265",
            dateNaissance: "1995-06-01",
            email: "",
            ref: 265,
            langue: "",
            nom: "Rami",
            telephone: { countryCode: "fr", numero: "0600000001" },
            prenom: "Phill",
            sexe: "homme",
            surnom: "",
            contactByPhone: false,
            villeNaissance: "Pakistan",
            etapeDemande: 3,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const updatedUsager: Usager = response.body;
      expect(updatedUsager.nom).toEqual("Rami");
      expect(updatedUsager.etapeDemande).toEqual(1);
      expect(updatedUsager.telephone.numero).toEqual("0600000001");
      expect(updatedUsager.ayantsDroits.length).toEqual(0);
    });

    it("✅ Patch Infos générales OK", async () => {
      const response = await AppTestHttpClient.patch(
        ENDPOINT + "/" + usagerPatch.ref,
        {
          context,
          body: {
            ayantsDroits: [
              {
                lien: "ENFANT",
                nom: "Moni ",
                prenom: "Mour ",
                dateNaissance: "1999-10-10T00:00:00.000Z",
              },
              {
                lien: "PARENT",
                nom: "Zer",
                prenom: "Moki",
                dateNaissance: "1922-05-04T00:00:00.000Z",
              },
            ],
            telephone: { countryCode: "fr", numero: "" },
            contactByPhone: false,
            ayantsDroitsExist: false,
            customRef: "2022_1_2",
            dateNaissance: "1995-06-01",
            ref: 199999, // Fausse Ref
            nom: "Rami",
            prenom: "Phill",
            sexe: "homme",
            villeNaissance: "Pakistan",
            etapeDemande: 3,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      const updatedUsager: Usager = response.body;
      expect(updatedUsager.nom).toEqual("Rami");
      expect(updatedUsager.ref).toEqual(usagerPatch.ref);
      expect(updatedUsager.etapeDemande).toEqual(1);
      expect(updatedUsager.customRef).toEqual("2022_1_2");
      expect(updatedUsager.ayantsDroits.length).toEqual(2);
      expect(updatedUsager.ayantsDroits[0].nom).toEqual("Moni");
    });
  });
});
