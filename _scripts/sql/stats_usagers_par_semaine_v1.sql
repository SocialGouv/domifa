select d.day, ss.questions->'Q_11'->>'VALIDE' AS "count_v1"
from (SELECT date_trunc('day', dd)::timestamptz as day FROM generate_series ( '2020-01-01'::timestamp, now(), '1 week'::interval) dd) as d
join "structure_stats" ss on ss."date" = d.day and ss."structureId" = 74;