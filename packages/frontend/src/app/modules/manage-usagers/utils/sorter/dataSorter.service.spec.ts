import { dataSorter } from "./dataSorter.service";

describe("dataSorter.sortMultiple", () => {
  const obj1 = {
    cat: 1,
    score: 3,
    label: "A1",
  };
  const obj4 = {
    cat: 3,
    score: 30,
    label: "a4",
  };
  const obj3 = {
    cat: 2,
    score: 0,
    label: "A3",
  };
  const obj2 = {
    cat: 1,
    score: 5,
    label: "a2",
  };
  const obj5 = {
    cat: 1,
    score: 5,
    label: "A5",
  };

  it("Should sort by cat ASC", () => {
    expect(
      dataSorter.sortMultiple([obj1, obj4, obj2, obj5, obj3], true, {
        getSortAttributes: (item) => [item.cat, item.score, item.label],
      })
    ).toEqual([obj1, obj2, obj5, obj3, obj4]);
  });

  it("Should sort by cat DESC", () => {
    expect(
      dataSorter.sortMultiple([obj1, obj4, obj2, obj5, obj3], false, {
        getSortAttributes: (item) => [item.cat, item.score, item.label],
      })
    ).toEqual([obj4, obj3, obj5, obj2, obj1]);
  });
});
