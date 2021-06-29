-- fait la somme des interactions, et la compare aux totaux dans "lastInteraction"

select u."uuid", agg."usagerRef",agg."structureId", 
	u."lastInteraction"->'courrierIn' as "li.courrierIn", 
	coalesce (sum("nbInCreate" - "nbInDelete" - "nbOutCreate" + "nbOutDelete") filter (where agg."globalType" = 'courrier'),0) as "courrierIn",
	u."lastInteraction"->'colisIn' as "li.colisIn", 
	coalesce (sum("nbInCreate" - "nbInDelete" - "nbOutCreate" + "nbOutDelete") filter (where agg."globalType" = 'colis'),0) as "colisIn",
	u."lastInteraction"->'recommandeIn' as "li.recommandeIn", 
	coalesce (sum("nbInCreate" - "nbInDelete" - "nbOutCreate" + "nbOutDelete") filter (where agg."globalType" = 'recommande'),0) as "recommandeIn"
	from usager u join (
	select "usagerRef", "structureId",
		CASE 
			WHEN type in ('colisIn', 'colisOut') THEN 'colis'
			WHEN type in ('courrierIn', 'courrierOut') THEN 'courrier'
			WHEN type in ('recommandeIn', 'recommandeOut') THEN 'recommande'
		END as "globalType",
		coalesce (sum("nbCourrier") filter (where type in ('colisIn', 'courrierIn', 'recommandeIn') and event='create'),0)  as "nbInCreate",
		coalesce (sum("nbCourrier") filter (where type in ('colisOut', 'courrierOut', 'recommandeOut') and event='create'),0)  as "nbOutCreate",
		coalesce (sum("nbCourrier") filter (where type in ('colisIn', 'courrierIn', 'recommandeIn') and event='delete'),0)  as "nbInDelete",
		coalesce (sum("nbCourrier") filter (where type in ('colisOut', 'courrierOut', 'recommandeOut') and event='delete'),0)  as "nbOutDelete"
	FROM interactions i
	where type in ('colisIn', 'courrierIn', 'recommandeIn', 'colisOut', 'courrierOut', 'recommandeOut')
	group by "usagerRef", "structureId", "globalType"
) as agg on u.ref = agg."usagerRef" and u."structureId" = agg."structureId"
group by u."uuid", u."createdAt", u."lastInteraction", agg."usagerRef", agg."structureId"
order by u."createdAt";