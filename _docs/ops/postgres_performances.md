## Postgres performances

## Indexes

La requête suivante permet de rechercher les tables qui ont plus de scan de séquences que d'index.

Les résultats sont filtrés par `TableRows` et `TableSize` afin d'ignorer les petites tables (on peut jouer sur ce paramètre donc pour plus de finesse).

```sql
SELECT
  relname                                               AS TableName,
  to_char(seq_scan, '999,999,999,999')                  AS TotalSeqScan,
  to_char(idx_scan, '999,999,999,999')                  AS TotalIndexScan,
  ROUND(( 100 * seq_scan / idx_scan ))                  AS RatioScan,
  to_char(n_live_tup, '999,999,999,999')                AS TableRows,
  pg_size_pretty(pg_relation_size(('"' || relname || '"')::regclass)) AS TableSize
FROM pg_stat_all_tables
WHERE schemaname = 'public'
      AND 50 * seq_scan > idx_scan -- more than 2%
      AND n_live_tup > 10000
      AND pg_relation_size(('"' || relname || '"')::regclass) > 500000
ORDER BY TableRows desc, relname ASC;

```

Résultats:

| TableName   | TotalSeqScan | TotalIndexScan | RatioScan | TableRowstock | TableSize |
| ----------- | -----------: | -------------: | --------: | ------------: | --------: |
| message_sms |       25,031 |         35,273 |        71 |        55,898 |     20 MB |

Source: <https://stackoverflow.com/a/12818168>

Il faut maintenant identifier la requête coupable.

Une solution serait d'activer le log des `slow_query` ou l'extension `pg_stat_statements`, mais on n'a pas la main sur la configuration PG (il faut voir avec les ops).

Dans ce cas, il y a peut de requêtes, donc l'analyse du code suffit à trouver 2 requêtes qui ne portent pas sur des index.

On utilise `EXPLAIN ANALYZE` (sur une base locale avec la volumétrie de prod) pour analyser le plan d'éxécution:

```sql
EXPLAIN ANALYZE select * from message_sms ms where "usagerRef"= 1 and "structureId"=1;

EXPLAIN ANALYZE select * from message_sms ms
        where "interactionMetas"->>'interactionType' = 'courrier' and
            status='TO_SEND' and "usagerRef"= 1 and "structureId"=1;
```

On constate:

- l'utilisation de SEQUENCE SCAN au lieu d'INDEX SCAN
- un temps d'exécution élevé > 10ms

On ajoute donc des `@Index()` dans `MessageSmsTable.typeorm.ts`, puis on génère et exécute les migrations.

```bash
npm run db:dev:generate
npm run db:dev:migrate-up
```

Après l'ajout des indexes, on constate:

- l'utilisation d'INDEX
- un temps d'exécution faibles < 0.1ms
