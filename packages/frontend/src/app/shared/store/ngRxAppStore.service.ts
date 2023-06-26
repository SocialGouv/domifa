import { createReducer, on } from "@ngrx/store";
import { UsagerLight } from "../../../_common/model";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";
import { cacheManager } from "./ngRxUsagersCache.service";
import {
  getEcheanceInfos,
  getRdvInfos,
  getUrlUsagerProfil,
} from "../../modules/usager-shared/utils";
import { INITIAL_STATE } from "./INITIAL_STATE.const";

export const _usagerReducer = createReducer(
  INITIAL_STATE,
  on(cacheManager.clearCache, () => INITIAL_STATE),

  on(cacheManager.setSearchPageLoadedUsagersData, (state, action) => {
    return {
      ...state,
      searchPageLoadedUsagersData: action.searchPageLoadedUsagersData,
      usagersByRefMap: action.searchPageLoadedUsagersData.usagersNonRadies
        .concat(action.searchPageLoadedUsagersData.usagersRadiesFirsts)
        .reduce((acc, u) => {
          acc[u.ref] = u;
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
          nom: action.notes.toString(),
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

    usagersByRefMap[usager.ref] = { ...usager, nbNotes };
    if (state.searchPageLoadedUsagersData) {
      // first delete usager, then add-it, in case decision.status has changed
      const searchPageLoadedUsagersData = addUsagerToStore({
        initialData: deleteSearchPageLoadedUsagersDataUsager({
          initialData: state.searchPageLoadedUsagersData,
          attributes: ["ref"],
          usagerRef: usager.ref,
        }),
        usager,
      });

      return {
        ...state,
        usagersByRefMap,
        searchPageLoadedUsagersData,
      };
    } else {
      return {
        ...state,
        usagersByRefMap,
      };
    }
  }),

  on(cacheManager.updateUsagers, (state, action) => {
    const usagers = action.usagers;

    // always update map
    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };

    usagers.forEach((usager) => {
      usagersByRefMap[usager.ref] = usager;
    });

    if (state.searchPageLoadedUsagersData) {
      // first delete usager, then add-it, in case decision.status has changed
      let searchPageLoadedUsagersData = state.searchPageLoadedUsagersData;

      usagers.forEach((usager) => {
        searchPageLoadedUsagersData = addUsagerToStore({
          initialData: deleteSearchPageLoadedUsagersDataUsager({
            initialData: searchPageLoadedUsagersData,
            attributes: ["ref"],
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
    } else {
      return {
        ...state,
        usagersByRefMap,
      };
    }
  }),
  on(cacheManager.deleteUsager, (state, action) => {
    const attributes = Object.keys(action.usagerRef);

    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };

    if (usagersByRefMap) {
      delete usagersByRefMap[action.usagerRef];
    }

    if (state.searchPageLoadedUsagersData) {
      // list data loaded
      const searchPageLoadedUsagersData =
        deleteSearchPageLoadedUsagersDataUsager({
          initialData: state.searchPageLoadedUsagersData,
          attributes,
          usagerRef: action.usagerRef,
        });
      return {
        ...state,
        usagersByRefMap,
        searchPageLoadedUsagersData,
      };
    } else {
      return {
        ...state,
        usagersByRefMap,
      };
    }
  }),
  on(cacheManager.addUsager, (state, action) => {
    const usager = { ...action.usager };
    const usagersByRefMap = {
      ...state.usagersByRefMap,
    };
    usager.echeanceInfos = getEcheanceInfos(usager);
    usager.rdvInfos = getRdvInfos(usager);
    usager.usagerProfilUrl = getUrlUsagerProfil(usager);
    usagersByRefMap[usager.ref] = usager;

    if (state.searchPageLoadedUsagersData) {
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
    } else {
      return {
        ...state,
        usagersByRefMap,
      };
    }
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
  attributes,
  usagerRef,
}: {
  initialData: SearchPageLoadedUsagersData;
  attributes: string[];
  usagerRef: number;
}): SearchPageLoadedUsagersData {
  const searchPageLoadedUsagersData = {
    ...initialData,
  };

  searchPageLoadedUsagersData.usagersNonRadies =
    searchPageLoadedUsagersData.usagersNonRadies.filter((u: UsagerLight) =>
      attributes.some(() => usagerRef !== u.ref)
    );

  searchPageLoadedUsagersData.usagersRadiesFirsts =
    searchPageLoadedUsagersData.usagersRadiesFirsts.filter((u: UsagerLight) =>
      attributes.some(() => usagerRef !== u.ref)
    );

  searchPageLoadedUsagersData.usagersRadiesTotalCount +=
    searchPageLoadedUsagersData.usagersRadiesFirsts.length -
    initialData.usagersRadiesFirsts.length;

  return searchPageLoadedUsagersData;
}
