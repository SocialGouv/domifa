

SELECT m."createdAt", m."emailId", m."content"->'to', * FROM message_email m
WHERE EXISTS (SELECT 1 FROM jsonb_array_elements((m."content"->'to'):: jsonb) as content_to 
	WHERE content_to->>'address' LIKE '%some-domain.fr%' and (m."emailId"='user-account-created-by-admin' or m."emailId"='user-reset-password')
) order by m."createdAt" desc;
    