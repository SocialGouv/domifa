import { v4 as uuidv4 } from "uuid";
import { UsagerAyantDroit } from "@domifa/common";

const toTime = (date: UsagerAyantDroit["dateNaissance"]): number | null => {
  if (!date) {
    return null;
  }
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? null : time;
};

const isSameAyantDroit = (
  a: Partial<UsagerAyantDroit>,
  b: Partial<UsagerAyantDroit>
): boolean =>
  a.nom === b.nom &&
  a.prenom === b.prenom &&
  a.lien === b.lien &&
  toTime(a.dateNaissance) === toTime(b.dateNaissance);

/**
 * Ensures every ayant droit carries a stable `uuid`.
 *
 * - honours an incoming `uuid` only when it already belongs to the dossier
 *   (present in `existing`): lets the frontend round-trip the id through an edit
 *   that changes nom / prenom / lien / dateNaissance, while a client can never
 *   inject an arbitrary id (on creation `existing` is empty, so nothing is trusted)
 * - otherwise reuses the `uuid` of a matching `existing` ayant droit
 *   (same nom / prenom / lien / dateNaissance) so edits don't regenerate ids
 * - falls back to a fresh v4 uuid
 *
 * The returned uuids are guaranteed unique within the dossier.
 */
export function withAyantsDroitsUuid(
  incoming: Partial<UsagerAyantDroit>[] = [],
  existing: UsagerAyantDroit[] = []
): UsagerAyantDroit[] {
  const knownUuids = new Set(
    (existing ?? []).map((ayantDroit) => ayantDroit?.uuid).filter(Boolean)
  );
  const usedUuids = new Set<string>();
  const availableExisting = [...(existing ?? [])];

  return (incoming ?? []).map((ayantDroit) => {
    if (
      ayantDroit?.uuid &&
      knownUuids.has(ayantDroit.uuid) &&
      !usedUuids.has(ayantDroit.uuid)
    ) {
      usedUuids.add(ayantDroit.uuid);
      return { ...ayantDroit, uuid: ayantDroit.uuid } as UsagerAyantDroit;
    }

    const matchIndex = availableExisting.findIndex(
      (candidate) =>
        candidate?.uuid &&
        !usedUuids.has(candidate.uuid) &&
        isSameAyantDroit(candidate, ayantDroit)
    );

    let uuid: string;
    if (matchIndex !== -1) {
      uuid = availableExisting[matchIndex].uuid;
      availableExisting.splice(matchIndex, 1);
    } else {
      uuid = uuidv4();
    }

    usedUuids.add(uuid);
    return { ...ayantDroit, uuid } as UsagerAyantDroit;
  });
}
