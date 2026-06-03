// Volumétrie d'authentification : combien d'utilisateurs structure ont eu
// une session démarrée dans les dernières 24 h, 48 h, 7 j. Buckets cumulatifs
// (24 h ⊂ 48 h ⊂ 7 j). `neverConnected` est disjoint (lastLogin IS NULL).
// `structureId` = null pour la vue plateforme, une valeur pour le détail
// par structure. Type partagé backend ↔ portails.
export interface SessionsStats {
  structureId: number | null;
  generatedAt: string;
  total: number;
  activeWithin24h: number;
  activeWithin48h: number;
  activeWithin7d: number;
  neverConnected: number;
}
