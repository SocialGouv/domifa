import { dataSorter } from "../sorter";
import { searchChunks } from "./searchChunks";
import { searchCore } from "./searchCore";

type MatchWithScoreResults = {
  match: boolean;
  score: number;
};

function matchWord({
  cleanAttributes,
  word,
  withScore,
}: {
  cleanAttributes: string[];
  word: string;
  withScore: boolean;
}): MatchWithScoreResults {
  if (withScore) {
    const score = cleanAttributes.reduce((score, attr) => {
      if (!attr) {
        return score;
      }
      const match = attr.indexOf(word) !== -1;
      if (match) {
        if (attr === word) {
          // perfect match
          return score + 50;
        } else if (attr.indexOf(word) === 0) {
          // starts with match
          return score + 10;
        } else {
          return score + 1;
        }
      }
      return score;
    }, 0);
    return {
      match: score !== 0,
      score,
    };
  } else {
    const firstMatchingAttribute = cleanAttributes.find((attr) => {
      if (!attr) {
        return false;
      }
      return searchCore.clean((attr as unknown) as string).indexOf(word) !== -1;
    });
    if (firstMatchingAttribute !== undefined) {
      return {
        match: true,
        score: 1,
      };
    } else {
      return {
        match: false,
        score: 0,
      };
    }
  }
}

function match<T>(
  item: T,
  {
    index,
    getAttributes,
    words,
    withScore,
  }: {
    index: number;
    getAttributes: (item: T, index?: number) => string[];
    words: string[];
    withScore: boolean;
  }
): MatchWithScoreResults {
  if (!item || !words || !words.length) {
    return {
      match: false,
      score: 0,
    };
  }
  const attributes = getAttributes(item, index) ?? [];
  const cleanAttributes = [].concat(
    ...attributes
      .filter((x) => x !== null && x !== undefined && x.trim().length !== 0)
      .map((x) => searchCore.buildWords(x))
  );
  if (!cleanAttributes || !cleanAttributes.length) {
    return {
      match: false,
      score: 0,
    };
  }
  if (withScore) {
    return words.reduce(
      ({ match, score }, word) => {
        const matchWordResult = matchWord({
          cleanAttributes,
          word,
          withScore,
        });
        return {
          match: match && matchWordResult.match,
          score: score + matchWordResult.score, // si un mot a matché, on calcul quand même un score, ça pourrait permettre de retourner des résultats même si aucun match
        };
      },
      { match: true, score: 0 } as MatchWithScoreResults
    );
  } else {
    const firstNonMatchingWord = words.find((word) => {
      const matchWordResult = matchWord({
        cleanAttributes,
        word,
        withScore,
      });
      return !matchWordResult.match;
    });

    const matchAllWords = firstNonMatchingWord === undefined;
    if (matchAllWords) {
      return {
        match: true,
        score: 1,
      };
    } else {
      return {
        match: false,
        score: 0,
      };
    }
  }
}

function filter<T>(
  items: T[],
  {
    getAttributes,
    searchText,
    maxResults,
    sortResultsByBestMatch,
  }: {
    getAttributes: (item: T, index?: number) => string[];
    searchText: string;
    maxResults?: number;
    sortResultsByBestMatch?: boolean;
  }
): T[] {
  if (!searchText || !searchText.length) {
    return items.concat([]);
  }

  const words = searchCore.buildWords(searchText);
  if (words.length === 0) {
    return items.concat([]);
  }

  if (sortResultsByBestMatch) {
    const itemsWithMatchResults = items.reduce((acc, item, initialIndex) => {
      const matchResult = match(item, {
        index: initialIndex,
        getAttributes,
        words,
        withScore: true,
      });
      if (matchResult.match) {
        acc.push({ item, matchResult, initialIndex });
      }
      return acc;
    }, []);

    const results = dataSorter.sortMultiple(itemsWithMatchResults, {
      getSortAttributes: (itemWithMatchResult) => {
        return [
          {
            // sort by score
            value: itemWithMatchResult.matchResult.score,
            asc: false,
          },
          {
            // then by initial position
            value: itemWithMatchResult.initialIndex,
            asc: true,
          },
        ];
      },
    });

    if (maxResults) {
      return results.slice(0, maxResults).map((result) => result.item);
    }
    return results.map((result) => result.item);
  } else {
    return items.reduce((acc, item, initialIndex) => {
      if (!maxResults || acc.length < maxResults) {
        const matchResult = match(item, {
          index: initialIndex,
          getAttributes,
          words,
          withScore: false,
        });
        if (matchResult.match) {
          acc.push(item);
        }
      }
      return acc;
    }, []);
  }
}

export const search = {
  filter,
  match,
  contentChunks: searchChunks.find,
  clean: searchCore.clean,
  buildWords: searchCore.buildWords,
};
