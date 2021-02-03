import { search } from "./search";

const data = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john21@provider1.com",
    tags: ["music", "books"],
    children: [
      {
        firstName: "Sarah",
        age: 12,
      },
      {
        firstName: "Peter",
        age: 15,
      },
    ],
  },
  {
    id: 1,
    firstName: "Marie",
    lastName: "Smith",
    email: "marie222@provider1.com",
    tags: ["dance", "books"],
    children: [
      {
        firstName: "John",
        age: 25,
      },
    ],
  },
  {
    id: 1,
    firstName: "Claire",
    lastName: "Meunier",
    email: "claire.meunier@vprovider2.org",
    tags: ["arts", "nature"],
    children: [],
  },
];

it("search joh", () => {
  const results = search.filter(data, {
    searchText: "joh",
    getAttributes: getSearchAttributes(),
  });
  expect(results.length).toEqual(2);
});

it("search dance", () => {
  const results = search.filter(data, {
    searchText: "dance",
    getAttributes: getSearchAttributes(),
  });
  expect(results.length).toEqual(1);
});

it("search books", () => {
  const results = search.filter(data, {
    searchText: "books",
    getAttributes: getSearchAttributes(),
  });
  expect(results.length).toEqual(2);
});

it("search xxx", () => {
  const results = search.filter(data, {
    searchText: "xxx",
    getAttributes: getSearchAttributes(),
  });
  expect(results.length).toEqual(0);
});

function getSearchAttributes(): (
  item: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    tags: string[];
    children: { firstName: string; age: number }[];
  },
  index?: number
) => string[] {
  return (x) => [
    x.firstName,
    x.lastName,
    x.email,
    ...x.tags,
    ...x.children.map((x) => x.firstName),
  ];
}
