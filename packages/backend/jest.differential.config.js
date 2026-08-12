// Suite différentielle : elle exige une base Postgres réelle, elle est donc
// tenue hors de la suite unitaire. Voir le README de ce dossier pour la lancer.
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/*.differential.spec.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }],
  },
};
