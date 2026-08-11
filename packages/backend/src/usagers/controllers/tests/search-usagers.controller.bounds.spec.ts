import { CriteriaSearchField } from "@domifa/common";

jest.mock("../../../database", () => ({
  USAGER_LIGHT_ATTRIBUTES: ["uuid", "nom"],
  joinSelectFields: (fields: string[]) => fields,
  usagerRepository: {
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  },
}));

// Les guards et décorateurs d'authentification tirent toute la configuration
// applicative (OTP, SMTP, connexion Postgres) au chargement du module. Ce test
// ne porte que sur le coût des requêtes : on neutralise cette chaîne.
jest.mock("../../../auth/guards", () => ({
  AppUserGuard: class AppUserGuard {},
}));

jest.mock("../../../auth/decorators", () => {
  const noopDecoratorFactory = () => (): void => undefined;
  return {
    AllowUserProfiles: noopDecoratorFactory,
    AllowUserStructureRoles: noopDecoratorFactory,
    CurrentUser: noopDecoratorFactory,
  };
});

import { usagerRepository } from "../../../database";
import {
  MAX_USAGERS_RADIES_LOADED,
  MAX_USAGERS_RADIES_PREVIEW,
  MAX_USAGERS_RADIES_SEARCH_RESULTS,
  MAX_USAGERS_RADIES_SEARCH_RESULTS_WITHOUT_CRITERIA,
  MAX_USAGERS_UPDATE_MANAGE,
  SearchUsagersController,
} from "../search-usagers.controller";
import { UserStructureAuthenticated } from "../../../_common/model";

const user = { structureId: 42 } as UserStructureAuthenticated;

const mockedRepository = usagerRepository as unknown as {
  find: jest.Mock;
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
};

const findCallForRadies = () =>
  mockedRepository.find.mock.calls.find(
    ([options]) => options.where.statut === "RADIE"
  )[0];

// Un pod backend gèle plusieurs minutes dès qu'une requête charge assez
// d'usagers pour saturer le thread principal : la file d'attente ne se vide
// plus et le process ne répond plus à rien, /healthz compris. Ces tests
// verrouillent le coût maximal des requêtes de ce contrôleur.
//
// Une limite sans ordre n'en est pas une : Postgres rend les lignes dans
// l'ordre du tas, qu'un UPDATE déplace, si bien que la fenêtre changerait
// toute seule d'un appel à l'autre. L'ordre déterministe est donc testé au
// même titre que la borne.
describe("SearchUsagersController — coût des requêtes", () => {
  let controller: SearchUsagersController;
  let query: {
    select: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    take: jest.Mock;
    limit: jest.Mock;
    getRawMany: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SearchUsagersController();
    query = {
      select: jest.fn(() => query),
      where: jest.fn(() => query),
      andWhere: jest.fn(() => query),
      orderBy: jest.fn(() => query),
      take: jest.fn(() => query),
      limit: jest.fn(() => query),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    mockedRepository.createQueryBuilder.mockReturnValue(query);
  });

  describe("findAllByStructure", () => {
    beforeEach(() => {
      mockedRepository.find.mockResolvedValue([]);
      mockedRepository.count.mockResolvedValue(0);
    });

    it("borne les radiés chargés quand chargerTousRadies vaut false", async () => {
      await controller.findAllByStructure(false, user);

      expect(findCallForRadies().take).toBe(MAX_USAGERS_RADIES_PREVIEW);
    });

    it("borne les radiés chargés même quand chargerTousRadies vaut true", async () => {
      await controller.findAllByStructure(true, user);

      expect(findCallForRadies().take).toBe(MAX_USAGERS_RADIES_LOADED);
    });

    it("ordonne les radiés pour que la fenêtre bornée soit stable", async () => {
      await controller.findAllByStructure(true, user);

      expect(findCallForRadies().order).toEqual({ ref: "DESC" });
    });

    it("compte les radiés en base au lieu de renvoyer le nombre chargé", async () => {
      // Plus de radiés en base que la borne : le total affiché doit rester exact,
      // c'est lui qui permet à l'interface de signaler que la liste est tronquée.
      mockedRepository.find.mockResolvedValue([{ uuid: "a" }, { uuid: "b" }]);
      mockedRepository.count.mockResolvedValue(53000);

      const result = await controller.findAllByStructure(true, user);

      expect(mockedRepository.count).toHaveBeenCalledTimes(1);
      expect(result.usagersRadiesTotalCount).toBe(53000);
    });

    it("ne garde que les champs utiles de l'historique", async () => {
      mockedRepository.find.mockResolvedValue([
        {
          uuid: "a",
          historique: [
            {
              statut: "VALIDE",
              dateDecision: "2026-01-01",
              dateDebut: "2026-01-01",
              dateFin: "2027-01-01",
              motifDetails: "texte libre volumineux",
              userName: "agent",
            },
          ],
        },
      ]);

      const result = await controller.findAllByStructure(false, user);

      expect(result.usagers[0].historique[0]).toEqual({
        statut: "VALIDE",
        dateDecision: "2026-01-01",
        dateDebut: "2026-01-01",
        dateFin: "2027-01-01",
      });
    });

    // Écart assumé et documenté : les non-radiés restent non bornés, c'est la
    // liste principale de l'application et la borner change l'UX. Ce test fige
    // le périmètre réel du correctif pour qu'aucun lecteur ne croie l'endpoint
    // entièrement borné.
    it("laisse volontairement les non-radiés non bornés", async () => {
      await controller.findAllByStructure(false, user);

      const nonRadies = mockedRepository.find.mock.calls.find(
        ([options]) => options.where.statut !== "RADIE"
      )[0];
      expect(nonRadies.take).toBeUndefined();
    });
  });

  describe("updateManage", () => {
    it("borne et ordonne le rafraîchissement automatique", async () => {
      await controller.updateManage(user);

      expect(query.limit).toHaveBeenCalledWith(MAX_USAGERS_UPDATE_MANAGE);
      expect(query.orderBy).toHaveBeenCalledWith('"updatedAt"', "DESC");
    });

    it("rogne l'historique, que le chemin principal filtrait déjà", async () => {
      query.getRawMany.mockResolvedValue([
        {
          uuid: "a",
          historique: [
            {
              statut: "RADIE",
              dateDecision: "2026-01-01",
              dateDebut: null,
              dateFin: null,
              motifDetails: "texte libre volumineux",
            },
          ],
        },
      ]);

      const result = await controller.updateManage(user);

      expect(result[0].historique[0]).toEqual({
        statut: "RADIE",
        dateDecision: "2026-01-01",
        dateDebut: null,
        dateFin: null,
      });
    });
  });

  describe("searchInRadies", () => {
    it("borne la recherche sans aucun critère", async () => {
      await controller.searchInRadies({} as never, user);

      expect(query.take).toHaveBeenCalledWith(
        MAX_USAGERS_RADIES_SEARCH_RESULTS_WITHOUT_CRITERIA
      );
    });

    it("borne la recherche portant un critère texte", async () => {
      await controller.searchInRadies(
        {
          searchString: "a",
          searchStringField: CriteriaSearchField.DEFAULT,
        } as never,
        user
      );

      expect(query.take).toHaveBeenCalledWith(
        MAX_USAGERS_RADIES_SEARCH_RESULTS
      );
    });

    it.each([
      ["echeance", { echeance: "EXCEEDED" }],
      ["entretien", { entretien: "COMING" }],
      ["referrerId", { referrerId: null }],
      ["lastInteractionDate", { lastInteractionDate: "PREVIOUS_TWO_MONTHS" }],
    ])("borne la recherche portant le critère %s", async (_label, search) => {
      await controller.searchInRadies(search as never, user);

      expect(query.take).toHaveBeenCalledWith(
        MAX_USAGERS_RADIES_SEARCH_RESULTS
      );
    });

    it("ordonne les résultats pour que la même recherche rende les mêmes personnes", async () => {
      await controller.searchInRadies(
        {
          searchString: "a",
          searchStringField: CriteriaSearchField.DEFAULT,
        } as never,
        user
      );

      expect(query.orderBy).toHaveBeenCalledWith('usager."ref"', "DESC");
    });

    it("applique toujours une limite, quel que soit le critère", async () => {
      await controller.searchInRadies(
        {
          searchString: "a",
          searchStringField: CriteriaSearchField.DEFAULT,
        } as never,
        user
      );

      expect(query.take).toHaveBeenCalledTimes(1);
      expect(query.getRawMany).toHaveBeenCalledTimes(1);
    });
  });
});
