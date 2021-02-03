import { searchCore } from './searchCore';

export interface Bounds {
  start: number;
  end: number;
}
export interface Chunk {
  value: string;
  match: boolean;
}

export const searchChunks = {
  find,
  _findAllWordsIndices,
  _mergeIndices,
  _getChunksFromMergedIndices,
};

function getIndicesOf(content: string, {
  word,
}: {
  word: string,
}): Bounds[] {

  if (!word || !content) {
    return [];
  }

  let startIndex = 0;
  let index;
  const indices = [];

  while ((index = content.indexOf(word, startIndex)) > -1) {
    indices.push({
      start: index,
      end: index + word.length,
    });
    startIndex = index + word.length;
  }
  return indices;
}

function find(content: string, {
  searchText,
}: {
  searchText: string,
}): Chunk[] {

  const words = searchCore.buildWords(searchText);
  if (words.length === 0 || !content || !content.length) {
    return [{
      value: content,
      match: false,
    }];
  }
  const cleanContent = searchCore.clean(content);

  const allWordsIndices: Bounds[] = _findAllWordsIndices(words, cleanContent);

  // now merge indices [1-3, 2-5, 7-10] => [1-5, 7-10]
  const mergedIndices: Bounds[] = _mergeIndices(allWordsIndices);

  return _getChunksFromMergedIndices({ mergedIndices, content });
}

function _getChunksFromMergedIndices({ mergedIndices, content }: { mergedIndices: Bounds[]; content: string; }) {
  const res = mergedIndices.reduce((acc, bounds) => {
    if (acc.lastIndex < bounds.start) {
      acc.chunks.push({
        value: content.substring(acc.lastIndex, bounds.start),
        match: false,
      });
    }
    acc.chunks.push({
      value: content.substring(bounds.start, bounds.end),
      match: true,
    });
    acc.lastIndex = bounds.end;
    return acc;
  }, {
      chunks: [] as Chunk[],
      lastIndex: 0,
    });
  if (res.lastIndex < content.length) {
    res.chunks.push({
      value: content.substring(res.lastIndex),
      match: false,
    });
  }
  return res.chunks;
}

function _mergeIndices(allWordsIndices: Bounds[]): Bounds[] {
  const mergedIndices = allWordsIndices.reduce((acc, indice) => {
    const f = acc.find(b => b.start <= indice.end && b.end >= indice.start);
    if (f) {
      f.start = Math.min(f.start, indice.start);
      f.end = Math.max(f.end, indice.end);
    }
    else {
      acc.push(indice);
    }
    return acc;
  }, [] as Bounds[]);

  // sort by index
  mergedIndices.sort((a, b) => a.start > b.start ? 1 : a.start < b.start ? -1 : 0);

  return mergedIndices;
}

function _findAllWordsIndices(words: string[], cleanContent: string): Bounds[] {
  return words.reduce((acc, word) => {
    const wordIndices: Bounds[] = getIndicesOf(cleanContent, {
      word,
    });
    return acc.concat(wordIndices);
  }, []);
}
