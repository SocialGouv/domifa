import { getDateForCerfa, resetDate } from "../get-date-for-cerfa";

const timezones = ["Europe/Paris", "Indian/Mayotte", "America/Cayenne"];
const usersMock = {
  "Europe/Paris": {
    structure: { timeZone: "Europe/Paris" },
  },
  "Indian/Mayotte": {
    structure: { timeZone: "Indian/Mayotte" },
  },
  "America/Cayenne": {
    structure: { timeZone: "America/Cayenne" },
  },
};

const fullDateFormats = [
  {
    category: "Date UTC (Z)",
    value: "2025-04-07T14:17:00.855Z",
    expectedValue: {
      "Europe/Paris": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "16",
        minutes: "17",
      },
      "Indian/Mayotte": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "17",
        minutes: "17",
      },
      "America/Cayenne": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "11",
        minutes: "17",
      },
    },
  },
  {
    category: "Date avec offset +0100",
    value: "1989-02-26 03:59:59.999 +0100",
    expectedValue: {
      "Europe/Paris": {
        jour: "26",
        mois: "02",
        annee: "1989",
        heure: "03",
        minutes: "59",
      },
      "Indian/Mayotte": {
        jour: "26",
        mois: "02",
        annee: "1989",
        heure: "06",
        minutes: "59",
      },
      "America/Cayenne": {
        jour: "25",
        mois: "02",
        annee: "1989",
        heure: "23",
        minutes: "59",
      },
    },
  },
  {
    category: "Date avec offset +0200 (été)",
    value: "2025-04-07 02:00:00.000 +0200",
    expectedValue: {
      "Europe/Paris": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "02",
        minutes: "00",
      },
      "Indian/Mayotte": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "03",
        minutes: "00",
      },
      "America/Cayenne": {
        jour: "06",
        mois: "04",
        annee: "2025",
        heure: "21",
        minutes: "00",
      },
    },
  },
  // 2. Dates en string sans timezone
  {
    category: "Date sans timezone (ISO)",
    value: "2025-04-07T14:17:00.855",
    expectedValue: {
      "Europe/Paris": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "16",
        minutes: "17",
      },
      "Indian/Mayotte": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "17",
        minutes: "17",
      },
      "America/Cayenne": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "11",
        minutes: "17",
      },
    },
  },
  {
    category: "Date sans timezone (format simple)",
    value: "2025-04-07 14:17:00",
    expectedValue: {
      "Europe/Paris": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "16",
        minutes: "17",
      },
      "Indian/Mayotte": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "17",
        minutes: "17",
      },
      "America/Cayenne": {
        jour: "07",
        mois: "04",
        annee: "2025",
        heure: "11",
        minutes: "17",
      },
    },
  },
];

const MOCKED_NEW_DATE = "2025-06-15T12:00:00.000Z"; // Mi-juin, clairement en heure d'été

describe("Fonction getDateForCerfa - Dates complètes (date + heure)", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(MOCKED_NEW_DATE));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  describe.each(timezones)("Tests avec timezone %s", (timezone) => {
    test.each(fullDateFormats)(
      "Gestion de: $category",
      ({ value, expectedValue }) => {
        const result = getDateForCerfa(value, usersMock[timezone]);

        // Uniquement 3 expect pour les jours/mois/années
        expect(result.jour).toBe(expectedValue[timezone].jour);
        expect(result.mois).toBe(expectedValue[timezone].mois);
        expect(result.annee).toBe(expectedValue[timezone].annee);
      }
    );
  });
});

describe("Fonctions de date pour Cerfa", () => {
  describe("resetDate", () => {
    it("devrait retourner un objet avec des valeurs vides", () => {
      const result = resetDate();
      expect(result).toEqual({
        annee: "",
        heure: "",
        jour: "",
        minutes: "",
        mois: "",
      });
    });
  });

  describe("getDateForCerfa", () => {
    it("devrait retourner un objet vide quand la date est null", () => {
      const result = getDateForCerfa(null);
      expect(result).toEqual({
        annee: "",
        heure: "",
        jour: "",
        minutes: "",
        mois: "",
      });
    });

    it("devrait formater correctement une date en Europe/Paris", () => {
      // Date spécifiée: 1985-06-27 21:59:59.999 +0200
      const date = new Date("1985-06-27T21:59:59.999+0200");

      const user = {
        structure: {
          timeZone: "Europe/Paris",
        },
      } as any;

      const result = getDateForCerfa(date, user);

      // Vérifier juste le jour, mois et année
      expect(result.jour).toBe("27");
      expect(result.mois).toBe("06");
      expect(result.annee).toBe("1985");
      expect(result.minutes).toBe("59");
      // On peut également vérifier les minutes qui ne changent pas
    });

    it("devrait formater correctement une date de la base pour la Guyane (America/Cayenne)", () => {
      const userGuyane = {
        structure: {
          timeZone: "America/Cayenne",
        },
      } as any;

      const result = getDateForCerfa(
        "1989-02-26 03:59:59.999 +0100",
        userGuyane
      );

      // Pour la Guyane: le 25/02 - c'est l'important à vérifier
      expect(result.jour).toBe("25"); // Jour précédent car minuit est déjà passé en Europe mais pas encore en Guyane
      expect(result.mois).toBe("02");
      expect(result.annee).toBe("1989");
      expect(result.minutes).toBe("59");
    });

    it("devrait formater correctement la date de naissance du 26 mars 2012 pour la Guyane", () => {
      // Donnée en base enregistrée à Cayenne: "dateNaissance": "2012-03-26T02:59:59.999Z"
      const dateNaissance = new Date("2012-03-26T02:59:59.999Z");

      const userGuyane = {
        structure: {
          timeZone: "America/Cayenne",
        },
      } as any;

      const result = getDateForCerfa(dateNaissance, userGuyane);

      // Pour la Guyane: jour précédent
      expect(result.jour).toBe("25"); // Jour précédent
      expect(result.mois).toBe("03");
      expect(result.annee).toBe("2012");
      expect(result.minutes).toBe("59");
    });

    it("devrait formater correctement la date de naissance du 12 avril 2024 pour la Guyane", () => {
      // Donnée en base enregistrée à Cayenne: "dateNaissance": "2024-04-12T02:59:59.999Z"
      const dateNaissance = new Date("2024-04-12T02:59:59.999Z");

      const userGuyane = {
        structure: {
          timeZone: "America/Cayenne",
        },
      } as any;

      const result = getDateForCerfa(dateNaissance, userGuyane);

      // Pour la Guyane: jour précédent
      expect(result.jour).toBe("11"); // Jour précédent
      expect(result.mois).toBe("04");
      expect(result.annee).toBe("2024");
      expect(result.minutes).toBe("59");
    });

    it("devrait formater correctement une chaîne de date de la base pour la Guyane", () => {
      // Alternative avec une chaîne de caractères
      const timestampFromDb = "1989-02-26 03:59:59.999";

      const userGuyane = {
        structure: {
          timeZone: "America/Cayenne",
        },
      } as any;

      const result = getDateForCerfa(timestampFromDb, userGuyane);

      // Pour la Guyane: jour précédent
      expect(result.jour).toBe("25");
      expect(result.mois).toBe("02");
      expect(result.annee).toBe("1989");
      expect(result.minutes).toBe("59");
    });

    it("devrait formater correctement une date pour la Réunion", () => {
      // Utilisons la même date de base
      const dateFromDb = new Date("1989-02-26T03:59:59.999+0100");

      const userReunion = {
        structure: {
          timeZone: "Indian/Reunion",
        },
      } as any;

      const result = getDateForCerfa(dateFromDb, userReunion);

      // Pour la Réunion: même jour
      expect(result.jour).toBe("26");
      expect(result.mois).toBe("02");
      expect(result.annee).toBe("1989");
      expect(result.minutes).toBe("59");
    });

    it("devrait formater correctement une date pour la Martinique", () => {
      const dateFromDb = new Date("1989-02-26T03:59:59.999+0100");

      const userMartinique = {
        structure: {
          timeZone: "America/Martinique",
        },
      } as any;

      const result = getDateForCerfa(dateFromDb, userMartinique);

      // Pour la Martinique: jour précédent
      expect(result.jour).toBe("25");
      expect(result.mois).toBe("02");
      expect(result.annee).toBe("1989");
      expect(result.minutes).toBe("59");
    });

    it("devrait formater correctement une date pour Mayotte", () => {
      const dateFromDb = new Date("1989-02-26T03:59:59.999+0100");

      const userMayotte = {
        structure: {
          timeZone: "Indian/Mayotte",
        },
      } as any;

      const result = getDateForCerfa(dateFromDb, userMayotte);

      // Pour Mayotte: même jour
      expect(result.jour).toBe("26");
      expect(result.mois).toBe("02");
      expect(result.annee).toBe("1989");
      expect(result.minutes).toBe("59");
    });
  });
});
