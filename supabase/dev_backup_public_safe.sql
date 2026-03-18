SET session_replication_role = 'replica';
SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict yHVhtJezsc2iTlKhKRR10gbRF8lghMCUK89q3Ua5Za1ug9Cg4bskPySgDW3RRZY

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '6df75b28-ef52-4c06-be47-0c89822c0f5b', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-13 02:52:21.3365+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f21d7fa1-0278-4d7a-8972-d99d78c35317', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 03:51:59.719357+00', ''),
	('00000000-0000-0000-0000-000000000000', '006d5b01-2d4f-43e0-bb9e-2f561df9623b', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 03:51:59.734921+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cee97e36-06d0-443c-a48e-2f4ae128f49b', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 03:55:11.88517+00', ''),
	('00000000-0000-0000-0000-000000000000', '7822600b-f678-4d43-b74d-91844e6e5183', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 05:02:49.424681+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f2b5d6d5-52bc-4168-9f94-c3b1225bbcc9', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 05:02:49.446066+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad206924-c3e3-4421-abd8-1ad982d078b5', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 05:02:59.76407+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a080538-37c7-42f9-b61a-573967ad448d', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 06:01:10.895174+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5ad9479-6b2e-44b8-a85d-c5ac554cafe0', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 06:01:10.912296+00', ''),
	('00000000-0000-0000-0000-000000000000', '9666e7a6-28e3-4684-8457-c5c894d7e440', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 06:59:15.081738+00', ''),
	('00000000-0000-0000-0000-000000000000', '942beb2c-8a04-4271-9117-64dfceee5527', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 06:59:15.086132+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1cac6a8-3e7f-424e-bcbb-40a631ddf2c6', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 08:01:40.551273+00', ''),
	('00000000-0000-0000-0000-000000000000', '6cc61a61-1c2b-4757-afe5-bc7c2e17b6b5', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 08:01:40.637099+00', ''),
	('00000000-0000-0000-0000-000000000000', '331d0cc5-b19c-4dcd-9a05-da7d85c49588', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 08:01:41.559331+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aec5f7b7-9e96-4577-9070-2acbcc95b31e', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 08:59:52.518833+00', ''),
	('00000000-0000-0000-0000-000000000000', '7bb72b00-6a0d-4339-9915-2fbd556c580a', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 08:59:52.554085+00', ''),
	('00000000-0000-0000-0000-000000000000', '589cf263-e738-487d-801e-c1e9af7afb08', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 11:22:39.97923+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a4294a0-baf1-4ecf-a82a-aca94c005271', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 11:22:40.008915+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e889d0bd-9a89-470b-9e43-af343336df10', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 11:22:40.825884+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1882ce7-6c86-4327-8253-2127f62ba87a', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 13:27:43.121648+00', ''),
	('00000000-0000-0000-0000-000000000000', '3b718063-0c89-4e33-857b-a5d31e2c76f8', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 13:27:43.130474+00', ''),
	('00000000-0000-0000-0000-000000000000', '94bf7244-16ef-43dd-ac1c-66f658119133', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-13 13:27:46.584814+00', ''),
	('00000000-0000-0000-0000-000000000000', '11db9741-6d89-441e-92e6-7b4a3c65c94c', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-15 22:56:08.798958+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c99cbe10-e1a3-41cd-af52-c578beb46674', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-15 22:56:08.859538+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a364898e-d959-4947-9e18-9c1df31b4a3f', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-15 22:56:33.271076+00', ''),
	('00000000-0000-0000-0000-000000000000', '731087e5-3257-4d04-b5c5-a6802711dd6f', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-15 23:54:58.219571+00', ''),
	('00000000-0000-0000-0000-000000000000', '35124cd0-96a5-4d3c-bd9e-f25021d5129f', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-15 23:54:58.273402+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd297ceb9-8cb6-4349-a792-5082c4e76be3', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 00:02:59.509767+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a779e39-8805-4169-ad2a-7af6570979ca', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 00:03:10.100219+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e00f972-9948-4425-baef-5bf000b7053c', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 03:34:07.831562+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e81a8ddb-82c2-4e72-ba72-d60feb24c28f', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 03:34:07.892281+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8758a45-c45c-4e19-b41b-6ddbb892fe11', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 03:34:08.644066+00', ''),
	('00000000-0000-0000-0000-000000000000', '957229a2-5621-4340-95e0-e1746be22b14', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 03:48:00.883256+00', ''),
	('00000000-0000-0000-0000-000000000000', '51da93a6-c761-4cac-b361-f8233dbddbe5', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 03:58:06.378515+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf51e341-ea1a-41d2-8bd1-1ad59976856f', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 04:24:15.340836+00', ''),
	('00000000-0000-0000-0000-000000000000', '00dfa760-2ad1-4cd4-b40b-2017e133d160', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 04:34:06.663876+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6fe4f0e-8fd3-4690-b125-18a56148c06a', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 04:34:42.106044+00', ''),
	('00000000-0000-0000-0000-000000000000', '26b7d660-41c7-410d-8456-dee5bfbbaa8c', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 04:34:57.595334+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d1f6644-21e2-46cc-9206-3bcacf1a909c', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 04:35:03.075028+00', ''),
	('00000000-0000-0000-0000-000000000000', '67f349e3-1ce7-4b5e-ab2b-92b28cbf49c2', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 04:36:06.288165+00', ''),
	('00000000-0000-0000-0000-000000000000', '881786e6-e0ad-4117-af4d-5d069ac438b5', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 05:02:13.930455+00', ''),
	('00000000-0000-0000-0000-000000000000', 'febc4822-c379-4284-9e61-8875d818de14', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 05:02:52.39724+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd892a0a3-c6c7-4ab7-a4b4-d8b2e586f9e1', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 05:22:19.311218+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af611c65-c3bd-40b9-9fa6-454a78bad2f6', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 05:23:09.452822+00', ''),
	('00000000-0000-0000-0000-000000000000', '44d992c5-d64b-408d-b3e5-ae9aeed697d5', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 05:23:15.46088+00', ''),
	('00000000-0000-0000-0000-000000000000', '230f1eb5-d69e-46f0-a50f-a56642829505', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 05:27:44.055507+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a4c84c7-e2f2-4c73-9b82-bbf626aaa6a3', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 05:28:36.914088+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d3cfde5-a371-4eb8-86e0-df905a67387c', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 05:28:59.069845+00', ''),
	('00000000-0000-0000-0000-000000000000', '43352d74-c798-48e4-9a52-f604eea7d39c', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 05:29:01.342438+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a1af8b7-64d0-449a-a84c-7c1ff9199224', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 06:02:01.799123+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a815adbd-c527-4631-b992-cc40e2da6693', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 06:48:42.627926+00', ''),
	('00000000-0000-0000-0000-000000000000', '8a4dee91-42d0-4d11-85d9-657ff094d606', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-16 06:49:01.421316+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1f84377-8f9f-4032-b20d-8614b85817cb', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 07:53:01.866343+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a56234b-6498-4489-ac04-199325363ee6', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 07:53:01.881881+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ebbf686a-1a2b-41ec-9689-56d54351fedf', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 11:20:44.772334+00', ''),
	('00000000-0000-0000-0000-000000000000', '949118a7-5d8b-44be-ab8f-35ac2549ee49', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-16 11:20:44.810633+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b348e37-d22a-4853-b5bc-38536982544a', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-16 11:27:48.264806+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb883ced-49b7-45a5-a925-02cbf325a7db', '{"action":"user_confirmation_requested","actor_id":"d80099a0-66e1-453f-ae7a-6f9e3af07750","actor_username":"newuser@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-16 11:34:47.73996+00', ''),
	('00000000-0000-0000-0000-000000000000', '0eb1b385-a927-4a3c-b8a7-285b9cf5fdda', '{"action":"user_confirmation_requested","actor_id":"68f77a15-4582-46b5-a75e-90e402652888","actor_username":"newuser02@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 00:19:25.101969+00', ''),
	('00000000-0000-0000-0000-000000000000', '35c138e3-dbdb-40cb-889e-19b4ac2f7ac7', '{"action":"user_confirmation_requested","actor_id":"68f77a15-4582-46b5-a75e-90e402652888","actor_username":"newuser02@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 00:19:48.900991+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbb7773c-2cc9-406f-bac5-bca09df5f201', '{"action":"user_signedup","actor_id":"68f77a15-4582-46b5-a75e-90e402652888","actor_username":"newuser02@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 00:19:57.675014+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd77a061b-1a5b-4cf1-bc34-38a78dcc9933', '{"action":"login","actor_id":"68f77a15-4582-46b5-a75e-90e402652888","actor_username":"newuser02@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 00:21:17.264337+00', ''),
	('00000000-0000-0000-0000-000000000000', '8460d316-b0fd-4a50-9d1d-e7a702617091', '{"action":"logout","actor_id":"68f77a15-4582-46b5-a75e-90e402652888","actor_username":"newuser02@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 00:25:46.7807+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd41133f9-9c60-4ea6-9636-32ba502df0bc', '{"action":"user_confirmation_requested","actor_id":"bcbb1670-1f55-4321-bbd9-b05dcaa556c9","actor_username":"newuser03@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 00:26:28.49353+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6f62fb0-023a-463e-a778-567fcd6eba21', '{"action":"user_signedup","actor_id":"bcbb1670-1f55-4321-bbd9-b05dcaa556c9","actor_username":"newuser03@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 00:27:21.072931+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b458778-5f7a-454d-a85f-27004b25bd1c', '{"action":"login","actor_id":"bcbb1670-1f55-4321-bbd9-b05dcaa556c9","actor_username":"newuser03@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 00:28:18.994361+00', ''),
	('00000000-0000-0000-0000-000000000000', '937e4250-fec8-4464-b16d-a9ec374979a8', '{"action":"logout","actor_id":"bcbb1670-1f55-4321-bbd9-b05dcaa556c9","actor_username":"newuser03@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 00:50:05.920254+00', ''),
	('00000000-0000-0000-0000-000000000000', '08fa6477-f9a6-4c47-b728-6f60aede4b2c', '{"action":"user_confirmation_requested","actor_id":"df812d01-23e7-48e6-a906-4493ba7679ed","actor_username":"newuser04@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 00:50:43.764083+00', ''),
	('00000000-0000-0000-0000-000000000000', '759c81e8-8c17-43e6-9ae6-302de347114c', '{"action":"user_signedup","actor_id":"df812d01-23e7-48e6-a906-4493ba7679ed","actor_username":"newuser04@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 00:50:52.559034+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb90261e-1a51-45e8-9750-7a15a19d3c4a', '{"action":"login","actor_id":"df812d01-23e7-48e6-a906-4493ba7679ed","actor_username":"newuser04@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}', '2026-03-17 00:50:59.102249+00', ''),
	('00000000-0000-0000-0000-000000000000', '339127d8-a09e-4abb-a033-1c15de2eac12', '{"action":"logout","actor_id":"df812d01-23e7-48e6-a906-4493ba7679ed","actor_username":"newuser04@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 00:57:02.058296+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f0840388-b0e1-4933-9f93-d243d535f088', '{"action":"user_confirmation_requested","actor_id":"d80099a0-66e1-453f-ae7a-6f9e3af07750","actor_username":"newuser@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 00:58:14.589114+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f79a6976-ee91-4d55-b4a4-1af3c589a2fe', '{"action":"user_signedup","actor_id":"d80099a0-66e1-453f-ae7a-6f9e3af07750","actor_username":"newuser@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 00:58:20.289911+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f04475c-fd07-4148-b398-1f02d72747a9', '{"action":"login","actor_id":"d80099a0-66e1-453f-ae7a-6f9e3af07750","actor_username":"newuser@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 00:59:26.441349+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b5ed19e-c542-4c24-92e8-368378c70f20', '{"action":"user_confirmation_requested","actor_id":"a1eb0a6c-44a3-4893-b50d-3861c88856ce","actor_username":"newuser05@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 01:16:37.388632+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ffc7901c-8a1a-4c0d-bb48-5159cfedea4d', '{"action":"user_confirmation_requested","actor_id":"a1eb0a6c-44a3-4893-b50d-3861c88856ce","actor_username":"newuser05@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:17:06.015946+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b02c41c-39af-47aa-b834-51980f742de6', '{"action":"user_signedup","actor_id":"a1eb0a6c-44a3-4893-b50d-3861c88856ce","actor_username":"newuser05@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 01:17:19.79647+00', ''),
	('00000000-0000-0000-0000-000000000000', '95c81fdc-85a1-43e6-8e6a-10384e74353e', '{"action":"login","actor_id":"a1eb0a6c-44a3-4893-b50d-3861c88856ce","actor_username":"newuser05@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 01:19:27.537104+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dc77ef34-dd76-4f0b-b8df-43e5affd213b', '{"action":"user_confirmation_requested","actor_id":"f7efd216-7fed-4f1a-8f8c-b779bcd75031","actor_username":"newuser06@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 01:21:22.601624+00', ''),
	('00000000-0000-0000-0000-000000000000', '11ed0ccf-ed2f-4999-8e15-deb4caf06a14', '{"action":"user_confirmation_requested","actor_id":"f7efd216-7fed-4f1a-8f8c-b779bcd75031","actor_username":"newuser06@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:22:03.160257+00', ''),
	('00000000-0000-0000-0000-000000000000', '98c6f8d3-01d3-42ef-bd64-c202f78ab85b', '{"action":"user_confirmation_requested","actor_id":"f7efd216-7fed-4f1a-8f8c-b779bcd75031","actor_username":"newuser06@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:22:31.568629+00', ''),
	('00000000-0000-0000-0000-000000000000', '98eb3a65-8781-476a-97ea-43434550545c', '{"action":"user_signedup","actor_id":"f7efd216-7fed-4f1a-8f8c-b779bcd75031","actor_username":"newuser06@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 01:22:39.062318+00', ''),
	('00000000-0000-0000-0000-000000000000', '9594d209-3d2e-47ea-b570-16849d73fb6c', '{"action":"logout","actor_id":"a1eb0a6c-44a3-4893-b50d-3861c88856ce","actor_username":"newuser05@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 01:28:41.817922+00', ''),
	('00000000-0000-0000-0000-000000000000', '3bfdddd1-f695-4dcb-a1b4-e3881c5149ee', '{"action":"user_confirmation_requested","actor_id":"23a0c48b-dcd9-4346-a904-5f5781839bb8","actor_username":"newuser07@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 01:30:28.070957+00', ''),
	('00000000-0000-0000-0000-000000000000', '6fbfaee2-094e-4e59-aea7-85372808a05c', '{"action":"user_confirmation_requested","actor_id":"23a0c48b-dcd9-4346-a904-5f5781839bb8","actor_username":"newuser07@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:31:04.628098+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cbce57fc-17cb-4e0c-8d33-700148b33806', '{"action":"user_confirmation_requested","actor_id":"23a0c48b-dcd9-4346-a904-5f5781839bb8","actor_username":"newuser07@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:31:23.84553+00', ''),
	('00000000-0000-0000-0000-000000000000', '1186c169-602b-47cc-8249-685aa61ded66', '{"action":"user_confirmation_requested","actor_id":"23a0c48b-dcd9-4346-a904-5f5781839bb8","actor_username":"newuser07@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:32:22.497607+00', ''),
	('00000000-0000-0000-0000-000000000000', '00ae33f0-6ccf-4a90-8071-a2e183d277f3', '{"action":"user_confirmation_requested","actor_id":"23a0c48b-dcd9-4346-a904-5f5781839bb8","actor_username":"newuser07@example.test","actor_via_sso":false,"log_type":"user"}', '2026-03-17 01:34:24.134249+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bc8d6974-286b-46ee-bbfb-ea53149f574d', '{"action":"user_confirmation_requested","actor_id":"46f56cd3-6721-4dbf-b832-d7b34ea7ac94","actor_username":"newuser-middle@example.test","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-03-17 04:57:40.662624+00', ''),
	('00000000-0000-0000-0000-000000000000', '1388d05b-135c-4cd3-a94e-ade86bbca1d1', '{"action":"user_signedup","actor_id":"46f56cd3-6721-4dbf-b832-d7b34ea7ac94","actor_username":"newuser-middle@example.test","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-03-17 04:58:00.424317+00', ''),
	('00000000-0000-0000-0000-000000000000', '0238714e-6198-40ff-9da3-0893988681f4', '{"action":"login","actor_id":"46f56cd3-6721-4dbf-b832-d7b34ea7ac94","actor_username":"newuser-middle@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}', '2026-03-17 04:58:04.570737+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f2fb47be-3130-47f4-86c2-b50ba715ecb1', '{"action":"logout","actor_id":"46f56cd3-6721-4dbf-b832-d7b34ea7ac94","actor_username":"newuser-middle@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 04:59:52.284155+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cbb0d3a8-4cf0-4e19-a352-a93fcb24a103', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 06:28:24.236321+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ebf60b47-a886-4c8e-935a-1ac0aeb669dd', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 06:43:30.027585+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f0876281-aca3-4e36-94d7-e944d849d147', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 06:45:33.098597+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f2c53b1-b0e6-4499-b25f-2dcbd8ebc5f0', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 06:45:45.376761+00', ''),
	('00000000-0000-0000-0000-000000000000', '98c647db-ffad-4387-b4cf-ceadf7c1535c', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 06:53:51.830771+00', ''),
	('00000000-0000-0000-0000-000000000000', '32ee2f0d-ec21-4c19-b38f-c7730efc27f1', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 06:57:43.498689+00', ''),
	('00000000-0000-0000-0000-000000000000', '33a3e52f-ac6b-4059-bb04-13c1050c035f', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 06:58:10.132876+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2825b96-d35d-47e1-be66-35e60994458c', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 06:58:22.471489+00', ''),
	('00000000-0000-0000-0000-000000000000', '13a9a69a-74af-4d36-b741-25e9b8076232', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 06:59:02.330055+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a33dfa32-b14e-436e-8c09-c778cd4012f6', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account"}', '2026-03-17 07:16:05.457894+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9aee231-4911-4783-a4e9-b36abec883b7', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 07:16:20.631308+00', ''),
	('00000000-0000-0000-0000-000000000000', '63aa449c-eed3-4fbf-9e60-526be136b3ec', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-17 08:14:37.572055+00', ''),
	('00000000-0000-0000-0000-000000000000', '700e834a-be06-41cf-911e-a35f69cfc6f0', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-17 08:14:37.575818+00', ''),
	('00000000-0000-0000-0000-000000000000', '55533f89-faa6-4cde-8b95-8e2ac892bc87', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-17 22:10:37.473927+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6c84c6f-17f7-433c-8c72-bc95cff13339', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"alice@example.test","actor_via_sso":false,"log_type":"token"}', '2026-03-17 22:10:37.476591+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('f2cc03c1-5ee1-4024-8465-487d21770c2d', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', 'd9983e68-c95b-4e3c-9331-ade1262c2a84', 's256', 'Zi_00HL40UeI9jqDvANGI700JP6Av5874InwuG2JXBQ', 'email', '', '', '2026-03-16 11:34:47.742584+00', '2026-03-16 11:34:47.742584+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('bed72a42-c4ad-4d74-938c-d2596d13e07c', '68f77a15-4582-46b5-a75e-90e402652888', '96e0cc57-815c-49ce-bfa1-38932504998e', 's256', 'UAzJruFxmmLmidE_N0V4tdjR9sX_rdPX4I-256QD-B4', 'email', '', '', '2026-03-17 00:19:25.110048+00', '2026-03-17 00:19:25.110048+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('e92b4e10-4e18-4227-83b8-41d10f90e769', 'bcbb1670-1f55-4321-bbd9-b05dcaa556c9', 'f1396af6-06c4-49df-a0a2-9e57df1d5488', 's256', 'AtcnVzFSxJsL25JugEeD3AbRnFpZ6wLEKxYYn2bpVS8', 'email', '', '', '2026-03-17 00:26:28.495697+00', '2026-03-17 00:27:21.099335+00', 'email/signup', '2026-03-17 00:27:21.099163+00', NULL, NULL, NULL, NULL, false),
	('c64f1ee2-1694-41d9-9efa-d01ae87fad8a', 'a1eb0a6c-44a3-4893-b50d-3861c88856ce', '9f6c8ceb-25cb-49a4-af53-9501a2f0291d', 's256', 'WjIvIZPQkanLR0PO-gA0AAI784xM6m0mEW9fRd-qc3A', 'email', '', '', '2026-03-17 01:16:37.391014+00', '2026-03-17 01:16:37.391014+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('4505db98-ed0b-4410-b293-216b3696fa5d', 'f7efd216-7fed-4f1a-8f8c-b779bcd75031', '2a0d7b8b-0a8d-46ca-bd64-18c378e12142', 's256', 'VujTWKlCnI_-XeHuJKKQxYNdS-nUj2dQMrQHkH867M4', 'email', '', '', '2026-03-17 01:21:22.603664+00', '2026-03-17 01:21:22.603664+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('f4175c6f-3a3c-4c2b-923c-c34f22fb6464', '23a0c48b-dcd9-4346-a904-5f5781839bb8', '7eeeab09-ba77-4d53-9293-559223a2b833', 's256', 'rWsqFSjdFkZ3QPHwCGu03e-qGnsO2KsPLv3yngJTiXk', 'email', '', '', '2026-03-17 01:30:28.072925+00', '2026-03-17 01:30:28.072925+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'bob@example.test', '$2a$06$MEU4uq4db0A1N.85M/zQ1uDzIS8CpVHPy.H19JllOc/ekHHuPQMOq', '2026-03-13 00:09:21.592598+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Bob"}', NULL, '2026-03-13 00:09:21.592598+00', '2026-03-13 00:09:21.592598+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'charlie@example.test', '$2a$06$G1ELJ2n7PXwkuFflyQVqP.FClCIsUiB8Nt8Ro1yB.pVW2EMgSftRK', '2026-03-13 00:09:21.592598+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"name": "Charlie"}', NULL, '2026-03-13 00:09:21.592598+00', '2026-03-13 00:09:21.592598+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', 'authenticated', 'authenticated', 'newuser@example.test', '$2a$10$.OuPqClWvSst0QEWISoh6ejCsfauFpPoQpV3Xjq3q82Mt2aOpnUAa', '2026-03-17 00:58:20.296457+00', NULL, '', '2026-03-17 00:58:14.591611+00', '', NULL, '', '', NULL, '2026-03-17 00:59:26.44431+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d80099a0-66e1-453f-ae7a-6f9e3af07750", "name": "メール認証ユーザー", "email": "newuser@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-16 11:34:47.701502+00', '2026-03-17 00:59:26.451581+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bcbb1670-1f55-4321-bbd9-b05dcaa556c9', 'authenticated', 'authenticated', 'newuser03@example.test', '$2a$10$PrXH11vZpgiuDu/h9da/FeKG6biwxtnXnjtZgAmunlt5c4bPHLCMq', '2026-03-17 00:27:21.076046+00', NULL, '', '2026-03-17 00:26:28.498092+00', '', NULL, '', '', NULL, '2026-03-17 00:28:18.998274+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "bcbb1670-1f55-4321-bbd9-b05dcaa556c9", "name": "認証ユーザー３", "email": "newuser03@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 00:26:28.474399+00', '2026-03-17 00:28:19.004644+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '68f77a15-4582-46b5-a75e-90e402652888', 'authenticated', 'authenticated', 'newuser02@example.test', '$2a$10$D99rqv0f83KqsWNCT1vKgukSUjSRuNKWz51R9zHSd7yvQOOVZzypu', '2026-03-17 00:19:57.6804+00', NULL, '', '2026-03-17 00:19:48.903544+00', '', NULL, '', '', NULL, '2026-03-17 00:21:17.266833+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "68f77a15-4582-46b5-a75e-90e402652888", "name": "メール認証完了ユーザー", "email": "newuser02@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 00:19:25.051468+00', '2026-03-17 00:21:17.273253+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'df812d01-23e7-48e6-a906-4493ba7679ed', 'authenticated', 'authenticated', 'newuser04@example.test', '$2a$10$1fgBS5mqsj3UnSdzbd5iq.isnsKNQ28MfE0JoqPF5JueVEmw/tIsq', '2026-03-17 00:50:52.561167+00', NULL, '', '2026-03-17 00:50:43.770639+00', '', NULL, '', '', NULL, '2026-03-17 00:50:59.105311+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "df812d01-23e7-48e6-a906-4493ba7679ed", "name": "メール認証ユーザー4", "email": "newuser04@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 00:50:43.740288+00', '2026-03-17 00:50:59.113596+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a1eb0a6c-44a3-4893-b50d-3861c88856ce', 'authenticated', 'authenticated', 'newuser05@example.test', '$2a$10$koAJfcNr3TJI4D7pC7KH4uDgCty9T/P8s8UbwkQpro9g4XO/8sxde', '2026-03-17 01:17:19.799103+00', NULL, '', '2026-03-17 01:17:06.018405+00', '', NULL, '', '', NULL, '2026-03-17 01:19:27.539523+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a1eb0a6c-44a3-4893-b50d-3861c88856ce", "name": "メール認証ユーザー５", "email": "newuser05@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 01:16:37.364363+00', '2026-03-17 01:19:27.546064+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f7efd216-7fed-4f1a-8f8c-b779bcd75031', 'authenticated', 'authenticated', 'newuser06@example.test', '$2a$10$8fyd5/14O1t5lYLC5CAO7ODcqVYES9qqGq0SqFPrj7Dbneso.Bif2', '2026-03-17 01:22:39.065334+00', NULL, '', '2026-03-17 01:22:31.571938+00', '', NULL, '', '', NULL, '2026-03-17 01:22:39.077473+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f7efd216-7fed-4f1a-8f8c-b779bcd75031", "name": "メール認証ユーザー6", "email": "newuser06@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 01:21:22.584779+00', '2026-03-17 01:22:39.103138+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '23a0c48b-dcd9-4346-a904-5f5781839bb8', 'authenticated', 'authenticated', 'newuser07@example.test', '$2a$10$HWJTGjZ6wOS/A1G7TIhAX.Qs60njF7EWZUjzUsMqrGCv82wz4q462', NULL, NULL, '2a00b152dc8f4e314b7f5d7d83d5db3d0947a42e8c9e7cf52176b87e', '2026-03-17 01:34:24.136953+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "23a0c48b-dcd9-4346-a904-5f5781839bb8", "name": "メール認証ユーザー7", "email": "newuser07@example.test", "email_verified": false, "phone_verified": false}', NULL, '2026-03-17 01:30:28.047809+00', '2026-03-17 01:34:24.162383+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '46f56cd3-6721-4dbf-b832-d7b34ea7ac94', 'authenticated', 'authenticated', 'newuser-middle@example.test', '$2a$10$jcmyKby5z40kITS7xKv14O5CRzJP3BkWqTed80yXC/7MVnAQFd7nm', '2026-03-17 04:58:00.426775+00', NULL, '', '2026-03-17 04:57:40.687318+00', '', NULL, '', '', NULL, '2026-03-17 04:58:04.574585+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "46f56cd3-6721-4dbf-b832-d7b34ea7ac94", "name": "ミドル", "email": "newuser-middle@example.test", "email_verified": true, "phone_verified": false}', NULL, '2026-03-17 04:57:40.621347+00', '2026-03-17 04:58:04.596046+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'alice@example.test', '$2a$06$/ll69FcnPD/gWsAb/9cMR.NTxoznGFn1DtM.8L/TGLbQeOe1zumiq', '2026-03-13 00:09:21.592598+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-17 07:16:20.634228+00', '{"provider": "email", "providers": ["email"]}', '{"name": "Alice"}', NULL, '2026-03-13 00:09:21.592598+00', '2026-03-17 22:10:37.482119+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('68f77a15-4582-46b5-a75e-90e402652888', '68f77a15-4582-46b5-a75e-90e402652888', '{"sub": "68f77a15-4582-46b5-a75e-90e402652888", "name": "メール認証完了ユーザー", "email": "newuser02@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-17 00:19:25.095489+00', '2026-03-17 00:19:25.095548+00', '2026-03-17 00:19:25.095548+00', '4c62b3aa-2c42-473f-a12d-4c391f6923fc'),
	('bcbb1670-1f55-4321-bbd9-b05dcaa556c9', 'bcbb1670-1f55-4321-bbd9-b05dcaa556c9', '{"sub": "bcbb1670-1f55-4321-bbd9-b05dcaa556c9", "name": "認証ユーザー３", "email": "newuser03@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-17 00:26:28.486269+00', '2026-03-17 00:26:28.486316+00', '2026-03-17 00:26:28.486316+00', 'a2d232e2-1ea6-4958-ac66-5e5fbe3acb76'),
	('df812d01-23e7-48e6-a906-4493ba7679ed', 'df812d01-23e7-48e6-a906-4493ba7679ed', '{"sub": "df812d01-23e7-48e6-a906-4493ba7679ed", "name": "メール認証ユーザー4", "email": "newuser04@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-17 00:50:43.759432+00', '2026-03-17 00:50:43.759492+00', '2026-03-17 00:50:43.759492+00', 'b7a20f53-24a3-45ef-8a65-a02f8c3e8c4c'),
	('d80099a0-66e1-453f-ae7a-6f9e3af07750', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', '{"sub": "d80099a0-66e1-453f-ae7a-6f9e3af07750", "name": "メール認証ユーザー", "email": "newuser@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-16 11:34:47.733694+00', '2026-03-16 11:34:47.733744+00', '2026-03-16 11:34:47.733744+00', '45244e54-0538-4144-947e-c9c74d775607'),
	('a1eb0a6c-44a3-4893-b50d-3861c88856ce', 'a1eb0a6c-44a3-4893-b50d-3861c88856ce', '{"sub": "a1eb0a6c-44a3-4893-b50d-3861c88856ce", "name": "メール認証ユーザー５", "email": "newuser05@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-17 01:16:37.379764+00', '2026-03-17 01:16:37.379826+00', '2026-03-17 01:16:37.379826+00', '0c896099-bab5-4a3f-a64a-c568b26eeed8'),
	('f7efd216-7fed-4f1a-8f8c-b779bcd75031', 'f7efd216-7fed-4f1a-8f8c-b779bcd75031', '{"sub": "f7efd216-7fed-4f1a-8f8c-b779bcd75031", "name": "メール認証ユーザー6", "email": "newuser06@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-17 01:21:22.59432+00', '2026-03-17 01:21:22.594381+00', '2026-03-17 01:21:22.594381+00', '3ab40306-7e6e-4eae-b08e-a98b26c698d1'),
	('23a0c48b-dcd9-4346-a904-5f5781839bb8', '23a0c48b-dcd9-4346-a904-5f5781839bb8', '{"sub": "23a0c48b-dcd9-4346-a904-5f5781839bb8", "name": "メール認証ユーザー7", "email": "newuser07@example.test", "email_verified": false, "phone_verified": false}', 'email', '2026-03-17 01:30:28.065308+00', '2026-03-17 01:30:28.065363+00', '2026-03-17 01:30:28.065363+00', '0bb7b235-b56c-4409-94a6-984c72bfcf2c'),
	('46f56cd3-6721-4dbf-b832-d7b34ea7ac94', '46f56cd3-6721-4dbf-b832-d7b34ea7ac94', '{"sub": "46f56cd3-6721-4dbf-b832-d7b34ea7ac94", "name": "ミドル", "email": "newuser-middle@example.test", "email_verified": true, "phone_verified": false}', 'email', '2026-03-17 04:57:40.653994+00', '2026-03-17 04:57:40.65406+00', '2026-03-17 04:57:40.65406+00', '2040b74c-aa60-452e-b47c-28810cfefb9c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('4e51bba9-c9b6-4572-a453-443a62c796ec', 'f7efd216-7fed-4f1a-8f8c-b779bcd75031', '2026-03-17 01:22:39.077619+00', '2026-03-17 01:22:39.077619+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('16df6f25-0e63-4c6d-9641-a1a16b424c26', '00000000-0000-0000-0000-000000000001', '2026-03-17 07:16:20.634396+00', '2026-03-17 22:10:37.485495+00', NULL, 'aal1', NULL, '2026-03-17 22:10:37.485369', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('38e63b93-5217-476e-96da-4579610bc3fd', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', '2026-03-17 00:58:20.311694+00', '2026-03-17 00:58:20.311694+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('927f0107-7548-492b-a187-40639acb275c', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', '2026-03-17 00:59:26.444468+00', '2026-03-17 00:59:26.444468+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('38e63b93-5217-476e-96da-4579610bc3fd', '2026-03-17 00:58:20.326293+00', '2026-03-17 00:58:20.326293+00', 'otp', '0ce3dae9-dcd9-432d-a2b8-3a494bb5ac28'),
	('927f0107-7548-492b-a187-40639acb275c', '2026-03-17 00:59:26.453041+00', '2026-03-17 00:59:26.453041+00', 'password', 'e8704845-215a-4a9a-a410-90a312071e41'),
	('4e51bba9-c9b6-4572-a453-443a62c796ec', '2026-03-17 01:22:39.104489+00', '2026-03-17 01:22:39.104489+00', 'otp', 'efa5c9c7-87d9-4771-ab78-fbad7834b782'),
	('16df6f25-0e63-4c6d-9641-a1a16b424c26', '2026-03-17 07:16:20.641911+00', '2026-03-17 07:16:20.641911+00', 'password', 'bef97c17-9a76-45a4-a050-89660db781b4');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('1cfa0182-e8b8-4d63-83a7-0b886a90adce', '23a0c48b-dcd9-4346-a904-5f5781839bb8', 'confirmation_token', '2a00b152dc8f4e314b7f5d7d83d5db3d0947a42e8c9e7cf52176b87e', 'newuser07@example.test', '2026-03-17 01:34:24.167264', '2026-03-17 01:34:24.167264');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 30, '6byf4zt7lvuq', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', false, '2026-03-17 00:58:20.315756+00', '2026-03-17 00:58:20.315756+00', NULL, '38e63b93-5217-476e-96da-4579610bc3fd'),
	('00000000-0000-0000-0000-000000000000', 31, 'whgaqeqcamz7', 'd80099a0-66e1-453f-ae7a-6f9e3af07750', false, '2026-03-17 00:59:26.449045+00', '2026-03-17 00:59:26.449045+00', NULL, '927f0107-7548-492b-a187-40639acb275c'),
	('00000000-0000-0000-0000-000000000000', 34, 'lbeoootyx2l7', 'f7efd216-7fed-4f1a-8f8c-b779bcd75031', false, '2026-03-17 01:22:39.098197+00', '2026-03-17 01:22:39.098197+00', NULL, '4e51bba9-c9b6-4572-a453-443a62c796ec'),
	('00000000-0000-0000-0000-000000000000', 41, 'ykctvgqbabea', '00000000-0000-0000-0000-000000000001', true, '2026-03-17 07:16:20.638487+00', '2026-03-17 08:14:37.577023+00', NULL, '16df6f25-0e63-4c6d-9641-a1a16b424c26'),
	('00000000-0000-0000-0000-000000000000', 42, 'ns2ot5jqtjzt', '00000000-0000-0000-0000-000000000001', true, '2026-03-17 08:14:37.581856+00', '2026-03-17 22:10:37.477951+00', 'ykctvgqbabea', '16df6f25-0e63-4c6d-9641-a1a16b424c26'),
	('00000000-0000-0000-0000-000000000000', 43, 'k7miq2w4nszn', '00000000-0000-0000-0000-000000000001', false, '2026-03-17 22:10:37.479618+00', '2026-03-17 22:10:37.479618+00', 'ns2ot5jqtjzt', '16df6f25-0e63-4c6d-9641-a1a16b424c26');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "name", "email", "profile_text", "avatar_url", "created_at", "updated_at") VALUES
	('00000000-0000-0000-0000-000000000002', 'Bob', 'bob@example.test', NULL, '00000000-0000-0000-0000-000000000002/avatar.png', '2026-03-13 00:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	('00000000-0000-0000-0000-000000000003', 'Charlie', 'charlie@example.test', NULL, '00000000-0000-0000-0000-000000000003/avatar.png', '2026-03-13 00:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	('00000000-0000-0000-0000-000000000001', 'Alice-6', 'alice@example.test', '自己紹介テスト6', '00000000-0000-0000-0000-000000000001/avatar.png', '2026-03-13 00:09:21.592598+00', '2026-03-16 06:37:14.907+00'),
	('d80099a0-66e1-453f-ae7a-6f9e3af07750', 'メール認証ユーザー', 'newuser@example.test', NULL, NULL, '2026-03-16 11:34:47.700675+00', '2026-03-16 11:34:47.700675+00'),
	('68f77a15-4582-46b5-a75e-90e402652888', 'メール認証完了ユーザー', 'newuser02@example.test', NULL, NULL, '2026-03-17 00:19:25.046229+00', '2026-03-17 00:19:25.046229+00'),
	('bcbb1670-1f55-4321-bbd9-b05dcaa556c9', '認証ユーザー３', 'newuser03@example.test', NULL, NULL, '2026-03-17 00:26:28.473781+00', '2026-03-17 00:26:28.473781+00'),
	('df812d01-23e7-48e6-a906-4493ba7679ed', 'メール認証ユーザー4', 'newuser04@example.test', NULL, NULL, '2026-03-17 00:50:43.739784+00', '2026-03-17 00:50:43.739784+00'),
	('a1eb0a6c-44a3-4893-b50d-3861c88856ce', 'メール認証ユーザー５', 'newuser05@example.test', NULL, NULL, '2026-03-17 01:16:37.363544+00', '2026-03-17 01:16:37.363544+00'),
	('f7efd216-7fed-4f1a-8f8c-b779bcd75031', 'メール認証ユーザー6', 'newuser06@example.test', NULL, NULL, '2026-03-17 01:21:22.584343+00', '2026-03-17 01:21:22.584343+00'),
	('23a0c48b-dcd9-4346-a904-5f5781839bb8', 'メール認証ユーザー7', 'newuser07@example.test', NULL, NULL, '2026-03-17 01:30:28.047045+00', '2026-03-17 01:30:28.047045+00'),
	('46f56cd3-6721-4dbf-b832-d7b34ea7ac94', 'ミドル', 'newuser-middle@example.test', '自己紹介', '46f56cd3-6721-4dbf-b832-d7b34ea7ac94/avatar.png', '2026-03-17 04:57:40.618653+00', '2026-03-17 04:58:36.525+00');


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."follows" ("id", "follower_id", "followee_id", "created_at") VALUES
	(7, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '2026-03-17 06:43:20.874959+00');


--
-- Data for Name: tweets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tweets" ("id", "user_id", "parent_id", "content", "created_at", "updated_at") VALUES
	(1, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 1 件目です。無限スクロールのテスト中！', '2026-03-12 23:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(2, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 2 件目です。無限スクロールのテスト中！', '2026-03-12 22:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(3, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 3 件目です。無限スクロールのテスト中！', '2026-03-12 21:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(4, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 4 件目です。無限スクロールのテスト中！', '2026-03-12 20:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(5, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 5 件目です。無限スクロールのテスト中！', '2026-03-12 19:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(6, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 6 件目です。無限スクロールのテスト中！', '2026-03-12 18:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(7, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 7 件目です。無限スクロールのテスト中！', '2026-03-12 17:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(8, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 8 件目です。無限スクロールのテスト中！', '2026-03-12 16:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(9, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 9 件目です。無限スクロールのテスト中！', '2026-03-12 15:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(10, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 10 件目です。無限スクロールのテスト中！', '2026-03-12 14:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(11, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 11 件目です。無限スクロールのテスト中！', '2026-03-12 13:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(12, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 12 件目です。無限スクロールのテスト中！', '2026-03-12 12:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(13, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 13 件目です。無限スクロールのテスト中！', '2026-03-12 11:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(14, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 14 件目です。無限スクロールのテスト中！', '2026-03-12 10:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(15, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 15 件目です。無限スクロールのテスト中！', '2026-03-12 09:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(16, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 16 件目です。無限スクロールのテスト中！', '2026-03-12 08:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(17, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 17 件目です。無限スクロールのテスト中！', '2026-03-12 07:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(18, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 18 件目です。無限スクロールのテスト中！', '2026-03-12 06:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(19, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 19 件目です。無限スクロールのテスト中！', '2026-03-12 05:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(20, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 20 件目です。無限スクロールのテスト中！', '2026-03-12 04:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(21, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 21 件目です。無限スクロールのテスト中！', '2026-03-12 03:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(22, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 22 件目です。無限スクロールのテスト中！', '2026-03-12 02:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(23, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 23 件目です。無限スクロールのテスト中！', '2026-03-12 01:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(24, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 24 件目です。無限スクロールのテスト中！', '2026-03-12 00:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(25, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 25 件目です。無限スクロールのテスト中！', '2026-03-11 23:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(26, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 26 件目です。無限スクロールのテスト中！', '2026-03-11 22:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(27, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 27 件目です。無限スクロールのテスト中！', '2026-03-11 21:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(28, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 28 件目です。無限スクロールのテスト中！', '2026-03-11 20:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(29, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 29 件目です。無限スクロールのテスト中！', '2026-03-11 19:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(30, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 30 件目です。無限スクロールのテスト中！', '2026-03-11 18:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(31, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 31 件目です。無限スクロールのテスト中！', '2026-03-11 17:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(32, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 32 件目です。無限スクロールのテスト中！', '2026-03-11 16:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(33, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 33 件目です。無限スクロールのテスト中！', '2026-03-11 15:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(34, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 34 件目です。無限スクロールのテスト中！', '2026-03-11 14:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(35, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 35 件目です。無限スクロールのテスト中！', '2026-03-11 13:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(36, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 36 件目です。無限スクロールのテスト中！', '2026-03-11 12:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(37, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 37 件目です。無限スクロールのテスト中！', '2026-03-11 11:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(38, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 38 件目です。無限スクロールのテスト中！', '2026-03-11 10:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(39, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 39 件目です。無限スクロールのテスト中！', '2026-03-11 09:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(40, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 40 件目です。無限スクロールのテスト中！', '2026-03-11 08:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(41, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 41 件目です。無限スクロールのテスト中！', '2026-03-11 07:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(42, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 42 件目です。無限スクロールのテスト中！', '2026-03-11 06:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(43, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 43 件目です。無限スクロールのテスト中！', '2026-03-11 05:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(44, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 44 件目です。無限スクロールのテスト中！', '2026-03-11 04:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(45, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 45 件目です。無限スクロールのテスト中！', '2026-03-11 03:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(46, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 46 件目です。無限スクロールのテスト中！', '2026-03-11 02:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(47, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 47 件目です。無限スクロールのテスト中！', '2026-03-11 01:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(48, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 48 件目です。無限スクロールのテスト中！', '2026-03-11 00:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(49, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 49 件目です。無限スクロールのテスト中！', '2026-03-10 23:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(50, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 50 件目です。無限スクロールのテスト中！', '2026-03-10 22:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(51, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 51 件目です。無限スクロールのテスト中！', '2026-03-10 21:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(52, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 52 件目です。無限スクロールのテスト中！', '2026-03-10 20:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(53, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 53 件目です。無限スクロールのテスト中！', '2026-03-10 19:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(54, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 54 件目です。無限スクロールのテスト中！', '2026-03-10 18:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(55, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 55 件目です。無限スクロールのテスト中！', '2026-03-10 17:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(56, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 56 件目です。無限スクロールのテスト中！', '2026-03-10 16:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(57, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 57 件目です。無限スクロールのテスト中！', '2026-03-10 15:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(58, '00000000-0000-0000-0000-000000000002', NULL, 'これはテスト投稿の 58 件目です。無限スクロールのテスト中！', '2026-03-10 14:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(59, '00000000-0000-0000-0000-000000000003', NULL, 'これはテスト投稿の 59 件目です。無限スクロールのテスト中！', '2026-03-10 13:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(60, '00000000-0000-0000-0000-000000000001', NULL, 'これはテスト投稿の 60 件目です。無限スクロールのテスト中！', '2026-03-10 12:09:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(61, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 1 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:08:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(62, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 2 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:07:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(63, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 3 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:06:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(64, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 4 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:05:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(65, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 5 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:04:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(66, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 6 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:03:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(67, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 7 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:02:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(68, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 8 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:01:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(69, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 9 件目。詳細画面の無限スクロールを検証しています。', '2026-03-13 00:00:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(70, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 10 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:59:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(71, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 11 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:58:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(72, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 12 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:57:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(73, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 13 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:56:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(74, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 14 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:55:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(75, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 15 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:54:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(76, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 16 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:53:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(77, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 17 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:52:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(78, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 18 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:51:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(79, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 19 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:50:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(80, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 20 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:49:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(81, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 21 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:48:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(82, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 22 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:47:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(83, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 23 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:46:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(84, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 24 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:45:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(85, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 25 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:44:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(86, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 26 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:43:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(87, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 27 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:42:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(88, '00000000-0000-0000-0000-000000000002', 1, '返信テスト 28 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:41:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(89, '00000000-0000-0000-0000-000000000003', 1, '返信テスト 29 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:40:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(90, '00000000-0000-0000-0000-000000000001', 1, '返信テスト 30 件目。詳細画面の無限スクロールを検証しています。', '2026-03-12 23:39:21.592598+00', '2026-03-13 00:09:21.592598+00'),
	(91, '00000000-0000-0000-0000-000000000001', NULL, '投稿テスト3月16日', '2026-03-16 03:35:08.99291+00', '2026-03-16 03:35:08.99291+00'),
	(92, '00000000-0000-0000-0000-000000000001', NULL, '投稿テスト１２３
', '2026-03-16 03:58:21.319842+00', '2026-03-16 03:58:21.319842+00'),
	(93, '00000000-0000-0000-0000-000000000001', NULL, 'プロフィール画面からの投稿', '2026-03-16 03:58:55.083209+00', '2026-03-16 03:58:55.083209+00'),
	(100, '00000000-0000-0000-0000-000000000001', 93, '反映テスト', '2026-03-16 07:21:55.609106+00', '2026-03-16 07:21:55.609106+00'),
	(101, '00000000-0000-0000-0000-000000000001', 93, '反映テスト２', '2026-03-16 07:22:15.839683+00', '2026-03-16 07:22:15.839683+00'),
	(102, '00000000-0000-0000-0000-000000000001', 100, '反映テストへの送信', '2026-03-16 07:23:19.074429+00', '2026-03-16 07:23:19.074429+00'),
	(103, '46f56cd3-6721-4dbf-b832-d7b34ea7ac94', 93, '返信', '2026-03-17 04:58:20.436749+00', '2026-03-17 04:58:20.436749+00');


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."likes" ("id", "user_id", "tweet_id", "created_at") VALUES
	(3, '00000000-0000-0000-0000-000000000001', 1, '2026-03-13 05:17:13.128951+00'),
	(4, '00000000-0000-0000-0000-000000000001', 3, '2026-03-13 05:17:15.757997+00'),
	(5, '00000000-0000-0000-0000-000000000001', 2, '2026-03-13 05:17:17.906027+00'),
	(12, '00000000-0000-0000-0000-000000000001', 66, '2026-03-13 05:53:57.092913+00'),
	(19, '00000000-0000-0000-0000-000000000001', 4, '2026-03-17 06:42:14.514666+00'),
	(20, '00000000-0000-0000-0000-000000000001', 5, '2026-03-17 06:42:15.17355+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2026-03-13 00:09:21.446597+00', '2026-03-13 00:09:21.446597+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('5579e435-ac29-4abf-a916-d5ae59efa2af', 'avatars', '00000000-0000-0000-0000-000000000002/avatar.png', NULL, '2026-03-13 00:10:16.970991+00', '2026-03-13 00:10:16.970991+00', '2026-03-13 00:10:16.970991+00', '{"eTag": "\"f85b11ce7139795965e7b0c0cc54631a\"", "size": 1695548, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:10:16.950Z", "contentLength": 1695548, "httpStatusCode": 200}', '776b4ad1-f132-4d40-8359-a67b9f36c65c', NULL, '{}'),
	('9c344cea-2146-475e-a28d-95035b96cef5', 'avatars', '00000000-0000-0000-0000-000000000003/avatar.png', NULL, '2026-03-13 00:10:17.064811+00', '2026-03-13 00:10:17.064811+00', '2026-03-13 00:10:17.064811+00', '{"eTag": "\"775b5b05e1ff9d3e76865c6789ed2366\"", "size": 869790, "mimetype": "image/png", "cacheControl": "no-cache", "lastModified": "2026-03-13T00:10:17.050Z", "contentLength": 869790, "httpStatusCode": 200}', 'f240b823-aeef-49d1-b19c-7640402fa6f8', NULL, '{}'),
	('8667c9f2-2893-44b5-a407-8f2c65519cc2', 'avatars', '46f56cd3-6721-4dbf-b832-d7b34ea7ac94/avatar.png', '46f56cd3-6721-4dbf-b832-d7b34ea7ac94', '2026-03-17 04:58:36.494282+00', '2026-03-17 04:58:36.494282+00', '2026-03-17 04:58:36.494282+00', '{"eTag": "\"a326dec9dd937472c613becb958c2a23\"", "size": 871691, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-17T04:58:36.476Z", "contentLength": 871691, "httpStatusCode": 200}', '92205f50-253e-4783-8b62-5edac8655592', '46f56cd3-6721-4dbf-b832-d7b34ea7ac94', '{}'),
	('331dc184-bb9c-4972-9ca7-9f27a8d08c34', 'avatars', '00000000-0000-0000-0000-000000000001/avatar.png', '00000000-0000-0000-0000-000000000001', '2026-03-13 00:10:16.812258+00', '2026-03-16 06:37:14.595778+00', '2026-03-13 00:10:16.812258+00', '{"eTag": "\"209f1b5d4ab22113f6cabbc354969b7f\"", "size": 1554726, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-16T06:37:14.508Z", "contentLength": 1554726, "httpStatusCode": 200}', 'e4e41e55-239f-4e6f-9099-b4f95b84c205', '00000000-0000-0000-0000-000000000001', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 43, true);


--
-- Name: follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."follows_id_seq"', 7, true);


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."likes_id_seq"', 21, true);


--
-- Name: tweets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tweets_id_seq"', 103, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict yHVhtJezsc2iTlKhKRR10gbRF8lghMCUK89q3Ua5Za1ug9Cg4bskPySgDW3RRZY

RESET ALL;
SET session_replication_role = 'origin';
