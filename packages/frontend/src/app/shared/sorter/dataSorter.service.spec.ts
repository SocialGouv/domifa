import { dataSorter } from './dataSorter.service';

it('dataSorter.sortSingle', () => {
  const I1 = {
    id: 1,
    name: 'item 1'
  };
  const I4 = {
    id: null,
    name: 'Item 4'
  };
  const I3 = {
    id: 3,
    name: '3rd item'
  };
  const I2 = {
    id: 2,
    name: 'Item 2'
  };
  expect(dataSorter.sortSingle([I1, I4, I2, I3], {
    asc: true,
    nullFirst: true,
    getSortAttribute: item => ({
      value: item.id,
    }),
  })).toEqual([I4, I1, I2, I3]);

  expect(dataSorter.sortSingle([I1, I4, I2, I3], {
    asc: true,
    nullFirst: false,
    getSortAttribute: item => ({
      value: item.id,
    }),
  })).toEqual([I1, I2, I3, I4]);

  expect(dataSorter.sortSingle([I1, I4, I2, I3], {
    asc: false,
    nullFirst: true,
    getSortAttribute: item => ({
      value: item.id,
    }),
  })).toEqual([I4, I3, I2, I1]);

  expect(dataSorter.sortSingle([I1, I4, I2, I3], {
    asc: false,
    nullFirst: false,
    getSortAttribute: item => ({
      value: item.id,
    }),
  })).toEqual([I3, I2, I1, I4]);

  expect(dataSorter.sortSingle([I1, I4, I2, I3], {
    asc: true,
    nullFirst: false,
    getSortAttribute: item => ({
      value: item.name ? item.name.toUpperCase() : undefined,
    }),
  })).toEqual([I3, I1, I2, I4]);
});

it('dataSorter.sortMultiple', () => {
  const I1 = {
    cat: 1,
    score: 3,
    label: 'A1'
  };
  const I4 = {
    cat: 3,
    score: 30,
    label: 'a4'
  };
  const I3 = {
    cat: 2,
    score: 0,
    label: 'A3'
  };
  const I2 = {
    cat: 1,
    score: 5,
    label: 'a2'
  };
  const I5 = {
    cat: 1,
    score: 5,
    label: 'A5'
  };
  expect(dataSorter.sortMultiple([I1, I4, I2, I5, I3], {
    asc: true,
    getSortAttributes: item => ([{
      value: item.cat,
    }, {
      value: item.score,
    }, {
      value: item.label,
      type: 'full-text',
    }]),
  })).toEqual([I1, I2, I5, I3, I4]);

  expect(dataSorter.sortMultiple([I1, I4, I2, I5, I3], {
    asc: false,
    getSortAttributes: item => ([{
      value: item.cat,
    }, {
      value: item.score,
    }, {
      value: item.label,
      type: 'full-text',
    }]),
  })).toEqual([I4, I3, I5, I2, I1]);

  expect(dataSorter.sortMultiple([I1, I4, I2, I5, I3], {
    asc: true,
    getSortAttributes: item => ([{
      value: item.cat,
    }, {
      value: item.score,
      asc: false,
    }, {
      value: item.label,
      type: 'full-text',
    }]),
  })).toEqual([I2, I5, I1, I3, I4]);
});