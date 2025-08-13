import {
  CriteriaSearchField,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";

import { UsagerLight } from "../../../../../_common/model";
import { usagersFilter } from "./usagersFilter.service";
import { UsagersFilterCriteria } from "../../classes";

const usagers: UsagerLight[] = [
  {
    ref: 1,
    prenom: "John",
    nom: "Smith",
    email: "john21@provider1.com",
    phoneNumber: "0612345678",
    dateNaissance: "1990-05-15",
    customRef: "001",
    ayantsDroits: [
      {
        prenom: "Sarah",
        nom: "Smith",
        dateNaissance: new Date("2015-03-20"),
      },
      {
        prenom: "Sophie",
        nom: "Smith",
        dateNaissance: new Date("2018-07-10"),
      },
    ],
    decision: {
      statut: "VALIDE",
    },
    statut: "VALIDE",
    options: {
      procurations: [
        { nom: "Zazie", prenom: "Koko" },
        { nom: "Youlo", prenom: "Koko" },
      ],
    },
  },
  {
    ref: 2,
    prenom: "Marie",
    nom: "Smith",
    surnom: "Maria",
    email: "marie222@provider1.com",
    phoneNumber: "0687654321",
    dateNaissance: new Date("1985-12-03"),
    ayantsDroits: [
      {
        prenom: "John",
        nom: "Smith",
        dateNaissance: new Date("2010-01-25"),
      },
    ],
    statut: "RADIE",
    decision: {
      statut: "RADIE",
    },
    options: {
      procurations: [],
    },
  },
  {
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
    surnom: "Clacla",
    email: "claire.meunier@vprovider2.org",
    phoneNumber: "0612345679",
    dateNaissance: new Date("1995-08-30"),
    customRef: "003",
    statut: "VALIDE",
    decision: {
      statut: "VALIDE",
    },
    ayantsDroits: [],
    options: {
      procurations: [
        { nom: "Zazie", prenom: "Koko" },
        { nom: "Youlo", prenom: "Koko" },
      ],
    },
  },
] as UsagerLight[];

describe("usagersFilter", () => {
  // Test existant
  it("usagersFilter searchString+statut", () => {
    const results = usagersFilter.filter(usagers, {
      criteria: new UsagersFilterCriteria({
        searchString: "mit",
        statut: UsagersFilterCriteriaStatut.VALIDE,
      }),
    });
    expect(results.length).toEqual(1);
    expect(results[0].ref).toEqual(1);
  });

  describe("Search by phone", () => {
    // Tests pour la recherche par numéro de téléphone
    it("should filter by phone number only", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "0612",
          searchStringField: CriteriaSearchField.PHONE_NUMBER,
        }),
      });
      expect(results.length).toEqual(2);
      expect(results.map((r) => r.ref)).toContain(1);
      expect(results.map((r) => r.ref)).toContain(3);
    });

    it("should filter by phone number and status", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "0612",
          searchStringField: CriteriaSearchField.PHONE_NUMBER,
          statut: UsagersFilterCriteriaStatut.VALIDE,
        }),
      });
      expect(results.length).toEqual(2);
      expect(results.map((r) => r.ref)).toContain(1);
      expect(results.map((r) => r.ref)).toContain(3);
    });

    it("should return no results for non-matching phone number", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "0699999999",
          searchStringField: CriteriaSearchField.PHONE_NUMBER,
        }),
      });
      expect(results.length).toEqual(0);
    });

    it("should handle partial phone number matches", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "5678",
          searchStringField: CriteriaSearchField.PHONE_NUMBER,
        }),
      });
      expect(results.length).toEqual(1);
      expect(results[0].ref).toEqual(1);
    });
  });

  describe("Search by birth date", () => {
    it("should filter by exact birth date", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "15/05/1990",
          searchStringField: CriteriaSearchField.BIRTH_DATE,
        }),
      });
      expect(results.length).toEqual(1);
      expect(results[0].ref).toEqual(1);
    });

    it("should find birth date in ayants droit", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "20/03/2015",
          searchStringField: CriteriaSearchField.BIRTH_DATE,
        }),
      });
      expect(results.length).toEqual(1);
      expect(results[0].ref).toEqual(1);
    });

    it("should return all because date is not correct", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "15",
          statut: UsagersFilterCriteriaStatut.TOUS,
          searchStringField: CriteriaSearchField.BIRTH_DATE,
        }),
      });
      expect(results.length).toEqual(usagers.length);
    });

    it("should return no results with date which not match", () => {
      const results = usagersFilter.filter(usagers, {
        criteria: new UsagersFilterCriteria({
          searchString: "15/10/2068",
          searchStringField: CriteriaSearchField.BIRTH_DATE,
        }),
      });
      expect(results.length).toEqual(0);
    });
  });
});
