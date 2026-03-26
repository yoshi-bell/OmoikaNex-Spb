--
-- PostgreSQL database dump
--

\restrict KpfiD4gaD2BmYzOPPW2OwUljEs8J3xae5qOXoWzyKNzVAgE6gYrry1MXNMM7hSN

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
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000002	authenticated	authenticated	bob@example.test	$2a$06$MEU4uq4db0A1N.85M/zQ1uDzIS8CpVHPy.H19JllOc/ekHHuPQMOq	2026-03-13 00:09:21.592598+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"name": "Bob"}	\N	2026-03-13 00:09:21.592598+00	2026-03-13 00:09:21.592598+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000003	authenticated	authenticated	charlie@example.test	$2a$06$G1ELJ2n7PXwkuFflyQVqP.FClCIsUiB8Nt8Ro1yB.pVW2EMgSftRK	2026-03-13 00:09:21.592598+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"name": "Charlie"}	\N	2026-03-13 00:09:21.592598+00	2026-03-13 00:09:21.592598+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d80099a0-66e1-453f-ae7a-6f9e3af07750	authenticated	authenticated	newuser@example.test	$2a$10$.OuPqClWvSst0QEWISoh6ejCsfauFpPoQpV3Xjq3q82Mt2aOpnUAa	2026-03-17 00:58:20.296457+00	\N		2026-03-17 00:58:14.591611+00		\N			\N	2026-03-17 00:59:26.44431+00	{"provider": "email", "providers": ["email"]}	{"sub": "d80099a0-66e1-453f-ae7a-6f9e3af07750", "name": "メール認証ユーザー", "email": "newuser@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-16 11:34:47.701502+00	2026-03-17 00:59:26.451581+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bcbb1670-1f55-4321-bbd9-b05dcaa556c9	authenticated	authenticated	newuser03@example.test	$2a$10$PrXH11vZpgiuDu/h9da/FeKG6biwxtnXnjtZgAmunlt5c4bPHLCMq	2026-03-17 00:27:21.076046+00	\N		2026-03-17 00:26:28.498092+00		\N			\N	2026-03-17 00:28:18.998274+00	{"provider": "email", "providers": ["email"]}	{"sub": "bcbb1670-1f55-4321-bbd9-b05dcaa556c9", "name": "認証ユーザー３", "email": "newuser03@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-17 00:26:28.474399+00	2026-03-17 00:28:19.004644+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	68f77a15-4582-46b5-a75e-90e402652888	authenticated	authenticated	newuser02@example.test	$2a$10$D99rqv0f83KqsWNCT1vKgukSUjSRuNKWz51R9zHSd7yvQOOVZzypu	2026-03-17 00:19:57.6804+00	\N		2026-03-17 00:19:48.903544+00		\N			\N	2026-03-17 00:21:17.266833+00	{"provider": "email", "providers": ["email"]}	{"sub": "68f77a15-4582-46b5-a75e-90e402652888", "name": "メール認証完了ユーザー", "email": "newuser02@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-17 00:19:25.051468+00	2026-03-17 00:21:17.273253+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	df812d01-23e7-48e6-a906-4493ba7679ed	authenticated	authenticated	newuser04@example.test	$2a$10$1fgBS5mqsj3UnSdzbd5iq.isnsKNQ28MfE0JoqPF5JueVEmw/tIsq	2026-03-17 00:50:52.561167+00	\N		2026-03-17 00:50:43.770639+00		\N			\N	2026-03-17 00:50:59.105311+00	{"provider": "email", "providers": ["email"]}	{"sub": "df812d01-23e7-48e6-a906-4493ba7679ed", "name": "メール認証ユーザー4", "email": "newuser04@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-17 00:50:43.740288+00	2026-03-17 00:50:59.113596+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a1eb0a6c-44a3-4893-b50d-3861c88856ce	authenticated	authenticated	newuser05@example.test	$2a$10$koAJfcNr3TJI4D7pC7KH4uDgCty9T/P8s8UbwkQpro9g4XO/8sxde	2026-03-17 01:17:19.799103+00	\N		2026-03-17 01:17:06.018405+00		\N			\N	2026-03-17 01:19:27.539523+00	{"provider": "email", "providers": ["email"]}	{"sub": "a1eb0a6c-44a3-4893-b50d-3861c88856ce", "name": "メール認証ユーザー５", "email": "newuser05@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-17 01:16:37.364363+00	2026-03-17 01:19:27.546064+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f7efd216-7fed-4f1a-8f8c-b779bcd75031	authenticated	authenticated	newuser06@example.test	$2a$10$8fyd5/14O1t5lYLC5CAO7ODcqVYES9qqGq0SqFPrj7Dbneso.Bif2	2026-03-17 01:22:39.065334+00	\N		2026-03-17 01:22:31.571938+00		\N			\N	2026-03-17 01:22:39.077473+00	{"provider": "email", "providers": ["email"]}	{"sub": "f7efd216-7fed-4f1a-8f8c-b779bcd75031", "name": "メール認証ユーザー6", "email": "newuser06@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-17 01:21:22.584779+00	2026-03-17 01:22:39.103138+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	23a0c48b-dcd9-4346-a904-5f5781839bb8	authenticated	authenticated	newuser07@example.test	$2a$10$HWJTGjZ6wOS/A1G7TIhAX.Qs60njF7EWZUjzUsMqrGCv82wz4q462	\N	\N	2a00b152dc8f4e314b7f5d7d83d5db3d0947a42e8c9e7cf52176b87e	2026-03-17 01:34:24.136953+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "23a0c48b-dcd9-4346-a904-5f5781839bb8", "name": "メール認証ユーザー7", "email": "newuser07@example.test", "email_verified": false, "phone_verified": false}	\N	2026-03-17 01:30:28.047809+00	2026-03-17 01:34:24.162383+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	46f56cd3-6721-4dbf-b832-d7b34ea7ac94	authenticated	authenticated	newuser-middle@example.test	$2a$10$jcmyKby5z40kITS7xKv14O5CRzJP3BkWqTed80yXC/7MVnAQFd7nm	2026-03-17 04:58:00.426775+00	\N		2026-03-17 04:57:40.687318+00		\N			\N	2026-03-17 04:58:04.574585+00	{"provider": "email", "providers": ["email"]}	{"sub": "46f56cd3-6721-4dbf-b832-d7b34ea7ac94", "name": "ミドル", "email": "newuser-middle@example.test", "email_verified": true, "phone_verified": false}	\N	2026-03-17 04:57:40.621347+00	2026-03-17 04:58:04.596046+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	00000000-0000-0000-0000-000000000001	authenticated	authenticated	alice@example.test	$2a$06$/ll69FcnPD/gWsAb/9cMR.NTxoznGFn1DtM.8L/TGLbQeOe1zumiq	2026-03-13 00:09:21.592598+00	\N		\N		\N			\N	2026-03-24 00:43:52.170488+00	{"provider": "email", "providers": ["email"]}	{"name": "Alice"}	\N	2026-03-13 00:09:21.592598+00	2026-03-24 06:06:13.184336+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- PostgreSQL database dump complete
--

\unrestrict KpfiD4gaD2BmYzOPPW2OwUljEs8J3xae5qOXoWzyKNzVAgE6gYrry1MXNMM7hSN

