SELECT d.day, COUNT("uuid") AS "count v2" 
FROM "usager_history" "uh", 
(SELECT date_trunc('day', dd)::timestamptz as day
FROM generate_series
        ( '2020-01-01'::timestamp 
        , now()
        , '1 week'::interval) dd) as d
WHERE ("structureId" = 74) AND (EXISTS 
(SELECT 1 FROM LATERAL (SELECT jsonb_array_elements("uh"."states") state) states_lateral 
WHERE 
-- states_lateral.state->>'createdEvent' = 'new-decision' 
(states_lateral.state->>'isActive')::boolean
AND (states_lateral.state->>'historyBeginDate')::timestamptz <= d.day
AND ((states_lateral.state->>'historyEndDate') is null or (states_lateral.state->>'historyEndDate')::timestamptz >= d.day)
))
group by d.day
order by d.day;