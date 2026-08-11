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
// ne porte que sur les bornes des requêtes : on neutralise cette chaîne.
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
  SearchUsagersController,
} from "../search-usagers.controller";
import { UserStructureAuthenticated } from "../../../_common/model";

const user = { structureId: 42 } as UserStructureAuthenticated;

const mockedRepository = usagerRepository as unknown as {
  find: jest.Mock;
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
};

// Un pod backend gèle plusieurs minutes dès qu'une requête charge la totalité
// des usagers d'une grosse structure. Ces tests verrouillent l'invariant : plus
// aucun chemin de ces deux endpoints ne part en base sans limite de lignes.
describe("SearchUsagersController — bornes de chargement", () => {
  let controller: SearchUsagersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SearchUsagersController();
  });

  describe("findAllByStructure", () => {
    beforeEach(() => {
      mockedRepository.find.mockResolvedValue([]);
      mockedRepository.count.mockResolvedValue(0);
    });

    it("borne les radiés chargés quand chargerTousRadies vaut false", async () => {
      await controller.findAllByStructure(false, user);

      const radiesQuery = mockedRepository.find.mock.calls.find(
        ([options]) => options.where.statut === "RADIE"
      )[0];
      expect(radiesQuery.take).toBe(MAX_USAGERS_RADIES_PREVIEW);
    });

    it("borne les radiés chargés même quand chargerTousRadies vaut true", async () => {
      await controller.findAllByStructure(true, user);

      const radiesQuery = mockedRepository.find.mock.calls.find(
        ([options]) => options.where.statut === "RADIE"
      )[0];
      expect(radiesQuery.take).toBe(MAX_USAGERS_RADIES_LOADED);
      expect(radiesQuery.take).toBeDefined();
    });

    it("compte les radiés en base au lieu de renvoyer le nombre chargé", async () => {
      // Plus de radiés en base que la borne : le total affiché doit rester exact.
      mockedRepository.find.mockResolvedValue([{ uuid: "a" }, { uuid: "b" }]);
      mockedRepository.count.mockResolvedValue(53000);

      const result = await controller.findAllByStructure(true, user);

      expect(mockedRepository.count).toHaveBeenCalledTimes(1);
      expect(result.usagersRadiesTotalCount).toBe(53000);
    });
  });

  describe("searchInRadies", () => {
    let query: {
      select: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      take: jest.Mock;
      getRawMany: jest.Mock;
    };

    beforeEach(() => {
      query = {
        select: jest.fn(() => query),
        where: jest.fn(() => query),
        andWhere: jest.fn(() => query),
        take: jest.fn(() => query),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockedRepository.createQueryBuilder.mockReturnValue(query);
    });

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
