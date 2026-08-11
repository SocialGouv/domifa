import { CriteriaSearchField, getDecisionDeadline } from "@domifa/common";

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
// Importé par son chemin propre, donc sans passer par le mock du baril
// ci-dessus : c'est bien la vraie liste de colonnes qui est vérifiée.
import { USAGER_LIGHT_ATTRIBUTES } from "../../../database/services/usager/constants/USAGER_LIGHT_ATTRIBUTES.const";
import {
  MAX_USAGERS_RADIES_PREVIEW,
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

const findCallForRadies = () =>
  mockedRepository.find.mock.calls.find(
    ([options]) => options.where.statut === "RADIE"
  )[0];

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
    mockedRepository.find.mockResolvedValue([]);
    mockedRepository.count.mockResolvedValue(0);
  });

  // `setUsagerInformation` remet `historique: []` côté client, ce qui donne
  // l'impression que la colonne est inutile. Elle ne l'est pas : le calcul de
  // l'échéance est fait AVANT, sur l'objet brut, et déréférence
  // `historique.length` sans garde. La retirer fait planter le reducer, donc
  // toute la liste, dès qu'un dossier est en renouvellement non décidé.
  // Ce test rejoue le calcul réel sur la charge utile réellement produite :
  // c'est lui, pas une assertion sur la forme de la constante, qui protège.
  it("produit une charge utile sur laquelle l'échéance reste calculable", async () => {
    expect(USAGER_LIGHT_ATTRIBUTES).toContain("historique");

    // ATTENTE_DECISION lit l'AVANT-dernière entrée : il faut donc au moins deux
    // entrées, sinon ne garder que la dernière — l'optimisation suivante, qui
    // paraît tout aussi évidente — passerait au vert en falsifiant l'échéance.
    mockedRepository.find.mockResolvedValue([
      {
        uuid: "a",
        typeDom: "RENOUVELLEMENT",
        decision: {
          statut: "ATTENTE_DECISION",
          dateDecision: "2026-01-10",
          dateDebut: "2026-01-10",
          dateFin: null,
        },
        historique: [
          {
            statut: "VALIDE",
            dateDecision: "2025-01-10",
            dateDebut: "2025-01-10",
            dateFin: "2026-08-20",
            motifDetails: "texte libre volumineux",
            userName: "agent",
          },
          {
            statut: "INSTRUCTION",
            dateDecision: "2026-01-05",
            dateDebut: "2026-01-05",
            dateFin: null,
            motifDetails: "autre texte libre",
            userName: "agent",
          },
        ],
      },
    ]);

    const result = await controller.findAllByStructure(false, user);
    const usager = result.usagers[0];

    // Le rognage a bien eu lieu, sur toutes les entrées…
    expect(usager.historique).toEqual([
      {
        statut: "VALIDE",
        dateDecision: "2025-01-10",
        dateDebut: "2025-01-10",
        dateFin: "2026-08-20",
      },
      {
        statut: "INSTRUCTION",
        dateDecision: "2026-01-05",
        dateDebut: "2026-01-05",
        dateFin: null,
      },
    ]);
    // …sans casser le calcul qui en dépend, qui remonte ici à l'avant-dernière.
    expect(() => getDecisionDeadline(usager)).not.toThrow();
    expect(getDecisionDeadline(usager).dateToDisplay).toEqual(
      new Date("2026-08-20")
    );
  });

  describe("findAllByStructure", () => {
    it("limite et ordonne l'aperçu des radiés", async () => {
      await controller.findAllByStructure(false, user);

      expect(findCallForRadies().take).toBe(MAX_USAGERS_RADIES_PREVIEW);
      expect(findCallForRadies().order).toEqual({ ref: "DESC" });
    });

    // Aucune limite artificielle : « afficher tous les radiés » les rend tous.
    // C'est la charge par usager qui a été réduite, pas le nombre de dossiers
    // que l'utilisateur a le droit de voir.
    it("rend tous les radiés quand chargerTousRadies vaut true", async () => {
      await controller.findAllByStructure(true, user);

      expect(findCallForRadies().take).toBeUndefined();
      expect(findCallForRadies().order).toBeUndefined();
    });

    it("compte les radiés en base", async () => {
      mockedRepository.count.mockResolvedValue(53000);

      const result = await controller.findAllByStructure(true, user);

      expect(result.usagersRadiesTotalCount).toBe(53000);
    });

    // Sans limite il n'y a pas de fenêtre à stabiliser : y ajouter un ordre
    // faisait basculer le plan en tri sur disque (27 ms -> 81 ms et 34 Mo de
    // fichiers temporaires sur 40 000 actifs), pour rien.
    it("ne trie pas la requête des non-radiés, qui n'est pas limitée", async () => {
      await controller.findAllByStructure(false, user);

      const nonRadies = mockedRepository.find.mock.calls.find(
        ([options]) => options.where.statut !== "RADIE"
      )[0];
      expect(nonRadies.take).toBeUndefined();
      expect(nonRadies.order).toBeUndefined();
    });
  });

  describe("updateManage", () => {
    // Rafraîchissement automatique, toutes les 5 minutes et par onglet ouvert.
    // Ni limite ni tri : une limite tronquerait silencieusement une synchro
    // dont la fenêtre glisse (les lignes écartées ne reviendraient jamais), et
    // `updatedAt` n'étant pas indexé, le tri coûtait des dizaines de Mo de
    // fichiers temporaires à chaque appel.
    it("ne limite ni ne trie la synchronisation", async () => {
      await controller.updateManage(user);

      expect(query.limit).not.toHaveBeenCalled();
      expect(query.take).not.toHaveBeenCalled();
      expect(query.orderBy).not.toHaveBeenCalled();
    });
  });

  describe("searchInRadies", () => {
    it("limite et ordonne l'amorçage sans critère", async () => {
      await controller.searchInRadies({} as never, user);

      expect(query.take).toHaveBeenCalledWith(
        MAX_USAGERS_RADIES_SEARCH_RESULTS_WITHOUT_CRITERIA
      );
      expect(query.orderBy).toHaveBeenCalledWith('usager."ref"', "DESC");
    });

    // La recherche serveur est le seul moyen de retrouver un radié absent de
    // l'aperçu : la tronquer reviendrait à déclarer un dossier introuvable.
    it.each([
      [
        "texte",
        { searchString: "a", searchStringField: CriteriaSearchField.DEFAULT },
      ],
      ["echeance", { echeance: "EXCEEDED" }],
      ["entretien", { entretien: "COMING" }],
      ["referrerId", { referrerId: null }],
      ["lastInteractionDate", { lastInteractionDate: "PREVIOUS_TWO_MONTHS" }],
    ])("rend tous les résultats du critère %s", async (_label, search) => {
      await controller.searchInRadies(search as never, user);

      expect(query.take).not.toHaveBeenCalled();
      expect(query.getRawMany).toHaveBeenCalledTimes(1);
    });
  });
});
