-- IMPORTANT: make psql fails in case of error (else error won't be reported by github action)
\set ON_ERROR_STOP true

-- NOTE
-- Pour générer les truncates:
-- SELECT 'TRUNCATE TABLE public.' ||  tablename || ' RESTART IDENTITY CASCADE;' FROM pg_tables WHERE tableowner='domifa_user' and tablename not like 'pg_%' and tablename not like 'sql_%' and tablename <> 'migrations';

 TRUNCATE TABLE public.app_log RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.contact_support RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.expired_token RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.interactions RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.message_sms RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.monitor_batch_process RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.open_data_cities RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.open_data_places RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.public_stats_cache RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.structure RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.structure_doc RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.structure_information RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.structure_stats_reporting RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.typeorm_metadata RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.usager RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.usager_docs RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.usager_entretien RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.usager_history_states RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.usager_notes RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.usager_options_history RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_structure RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_structure_security RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_supervisor RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_supervisor_security RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_usager RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_usager_login RESTART IDENTITY CASCADE;
 TRUNCATE TABLE public.user_usager_security RESTART IDENTITY CASCADE;

