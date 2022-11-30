export const structureNameChecker = {
  isInvalidStructureName,
};
function isInvalidStructureName(structureName: string): boolean {
  if (!structureName) {
    return false;
  }
  const name = structureName.toLowerCase().trim();
  return (
    name === "ccas" ||
    name === "c.c.a.s." ||
    name === "centre communal d'action sociale" ||
    name === "mairie"
  );
}
