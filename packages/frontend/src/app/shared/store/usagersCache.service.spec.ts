/* eslint-disable @typescript-eslint/no-explicit-any */
import { UsagerLight } from "../../../_common/model";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";
import { usagersCache } from "./usagersCache.service";

const initialStateUsagers: Partial<UsagerLight>[] = [
  {
    uuid: "1",
    ref: 1,
    prenom: "John",
    nom: "Smith",
    decision: {
      statut: "VALIDE",
    } as any,
  },
  {
    uuid: "2",
    ref: 2,
    prenom: "Marie",
    nom: "Smith",
    decision: {
      statut: "VALIDE",
    } as any,
  },
  {
    uuid: "3",
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
    decision: {
      statut: "RADIE",
    } as any,
  },
];

const usagersNonRadies = initialStateUsagers.filter(
  (x) => x.decision.statut !== "RADIE"
) as UsagerLight[];
const usagersRadiesFirsts = initialStateUsagers.filter(
  (x) => x.decision.statut === "RADIE"
) as UsagerLight[];

const INITIAL_TOTAL_COUNT = 500;

const initialState: SearchPageLoadedUsagersData = {
  usagersNonRadies,
  usagersRadiesFirsts,
  usagersRadiesTotalCount: INITIAL_TOTAL_COUNT,
};

it("usagersCache: set initial state", () => {
  expect(
    usagersCache.getSnapshot().searchPageLoadedUsagersData
  ).toBeUndefined();
  usagersCache.setSearchPageLoadedUsagersData(initialState);
  const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
  expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT);
  expect(data).toEqual(initialState);
});

it("usagersCache: update", () => {
  usagersCache.setSearchPageLoadedUsagersData(initialState);
  usagersCache.updateUsager({
    uuid: "2",
    ref: 2,
    prenom: "Maria",
    nom: "Smith",
    decision: {
      statut: "VALIDE",
    } as any,
  } as UsagerLight);
  const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
  expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT);
  expect(data.usagersNonRadies.concat(data.usagersRadiesFirsts)).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "2",
      ref: 2,
      prenom: "Maria",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
      decision: {
        statut: "RADIE",
      },
    },
  ]);
});
it("usagersCache: update VALIDE => RADIE", () => {
  usagersCache.setSearchPageLoadedUsagersData(initialState);
  usagersCache.updateUsager({
    uuid: "2",
    ref: 2,
    prenom: "Marie",
    nom: "Smith",
    decision: {
      statut: "RADIE",
    } as any,
  } as UsagerLight);
  const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
  expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT + 1); // 1 radié de plus
  expect(data.usagersNonRadies.concat(data.usagersRadiesFirsts)).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
      decision: {
        statut: "RADIE",
      },
    },
    {
      uuid: "2",
      ref: 2,
      prenom: "Marie",
      nom: "Smith",
      decision: {
        statut: "RADIE",
      },
    },
  ]);
});

it("usagersCache: update RADIE => VALIDE", () => {
  usagersCache.setSearchPageLoadedUsagersData(initialState);
  usagersCache.updateUsager({
    uuid: "3",
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
    decision: {
      statut: "VALIDE",
    } as any,
  } as UsagerLight);
  const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
  expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT - 1); // 1 radié de moins
  expect(data.usagersNonRadies.concat(data.usagersRadiesFirsts)).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "2",
      ref: 2,
      prenom: "Marie",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
      decision: {
        statut: "VALIDE",
      },
    },
  ]);
});

it("usagersCache: create", () => {
  usagersCache.setSearchPageLoadedUsagersData(initialState);
  usagersCache.createUsager({
    uuid: "4",
    ref: 4,
    prenom: "Jo",
    nom: "Ker",
    decision: {
      statut: "RADIE",
    },
  } as UsagerLight);
  const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
  expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT + 1);
  expect(data.usagersNonRadies.concat(data.usagersRadiesFirsts)).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "2",
      ref: 2,
      prenom: "Marie",
      nom: "Smith",
      decision: {
        statut: "VALIDE",
      },
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
      decision: {
        statut: "RADIE",
      },
    },
    {
      uuid: "4",
      ref: 4,
      prenom: "Jo",
      nom: "Ker",
      decision: {
        statut: "RADIE",
      },
    },
  ]);
});

it("usagersCache: remove by ref", () => {
  usagersCache.setSearchPageLoadedUsagersData(initialState);

  {
    usagersCache.removeUsager({
      ref: 2,
    });
    const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
    expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT); // ce n'est pas un radié que l'on a supprimé
    expect(data.usagersNonRadies.concat(data.usagersRadiesFirsts)).toEqual([
      {
        uuid: "1",
        ref: 1,
        prenom: "John",
        nom: "Smith",
        decision: {
          statut: "VALIDE",
        },
      },
      {
        uuid: "3",
        ref: 3,
        prenom: "Claire",
        nom: "Meunier",
        decision: {
          statut: "RADIE",
        },
      },
    ]);
  }
  {
    usagersCache.removeUsager({
      ref: 3,
    });
    const data = usagersCache.getSnapshot().searchPageLoadedUsagersData;
    expect(data.usagersRadiesTotalCount).toEqual(INITIAL_TOTAL_COUNT - 1); // c'est un radié que l'on a supprimé
    expect(data.usagersNonRadies.concat(data.usagersRadiesFirsts)).toEqual([
      {
        uuid: "1",
        ref: 1,
        prenom: "John",
        nom: "Smith",
        decision: {
          statut: "VALIDE",
        },
      },
    ]);
  }
});
