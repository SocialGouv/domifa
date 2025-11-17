import deepDiff from "deep-diff";
import pick from "lodash.pick";

interface CleanedDiff {
  [key: string]: {
    before: any;
    after: any;
  };
}

export const cleanDiffResults = (diffResults: any[]): CleanedDiff => {
  const cleaned: CleanedDiff = {};

  if (!diffResults) return cleaned;

  diffResults.forEach((diff) => {
    const key = diff.path.join(".");

    switch (diff.kind) {
      case "E": // Edit
        cleaned[key] = {
          before: diff.lhs,
          after: diff.rhs,
        };
        break;
      case "N": // New
        cleaned[key] = {
          before: undefined,
          after: diff.rhs,
        };
        break;
      case "D": // Deleted
        cleaned[key] = {
          before: diff.lhs,
          after: undefined,
        };
        break;
      case "A": // Array
        cleaned[key] = {
          before: diff.lhs,
          after: diff.rhs,
        };
        break;
    }
  });

  return cleaned;
};

export const logDiff = <T, X>(
  old: T,
  updated: X,
  keys: string[]
): CleanedDiff => {
  const oldFiltered = pick(old, keys);
  const updatedFiltered = pick(updated, keys);

  const diffResults = deepDiff(oldFiltered, updatedFiltered);
  const cleanedDiff = cleanDiffResults(diffResults);

  return cleanedDiff;
};
