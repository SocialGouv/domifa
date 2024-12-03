import { searchChunks } from "./searchChunks";
import { buildWords, clean } from "./searchCore";

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
    const newScore = cleanAttributes.reduce((score: number, attr) => {
      if (!attr) {
        return score;
      }
      const matchElement = attr.includes(word);
      if (matchElement) {
        if (attr === word) {
          // perfect match
          return score + 50;
        } else if (attr.startsWith(word)) {
          // starts with match
          return score + 10;
        } else {
          return score + 1;
        }
      }
      return score;
    }, 0);
    return {
      match: newScore !== 0,
      score: newScore,
    };
  } else {
    const firstMatchingAttribute = cleanAttributes.find((attr: string) => {
      if (!attr) {
        return false;
      }
      return clean(attr as unknown as string).includes(word);
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

  const attributes: string[] = getAttributes(item, index) ?? [];
  const cleanAttributes: string[] = ([] as string[]).concat(
    ...attributes
      .filter((x) => x !== null && x !== undefined && x.trim().length !== 0)
      .map((x) => buildWords(x))
  );

  if (!cleanAttributes?.length) {
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

export const search = {
  match,
  contentChunks: searchChunks.find,
};
