-- IMPORTANT: make psql fails in case of error (else error won't be reported by github action)
\set ON_ERROR_STOP true

TRUNCATE TABLE public.interactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.message_email RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.message_sms RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.migrations RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.monitor_batch_process RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.structure_doc RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.usager_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_structure RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_structure_security RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_usager RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_usager_security RESTART IDENTITY CASCADE;


--
-- Data for Name: structure; Type: TABLE DATA; Schema: public; Owner: -
--
TRUNCATE TABLE public.structure RESTART IDENTITY CASCADE;

