import { sortMultiple } from "./dataSorter.service";

describe("dataSorter.sortMultiple", () => {
  const obj1 = {
    cat: 1,
    ref: "1",
    score: 3,
    label: "A1",
  };
  const obj4 = {
    cat: 3,
    ref: 3,
    score: 30,
    label: "a4",
  };
  const obj3 = {
    cat: 2,
    ref: "2",
    score: 0,
    label: "A3",
  };
  const obj2 = {
    cat: 1,
    ref: "1",
    score: 5,
    label: "a2",
  };
  const obj5 = {
    cat: 1,
    ref: "10",
    score: 5,
    label: "A5",
  };
  const obj6 = {
    cat: 1,
    ref: "1A",
    score: 5,
    label: "A5",
  };

  it("Should sort by cat ASC", () => {
    expect(
      sortMultiple([obj1, obj4, obj2, obj5, obj3], true, (item) => [
        item.cat,
        item.score,
        item.label,
      ])
    ).toEqual([obj1, obj2, obj5, obj3, obj4]);
  });

  it("Should sort by cat DESC", () => {
    expect(
      sortMultiple([obj1, obj4, obj2, obj5, obj3], false, (item) => [
        item.cat,
        item.score,
        item.label,
      ])
    ).toEqual([obj4, obj3, obj5, obj2, obj1]);
  });

  it("Should sort by ref number or string by ASC", () => {
    const x = ["1", "1", "1A", "2", 3, "10"];
    const expected = sortMultiple(
      [obj1, obj4, obj2, obj5, obj3, obj6],
      true,
      (item) => [item.ref]
    ).map((item) => item.ref);
    expect(expected).toEqual(x);
  });
});
