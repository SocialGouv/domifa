import { InsertEvent } from "typeorm";
import { UsagerSubscriber } from "../UsagerSubscriber.typeorm";
import { UsagerTable } from "../UsagerTable.typeorm";

const indexOf = (entity: Partial<UsagerTable>): string => {
  const subscriber = new UsagerSubscriber();
  subscriber.beforeInsert({
    entity: entity as UsagerTable,
  } as InsertEvent<UsagerTable>);
  return (entity as UsagerTable).nom_prenom_surnom_ref;
};

// Cette colonne est l'index de recherche. L'interface cherche aujourd'hui dans
// le nom et le prénom des ayants droit et des mandataires : sans eux ici, la
// recherche serveur ne saurait pas retrouver un dossier par le prénom d'un
// enfant, ce qui serait une régression fonctionnelle silencieuse.
describe("UsagerSubscriber — index de recherche", () => {
  it("indexe le nom, le prénom et le surnom", () => {
    expect(
      indexOf({ nom: "Dupont", prenom: "Marie", surnom: "Mimi", ref: 1234 })
    ).toBe("dupont marie mimi");
  });

  it("préfère la référence personnalisée à la référence interne", () => {
    expect(
      indexOf({
        nom: "Dupont",
        prenom: "Marie",
        customRef: "2026-0042",
        ref: 7,
      })
    ).toBe("dupont marie 2026 0042");
  });

  it("indexe le nom et le prénom des ayants droit", () => {
    const index = indexOf({
      nom: "Dupont",
      prenom: "Marie",
      ref: 12,
      ayantsDroits: [
        { nom: "Dupont", prenom: "Léo" },
        { nom: "Martin", prenom: "Zoé" },
      ],
    } as Partial<UsagerTable>);

    expect(index).toContain("leo");
    expect(index).toContain("martin");
    expect(index).toContain("zoe");
  });

  it("indexe le nom et le prénom des mandataires", () => {
    const index = indexOf({
      nom: "Dupont",
      prenom: "Marie",
      ref: 12,
      options: { procurations: [{ nom: "Bernard", prenom: "Alice" }] },
    } as Partial<UsagerTable>);

    expect(index).toContain("bernard");
    expect(index).toContain("alice");
  });

  it("normalise accents, ligatures et ponctuation", () => {
    expect(indexOf({ nom: "Lœwenberg-Ünal", prenom: "Chloé", ref: 3 })).toBe(
      "loewenberg unal chloe"
    );
  });

  it("supporte l'absence d'ayants droit et d'options", () => {
    expect(indexOf({ nom: "Dupont", prenom: "Marie", ref: 5 })).toBe(
      "dupont marie"
    );
  });

  it("ne calcule rien tant que le nom ou le prénom manque", () => {
    expect(indexOf({ nom: "Dupont", ref: 5 })).toBeUndefined();
  });
});
