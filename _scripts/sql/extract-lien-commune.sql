SELECT trim(regexp_replace(lower(entretien->>'liencommune'), '[^\w ]+','')) as "liencommune", count(*) FROM public.usager
where entretien->>'liencommune' is not null and entretien->>'liencommune' <> ''
group by trim(regexp_replace(lower(entretien->>'liencommune'), '[^\w ]+','')) order by count(*) desc;