# Audit sécurité — OTP & Login

Branche : `feat-mail-when-spam`
Date : 2026-05-13
Périmètre : flux OTP (`@RequireOtp` / `OtpGuard`), login (structures, usagers, admins).

Tous les findings ci-dessous ont été vérifiés directement contre le code.

---

## 🔴 High

### 1. Codes OTP stockés en clair en DB

**Fichier** : `packages/backend/src/database/entities/otp/OtpTable.typeorm.ts:14`

```ts
@Column({ type: "text" })
code: string;
```

**Impact** : tout accès en lecture à la DB (dump, replica, GDPR breach, log SQL) expose tous les codes OTP actifs sur leur fenêtre de 10 minutes.

**Note** : le `DOMIFA_OTP_PEPPER` qui existait dans la config était précisément prévu pour ça — son commentaire de type disait *"Server-side secret used to HMAC OTP codes before storage"*. Il a été supprimé car non utilisé.

**Fix proposé** : réintroduire le pepper, et stocker `HMAC-SHA256(code, pepper)` à l'insert. Comparer le HMAC du code saisi dans `claim()`.

---

### 2. Timing attack / énumération d'utilisateurs au login

**Fichier** : `packages/backend/src/modules/users/services/userSecurityPasswordChecker.service.ts:30-55`

```ts
const user = (await repository.findOneByOrFail({
  email: email.toLowerCase(),
})) as T;
// ...
const isValidPass: boolean = await passwordGenerator.checkPassword({
  password,
  hash: user.password,
});
```

**Impact** : si l'email n'existe pas, `findOneByOrFail` throw immédiatement (~10 ms). Si l'email existe, on passe par bcrypt (~100-300 ms par design). La différence est mesurable et fiable. Un attaquant peut énumérer les emails valides en mesurant le RTT, malgré les erreurs génériques `WRONG_CREDENTIALS 1/2/3`.

**Fix proposé** : exécuter un `bcrypt.compare` factice (sur un hash bidon stocké en constant) quand l'email est inconnu, pour égaliser le temps de réponse.

---

### 3. JWT usagers non liés à une session fingerprint

**Fichier** : `packages/backend/src/auth/jwt/jwt.strategy.ts:110-114`

```ts
} else if (payload?._userProfile === "usager") {
  return await this.usagersAuthService.validateUserUsager(
    payload as UserUsagerJwtPayload
  );
}
```

**Impact** : contrairement aux profils `structure` et `supervisor`, le JWT usager ne porte pas de `sessionFingerprintHash` et `verifySessionFromJwt` n'est pas appelé. Un JWT usager volé reste utilisable depuis n'importe quel IP/User-Agent jusqu'à expiration.

**Note** : aligné avec le plan « Phase 2 : portail-usagers » du device fingerprinting. Connu, à planifier.

---

## 🟠 Medium

### 4. Race condition dans `incrementPendingAttempts`

**Fichier** : `packages/backend/src/database/services/otp/otpRepository.service.ts:62-83`

```sql
UPDATE "otp"
SET "attempts" = "otp"."attempts" + 1,
    "updatedAt" = NOW()
FROM (
  SELECT "uuid" FROM "otp"
  WHERE ... AND "attempts" < $5    -- check uniquement dans la sous-requête
  LIMIT 1
) sub
WHERE "otp"."uuid" = sub."uuid"    -- pas de re-check
```

**Impact** : en isolation `READ COMMITTED` (PostgreSQL par défaut), deux requêtes parallèles voient `attempts = N`, la sous-requête passe pour les deux, et le compteur dépasse `maxAttempts`. Le `findRecentBlocked` (qui check `attempts >= max`) déclenche quand même le block, donc pas de bypass total — mais l'attaquant gagne 1-2 tentatives par burst de concurrence.

**Fix proposé** : ajouter `AND "otp"."attempts" < $5` dans le `WHERE` externe du `UPDATE`, ou faire `SELECT ... FOR UPDATE` dans la sous-requête.

---

### 5. Fingerprint OTP server-side calculé depuis headers spoofables

**Fichier** : `packages/backend/src/modules/otp/otp-fingerprint.helper.ts`

```ts
createHash("sha256")
  .update(`${userKey}|${ip}|${userAgent}|${purpose}`)
  .digest("hex");
```

**Impact** :
- L'IP vient de `X-Real-IP` (header) avec fallback sur `req.ip`. Si la chaîne de proxies est mal configurée (Traefik ne strip pas le header, sidecar mal réglé), un attaquant on-path peut injecter `X-Real-IP` pour matcher le fingerprint d'une victime, puis tenter le `claim` avec un JWT volé.
- Un changement d'IP légitime (mobile data ↔ wifi, switch VPN) flippe le fingerprint et invalide l'OTP en cours → resend forcé, parfois bloqué.

**Fix proposé** : utiliser un identifiant fourni par le serveur (ex. un cookie de session opaque) ou se baser sur le `sessionUuid` plutôt que sur l'IP. À défaut, restreindre le fingerprint au tuple `(userUuid, purpose)` pour ne pas le faire varier avec l'IP.

---

### 6. `x-otp-code` accepte n'importe quelle string

**Fichier** : `packages/backend/src/modules/otp/guards/otp.guard.ts:88-92`

```ts
const trimmed = raw.trim();
return trimmed.length > 0 ? trimmed : null;
```

**Impact** : un payload de 10 Mo est accepté, passe en query DB (constant-time compare → false sur longueur, sans toucher la DB sur le compare), mais **consomme une tentative** via `incrementPendingAttempts`. Permet à un attaquant authentifié de cramer les tentatives d'autrui via le scope partagé du fingerprint, ou de polluer la DB.

**Fix proposé** : `if (!/^\d{6}$/.test(trimmed)) return null;` côté guard, et rejeter avec `OTP_INVALID` sans consommer de tentative (réserver l'incrément aux codes au bon format mais incorrects).

---

### 7. OTP cleaner ignore les rows utilisés / bloqués

**Fichier** : `packages/backend/src/modules/otp/services/otp-cleaner.service.ts:29-33`

```ts
const limitDate = subDays(new Date(), 7);
const result = await otpRepository.delete({
  expiresAt: LessThanOrEqual(limitDate),
});
```

**Impact** : les rows `used = true` ou `attempts >= max` mais `expiresAt` futur restent jusqu'à 7 jours après expiration. Pas un vecteur d'attaque direct, mais :
- Histogramme d'activité utilisateur en clair sur 7 jours
- Croissance inutile de la table

**Fix proposé** : étendre le cleaner avec `OR used = true OR attempts >= maxAttempts` après une heure.

---

## 🟡 Low

### 8. `OTP_CANCELLED` côté frontend renvoie un 401 → logout forcé

**Fichier** : `packages/frontend/src/app/modules/otp/interceptors/otp.interceptor.ts:73-77`

```ts
if (result.kind === "cancel") {
  return throwError(
    () =>
      new HttpErrorResponse({
        status: 401,
        error: { code: "OTP_CANCELLED" },
      })
  );
}
```

**Impact** : quand l'utilisateur annule la modale OTP, l'intercepteur synthétise un 401. Avec l'ordre des intercepteurs corrigé (Otp innermost), Otp catch en premier — mais ici Otp lui-même **génère** le 401, qui remonte ensuite à `ServerErrorInterceptor` → logout. L'utilisateur qui annule un OTP est éjecté de sa session.

**Fix proposé** : utiliser un status 400 (Bad Request) ou un status custom non-401, OU faire en sorte que `ServerErrorInterceptor` ignore les 401 dont le body porte `code: "OTP_*"`.

---

### 9. `fingerprintHash` complet dans les logs

**Fichiers** : `packages/backend/src/auth/services/session-fingerprint.service.ts:169-183` (et autres `logger.warn`)

```ts
appLogger.warn({
  event: "session_fingerprint_mismatch",
  expectedHashPrefix: jwtFingerprintHash.substring(0, 8),
  actualHashPrefix: calculatedHash.substring(0, 8),
  ...
});
```

Le **session fingerprint** est correctement tronqué dans certains logs (8 chars). Bien.
Le **OTP fingerprint** apparaît *complet* dans plusieurs `logger.warn` — voir `otp.service.ts` (logs `purpose=...` sans fingerprint, OK) et la query log éventuelle.

Pas un secret de session, mais ça donne un identifiant traçable par utilisateur sur la durée des logs. À tronquer par cohérence.

---

## ✅ Bon dans l'existant

- `timingSafeEqual` sur la comparaison du code OTP (`otp.service.ts:184-189`)
- `claimByKey` atomique grâce au `WHERE used = false` dans l'UPDATE
- Erreurs login génériques (`WRONG_CREDENTIALS 1/2/3`) — sauf le timing
- `redactEmail` appliqué systématiquement dans les logs OTP
- Block 60 min + max 3 tentatives + email out-of-band → 6 digits est suffisant en pratique (≈ 7 essais/heure max, 15+ ans de brute-force)
- Session fingerprint salé per-session (le salt n'est jamais envoyé au client) — impossible à forger même avec la clé JWT volée

---

## 🎯 Priorisation suggérée

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 2 | `bcrypt.compare` factice sur email inconnu | 1 ligne | 🔴 énumération |
| 1 | Réintroduire le pepper + HMAC du code OTP en DB | 1 jour | 🔴 fuite DB |
| 4 | Ajouter `AND attempts < max` dans l'UPDATE externe | 1 ligne | 🟠 race |
| 6 | Regex `\d{6}` sur `x-otp-code` | 1 ligne | 🟠 DoS attempts |
| 8 | Status non-401 pour `OTP_CANCELLED` | 1 ligne | 🟡 UX |
| 3 | Session fingerprint pour usagers | Phase 2 prévu | 🔴 long terme |
| 7 | Étendre le cleaner | 5 lignes | 🟡 dette tech |
| 5 | Repenser le scoping OTP (sessionUuid plutôt qu'IP) | 1 jour | 🟠 robustesse |
