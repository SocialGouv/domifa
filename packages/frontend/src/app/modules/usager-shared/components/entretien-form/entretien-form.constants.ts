// Detail fields hidden by the template unless their discriminator matches;
// mirrors the backend EntretienDto conditions.
export const ENTRETIEN_DETAIL_FIELDS: ReadonlyArray<{
  field: string;
  detail: string;
  shownFor: unknown;
}> = [
  { field: "orientation", detail: "orientationDetail", shownFor: true },
  { field: "revenus", detail: "revenusDetail", shownFor: true },
  { field: "accompagnement", detail: "accompagnementDetail", shownFor: true },
  { field: "situationPro", detail: "situationProDetail", shownFor: "AUTRE" },
  { field: "liencommune", detail: "liencommuneDetail", shownFor: "AUTRE" },
  { field: "residence", detail: "residenceDetail", shownFor: "AUTRE" },
  { field: "cause", detail: "causeDetail", shownFor: "AUTRE" },
  { field: "raison", detail: "raisonDetail", shownFor: "AUTRE" },
];
