import { createReducer, on } from "@ngrx/store";
import { UsagerLight } from "../../../_common/model";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";
import { cacheManager } from "./ngRxUsagersCache.service";
import { INITIAL_STATE } from "./INITIAL_STATE.const";
import {
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
  INTERACTIONS_IN,
  getRdvInfos,
  Usager,
} from "@domifa/common";
import { getEcheanceInfos } from "../../modules/usager-shared/utils";
import {
  Options,
  UsagerFormModel,
} from "../../modules/usager-shared/interfaces";

export const _usagerReducer = createReducer(
  INITIAL_STATE,
  on(cacheManager.clearCache, () => ({ ...INITIAL_STATE })),

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

  on(cacheManager.updateUsagerNotes, (state, { ref, nbNotes }) => ({
    ...state,
    usagersByRefMap: {
      ...state.usagersByRefMap,
      [ref]: {
        ...state.usagersByRefMap[ref],
        nbNotes,
      },
    },
  })),
  on(cacheManager.updateUsager, (state, action) => {
    const usager = new UsagerFormModel(action.usager) as unknown as UsagerLight;

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
      ...usager,
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
  on(cacheManager.deleteUsagers, (state, action) => {
    const { usagerRefs } = action;
    const usagersByRefMap = { ...state.usagersByRefMap };
    let searchPageLoadedUsagersData = state.searchPageLoadedUsagersData;

    usagerRefs.forEach((ref) => {
      delete usagersByRefMap[ref];
      searchPageLoadedUsagersData = deleteSearchPageLoadedUsagersDataUsager({
        initialData: searchPageLoadedUsagersData,
        usagerRef: ref,
      });
    });

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
      [usager.ref]: setUsagerInformations(usager),
    };

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

  const usagersNonRadies = isRadie
    ? searchPageLoadedUsagersData.usagersNonRadies
    : searchPageLoadedUsagersData.usagersNonRadies.concat([usager]);
  searchPageLoadedUsagersData.usagersNonRadies =
    searchPageLoadedUsagersData.usagersNonRadies ? usagersNonRadies : [];

  const usagersRadiesFirsts = !isRadie
    ? searchPageLoadedUsagersData.usagersRadiesFirsts
    : searchPageLoadedUsagersData.usagersRadiesFirsts.concat([usager]);
  searchPageLoadedUsagersData.usagersRadiesFirsts =
    searchPageLoadedUsagersData.usagersRadiesFirsts ? usagersRadiesFirsts : [];

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
export const setUsagerInformations = (usager: Usager): any => {
  let totalInteractionsEnAttente = 0;
  if (usager.lastInteraction) {
    INTERACTIONS_IN.forEach((interaction) => {
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
    rdvInfos: getRdvInfos({
      rdv: usager.rdv,
      etapeDemande: usager.etapeDemande,
    }),
    totalInteractionsEnAttente,
    historique: [],
    options: new Options(usager.options),
    rdv: null,
    entretien: null,
  };
};
