import { Bounds, searchChunks } from './searchChunks';

it('find', () => {
  expect(searchChunks.find('peter smith', {
    searchText: 'pet',
  })).toEqual([{
    "match": true,
    "value": "pet",
  }, {
    "match": false,
    "value": "er smith",
  }]);
});

it('_findAllWordsIndices', () => {
  const allWordsIndices: Bounds[] = searchChunks._findAllWordsIndices(['david', 'c'], 'carion david');

  expect(allWordsIndices).toEqual([{
    start: 7,
    end: 12,
  }, {
    start: 0,
    end: 1,
  }]);
});

it('_mergeIndices', () => {

  expect(searchChunks._mergeIndices([{ start: 1, end: 3 }, { start: 2, end: 5 }, { start: 7, end: 10 }])).toEqual([{
    start: 1,
    end: 5,
  }, {
    start: 7,
    end: 10,
  }]);
  expect(searchChunks._mergeIndices([{
    start: 7,
    end: 12,
  }, {
    start: 0,
    end: 1,
  }])).toEqual([{
    start: 0,
    end: 1,
  }, {
    start: 7,
    end: 12,
  }]);
});

it('_getChunksFromMergedIndices', () => {

  expect(searchChunks._getChunksFromMergedIndices({
    content: 'carion david',
    mergedIndices: [{
      start: 0,
      end: 1,
    }, {
      start: 7,
      end: 12,
    }]
  })).toEqual([{
    "match": true,
    "value": "c",
  }, {
    "match": false,
    "value": "arion ",
  }, {
    "match": true,
    "value": "david",
  }]);
});

it('find', () => {
  expect(searchChunks.find('carion david', {
    searchText: 'david c',
  })).toEqual([{
    "match": true,
    "value": "c",
  }, {
    "match": false,
    "value": "arion ",
  }, {
    "match": true,
    "value": "david",
  }]);
});