import { cleanAddress } from "../clean-address";

const ADDRESS_TO_CHECK = [
  { address: "17 route de Loperhet", formattedAddress: "17 route de loperhet" },
  { address: "61 Grande Rue", formattedAddress: "61 grande rue" },
  { address: "85BIS ROUTE DE GRIGNY", formattedAddress: "85 route de grigny" },
  {
    address: "1 bis  rue Henry Dunant",
    formattedAddress: "1 rue henry dunant",
  },
  {
    address: "2, Allée Louis de Broglie - BP 81",
    formattedAddress: "2 allee louis de broglie",
  },
  {
    address: "18 Bis Avenue Léon BLUM",
    formattedAddress: "18 avenue leon blum",
  },
  { address: "Avenue voltaire", formattedAddress: "avenue voltaire" },
  { address: "9 Rue Justin Blanc", formattedAddress: "9 rue justin blanc" },
  {
    address: "4 rue de la résistance",
    formattedAddress: "4 rue de la resistance",
  },
  { address: "21 pl. du stade", formattedAddress: "21 place du stade" },
  { address: "2 bd des bois _", formattedAddress: "2 boulevard des bois" },
  {
    address: "Place des droits de l'homme et du citoyen",
    formattedAddress: "place des droits de l homme et du citoyen",
  },
  {
    address: "5 Chemin de Bellevue CS 80015",
    formattedAddress: "5 chemin de bellevue",
  },
  {
    address: "6, avenue Maréchal Foch",
    formattedAddress: "6 avenue marechal foch",
  },
];

describe("cleanAddress", () => {
  it.each(ADDRESS_TO_CHECK)(`Clean address: $address`, (value) => {
    expect(cleanAddress(value.address)).toEqual(value.formattedAddress);
  });
});
