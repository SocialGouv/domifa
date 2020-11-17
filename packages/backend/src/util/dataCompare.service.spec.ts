import { dataCompare } from "./dataCompare.service";

it("dataCompare.compareAttributes", () => {
  expect(
    dataCompare.compareAttributes(1, 2, {
      asc: true,
    })
  ).toEqual(-1);

  expect(
    dataCompare.compareAttributes(1, 1, {
      asc: true,
    })
  ).toEqual(0);

  expect(
    dataCompare.compareAttributes("b", "a", {
      asc: true,
    })
  ).toEqual(1);

  expect(
    dataCompare.compareAttributes("b", "a", {
      asc: false,
    })
  ).toEqual(-1);

  expect(
    dataCompare.compareAttributes("abc", "abc", {
      asc: false,
    })
  ).toEqual(0);

  expect(
    dataCompare.compareAttributes(2, 1, {
      asc: false,
    })
  ).toEqual(-1);

  expect(
    dataCompare.compareAttributes(null, 2, {
      asc: true,
      nullFirst: true,
    })
  ).toEqual(-1);

  expect(
    dataCompare.compareAttributes(null, 2, {
      asc: true,
      nullFirst: false,
    })
  ).toEqual(1);
});
