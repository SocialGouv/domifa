import { createReducer, on } from "@ngrx/store";
import { INTERACTIONS_IN_AVAILABLE, UsagerLight } from "../../../_common/model";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";
import { cacheManager } from "./ngRxUsagersCache.service";
import { INITIAL_STATE } from "./INITIAL_STATE.const";
import {
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
} from "@domifa/common";
import {
  getEcheanceInfos,
  getRdvInfos,
  getUrlUsagerProfil,
} from "../../modules/usager-shared/utils";
import { Options } from "../../modules/usager-shared/interfaces";

export const _usagerReducer = createReducer(
  INITIAL_STATE,
  on(cacheManager.clearCache, () => INITIAL_STATE),
  on(cacheManager.setSearchPageLoadedUsagersData, (state, action) => {
    return {
      ...state,
      dataLoaded: true,
      searchPageLoadedUsagersData: action.searchPageLoadedUsagersData,
      usagersByRefMap: action.searchPageLoadedUsagersData.usagersNonRadies
        .concat(action.searchPageLoadedUsagersData.usagersRadiesFirsts)
        .reduce((acc, usager) => {
          acc[usager.ref] = usager;
          return acc;
        }, {} as { [ref: string]: UsagerLight }),
    };
  }),
  on(cacheManager.updateUsagerNotes, (state, action) => {
    return {
      ...state,
      usagersByRefMap: {
        ...state.usagersByRefMap,
        [action.ref]: {
          ...state.usagersByRefMap[action.ref],
          nbNotes: action.nbNotes,
        },
      },
    };
  }),
  on(cacheManager.updateUsager, (state, action) => {
    const usager = action.usager;

    // always update map
    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };

    let nbNotes = usagersByRefMap[usager.ref]?.nbNotes ?? 0;
    const nbNotesAfterUpdate = action.usager?.nbNotes;

    if (nbNotesAfterUpdate) {
      nbNotes = nbNotesAfterUpdate;
    }

    usagersByRefMap[usager.ref] = {
      ...setUsagerInformations(usager),
      nbNotes,
    };

    const searchPageLoadedUsagersData = addUsagerToStore({
      initialData: deleteSearchPageLoadedUsagersDataUsager({
        initialData: state.searchPageLoadedUsagersData,
        usagerRef: usager.ref,
      }),
      usager: usagersByRefMap[usager.ref],
    });

    return {
      ...state,
      usagersByRefMap,
      searchPageLoadedUsagersData,
    };
  }),
  on(cacheManager.updateUsagers, (state, action) => {
    const usagers = action.usagers;

    // always update map
    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };

    usagers.forEach((usager) => {
      usagersByRefMap[usager.ref] = setUsagerInformations(usager);
    });

    let searchPageLoadedUsagersData = state.searchPageLoadedUsagersData;

    usagers.forEach((usager) => {
      searchPageLoadedUsagersData = addUsagerToStore({
        initialData: deleteSearchPageLoadedUsagersDataUsager({
          initialData: searchPageLoadedUsagersData,
          usagerRef: usager.ref,
        }),
        usager,
      });
    });

    return {
      ...state,
      usagersByRefMap,
      searchPageLoadedUsagersData,
    };
  }),
  on(cacheManager.deleteUsagers, (state, action) => {
    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };

    let searchPageLoadedUsagersData = state.searchPageLoadedUsagersData;
    for (const usagerRef of action.usagerRefs) {
      if (usagersByRefMap) {
        delete usagersByRefMap[usagerRef];
      }

      if (state.searchPageLoadedUsagersData) {
        searchPageLoadedUsagersData = deleteSearchPageLoadedUsagersDataUsager({
          initialData: searchPageLoadedUsagersData,
          usagerRef: usagerRef,
        });
      }
    }

    return {
      ...state,
      usagersByRefMap,
      searchPageLoadedUsagersData,
    };
  }),
  on(cacheManager.addUsager, (state, action) => {
    const usager = { ...action.usager };
    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };

    usagersByRefMap[usager.ref] = setUsagerInformations(usager);

    // list data loaded
    const searchPageLoadedUsagersData = addUsagerToStore({
      initialData: state.searchPageLoadedUsagersData,
      usager,
    });
    return {
      ...state,
      usagersByRefMap,
      searchPageLoadedUsagersData,
    };
  })
);

function addUsagerToStore({
  initialData,
  usager,
}: {
  initialData: SearchPageLoadedUsagersData;
  usager: UsagerLight;
}) {
  const searchPageLoadedUsagersData = {
    ...initialData,
  };

  const isRadie = usager.decision?.statut === "RADIE";

  searchPageLoadedUsagersData.usagersNonRadies =
    searchPageLoadedUsagersData.usagersNonRadies
      ? isRadie
        ? searchPageLoadedUsagersData.usagersNonRadies
        : searchPageLoadedUsagersData.usagersNonRadies.concat([usager])
      : [];

  searchPageLoadedUsagersData.usagersRadiesFirsts =
    searchPageLoadedUsagersData.usagersRadiesFirsts
      ? !isRadie
        ? searchPageLoadedUsagersData.usagersRadiesFirsts
        : searchPageLoadedUsagersData.usagersRadiesFirsts.concat([usager])
      : [];

  searchPageLoadedUsagersData.usagersRadiesTotalCount =
    searchPageLoadedUsagersData.usagersRadiesTotalCount +
    searchPageLoadedUsagersData.usagersRadiesFirsts.length -
    initialData.usagersRadiesFirsts.length;

  return searchPageLoadedUsagersData;
}

function deleteSearchPageLoadedUsagersDataUsager({
  initialData,
  usagerRef,
}: {
  initialData: SearchPageLoadedUsagersData;
  usagerRef: number;
}): SearchPageLoadedUsagersData {
  const searchPageLoadedUsagersData = {
    ...initialData,
  };

  searchPageLoadedUsagersData.usagersNonRadies =
    searchPageLoadedUsagersData.usagersNonRadies.filter(
      (u: UsagerLight) => usagerRef !== u.ref
    );

  searchPageLoadedUsagersData.usagersRadiesFirsts =
    searchPageLoadedUsagersData.usagersRadiesFirsts.filter(
      (u: UsagerLight) => usagerRef !== u.ref
    );

  searchPageLoadedUsagersData.usagersRadiesTotalCount +=
    searchPageLoadedUsagersData.usagersRadiesFirsts.length -
    initialData.usagersRadiesFirsts.length;

  return searchPageLoadedUsagersData;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setUsagerInformations = (usager: UsagerLight): any => {
  let totalInteractionsEnAttente = 0;
  if (usager.lastInteraction) {
    INTERACTIONS_IN_AVAILABLE.forEach((interaction) => {
      totalInteractionsEnAttente += usager.lastInteraction[interaction];
    });
  }

  return {
    ...usager,
    statusInfos: {
      text: USAGER_DECISION_STATUT_LABELS[usager?.decision?.statut],
      color: USAGER_DECISION_STATUT_COLORS[usager?.decision?.statut],
    },
    echeanceInfos: getEcheanceInfos(usager),
    rdvInfos: getRdvInfos(usager),
    usagerProfilUrl: getUrlUsagerProfil(usager),
    totalInteractionsEnAttente,
    historique: [],
    options: new Options(usager.options),
    rdv: null,
    entretien: null,
  };
};
