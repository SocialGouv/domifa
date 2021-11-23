import { dataObjectCompare } from './dataObjectCompare.service';

it('dataObjectCompare.compareAttributes', () => {

  const I1 = {
    cat: 1,
    score: 3,
    other: 5000,
    label: 'A1'
  };
  const I4 = {
    cat: 1,
    score: 3,
    other: 1000,
    label: 'A4'
  };
  const I3 = {
    cat: 1,
    score: 4,
    other: 1000,
    label: 'A3'
  };

  expect(dataObjectCompare.compareObjects(I1, I3, {
    attributes: item => [{
      value: item.cat,
    }]
  })).toEqual(0);

  expect(dataObjectCompare.compareObjects(I1, I4, {
    attributes: item => [{
      value: item.cat,
    }, {
      value: item.score,
    }]
  })).toEqual(0);

  expect(dataObjectCompare.compareObjects(I1, I4, {
    attributes: item => [{
      value: item.cat,
    }, {
      value: item.score,
    }, {
      value: item.label,
    }]
  })).toEqual(-1);

  expect(dataObjectCompare.compareObjects(I1, I3, {
    attributes: item => [{
      value: item.cat,
    }, {
      value: item.score,
    }]
  })).toEqual(-1);


});

it('dataObjectCompare.objectsEquals', () => {

  const I1 = {
    cat: 1,
    score: 3,
    other: 5000,
    label: 'A1'
  };
  const I4 = {
    cat: 1,
    score: 3,
    other: 1000,
    label: 'A4'
  };
  const I3 = {
    cat: 1,
    score: 4,
    other: 1000,
    label: 'A3'
  };

  expect(dataObjectCompare.objectsEquals(I1, I3, {
    attributes: item => [item.cat]
  })).toEqual(true);

  expect(dataObjectCompare.objectsEquals(I1, I3, {
    attributes: item => [item.cat, item.score]
  })).toEqual(false);

  expect(dataObjectCompare.objectsEquals(I1, I4, {
    attributes: item => [item.cat, item.score]
  })).toEqual(true);

  expect(dataObjectCompare.objectsEquals(I1, I4, {
    attributes: item => [item.cat, item.score, item.other]
  })).toEqual(false);


});