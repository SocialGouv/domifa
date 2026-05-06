import { DEPARTEMENTS_MAP, REGIONS_LISTE } from "@domifa/common";
import { sign } from "jsonwebtoken";
import { createHash } from "node:crypto";

import { UserAdminAuthenticated } from "../../../../_common/model";
import { domifaConfig } from "../../../../config";
import { MetabaseStatsDto } from "../../dto/MetabaseStats.dto";
import { ResolvedTerritoryFilter } from "../../services";

const METABASE_DASHBOARD_ID = 6;
const JWT_TTL_SECONDS = 30 * 60;
const URL_CACHE_TTL_MS = 5 * 60 * 1000;
const URL_CACHE_MAX_ENTRIES = 500;

const METABASE_PARAM_KEYS = {
  year: "ann%C3%A9e_du_rapport",
  region: "r%C3%A9gion",
  department: "d%C3%A9partement",
  structureType: "type_de_structure",
  structureId: "structureid",
} as const;

const HIDE_PARAMETERS = [
  METABASE_PARAM_KEYS.region,
  METABASE_PARAM_KEYS.department,
  METABASE_PARAM_KEYS.structureType,
  METABASE_PARAM_KEYS.structureId,
].join(",");

const HASH_PARAMS = [
  "bordered=false",
  "titled=false",
  "theme=transparent",
  "font=Marianne",
  "locale=fr",
  `hide_parameters=${HIDE_PARAMETERS}`,
].join("&");

type MetabaseParams = Record<string, Array<string | number>>;

type CachedUrl = { url: string; expiresAt: number };

const urlCache = new Map<string, CachedUrl>();

const buildParams = (
  filter: ResolvedTerritoryFilter,
  dto: MetabaseStatsDto
): MetabaseParams => ({
  [METABASE_PARAM_KEYS.year]: dto.year ? [dto.year] : [],
  [METABASE_PARAM_KEYS.region]: filter.region.map(
    (code) => REGIONS_LISTE[code]
  ),
  [METABASE_PARAM_KEYS.department]: filter.department.map(
    (code) => DEPARTEMENTS_MAP[code].departmentName
  ),
  [METABASE_PARAM_KEYS.structureType]: dto.structureType
    ? [dto.structureType]
    : [],
  [METABASE_PARAM_KEYS.structureId]: dto.structureId ? [dto.structureId] : [],
});

// Cache key combines (userId, role, hash-of-resolved-params).
// Each component independently prevents cross-user data leak:
//   - userId  : a user can never read another user's cached URL
//   - role    : protects against userId reuse after a role change
//   - params  : computed AFTER resolveTerritoryFilter, so contains the
//               server-enforced territory; a region user's hash always
//               includes their territory and cannot collide with the
//               unrestricted national hash.
const cacheKeyFor = (
  userId: number,
  role: string,
  params: MetabaseParams
): string => {
  const hash = createHash("sha1").update(JSON.stringify(params)).digest("hex");
  return `${userId}:${role}:${hash}`;
};

const getCachedUrl = (key: string): string | null => {
  const entry = urlCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    urlCache.delete(key);
    return null;
  }
  return entry.url;
};

const setCachedUrl = (key: string, url: string): void => {
  if (urlCache.size > URL_CACHE_MAX_ENTRIES) {
    const oldestKey = urlCache.keys().next().value;
    if (oldestKey) urlCache.delete(oldestKey);
  }
  urlCache.set(key, { url, expiresAt: Date.now() + URL_CACHE_TTL_MS });
};

const signEmbedUrl = (params: MetabaseParams): string => {
  const payload = {
    resource: { dashboard: METABASE_DASHBOARD_ID },
    params,
    exp: Math.round(Date.now() / 1000) + JWT_TTL_SECONDS,
  };
  const token = sign(payload, domifaConfig().metabase.token);
  return `${
    domifaConfig().metabase.url
  }embed/dashboard/${token}#${HASH_PARAMS}`;
};

export const getOrCreateMetabaseEmbedUrl = (
  user: UserAdminAuthenticated,
  filter: ResolvedTerritoryFilter,
  dto: MetabaseStatsDto
): string => {
  const params = buildParams(filter, dto);
  const cacheKey = cacheKeyFor(user.id, user.role, params);
  const cached = getCachedUrl(cacheKey);
  if (cached) return cached;

  const url = signEmbedUrl(params);
  setCachedUrl(cacheKey, url);
  return url;
};
