import { createStore } from "redux";
import { UsagerLight } from "../../../_common/model";
import { AppStoreAction } from "./AppStoreAction.type";
import {
  AppStoreModel,
  SearchPageLoadedUsagersData,
} from "./AppStoreModel.type";

const INITIAL_STATE: AppStoreModel = {
  searchPageLoadedUsagersData: undefined,
  usagersByRefMap: {},
  interactionsByRefMap: {},
};

const appStoreReducer = (
  state: AppStoreModel,
  action: AppStoreAction
): AppStoreModel => {
  switch (action.type) {
    case "set-search-page-usagers": {
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
    }
    case "update-usager": {
      const usager = action.usager;

      // always update map
      const usagersByRefMap = {
        ...state.usagersByRefMap,
      };

      usagersByRefMap[usager.ref] = usager;

      if (state.searchPageLoadedUsagersData) {
        // first delete usager, then add-it, in case decision.status has changed
        const searchPageLoadedUsagersData = addUsager({
          initialData: deleteSearchPageLoadedUsagersDataUsager({
            initialData: state.searchPageLoadedUsagersData,
            attributes: ["ref"],
            criteria: { ref: usager.ref },
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
    }
    case "update-usagers": {
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
          searchPageLoadedUsagersData = addUsager({
            initialData: deleteSearchPageLoadedUsagersDataUsager({
              initialData: searchPageLoadedUsagersData,
              attributes: ["ref"],
              criteria: { ref: usager.ref },
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
    }

    case "delete-usager": {
      const criteria = action.criteria;
      const attributes = Object.keys(criteria);

      const usagersByRefMap = {
        ...state.usagersByRefMap,
      };

      if (usagersByRefMap) {
        delete usagersByRefMap[criteria.ref];
      }

      if (state.searchPageLoadedUsagersData) {
        // list data loaded
        const searchPageLoadedUsagersData =
          deleteSearchPageLoadedUsagersDataUsager({
            initialData: state.searchPageLoadedUsagersData,
            attributes,
            criteria,
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
    }
    case "add-usager": {
      const usager = action.usager;
      const usagersByRefMap = {
        ...state.usagersByRefMap,
      };
      usagersByRefMap[usager.ref] = usager;

      if (state.searchPageLoadedUsagersData) {
        // list data loaded
        const searchPageLoadedUsagersData = addUsager({
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
    }
    case "reset": {
      return INITIAL_STATE;
    }
  }
  return state;
};

export const appStore = createStore<
  AppStoreModel,
  AppStoreAction,
  unknown,
  unknown
>(appStoreReducer, INITIAL_STATE as AppStoreModel);

function addUsager({
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
  criteria,
}: {
  initialData: SearchPageLoadedUsagersData;
  attributes: string[];
  criteria: Pick<UsagerLight, "ref">;
}): SearchPageLoadedUsagersData {
  const searchPageLoadedUsagersData = {
    ...initialData,
  };

  searchPageLoadedUsagersData.usagersNonRadies =
    searchPageLoadedUsagersData.usagersNonRadies.filter((u: UsagerLight) =>
      attributes.some(() => criteria.ref !== u.ref)
    );

  searchPageLoadedUsagersData.usagersRadiesFirsts =
    searchPageLoadedUsagersData.usagersRadiesFirsts.filter((u: UsagerLight) =>
      attributes.some(() => criteria.ref !== u.ref)
    );

  searchPageLoadedUsagersData.usagersRadiesTotalCount +=
    searchPageLoadedUsagersData.usagersRadiesFirsts.length -
    initialData.usagersRadiesFirsts.length;

  return searchPageLoadedUsagersData;
}
