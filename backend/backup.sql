--
-- PostgreSQL database dump
--

\restrict a1S17MfsilPwFjsOshZHkgYwV7Hg3WKTpOH5kek0vqK1R5HO7SqLcpeOoEo3c7d

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Schedule" (
    schedule_id integer NOT NULL,
    course_code text NOT NULL,
    section text NOT NULL,
    room_id text NOT NULL,
    day text NOT NULL,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Schedule_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Schedule_schedule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Schedule_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Schedule_schedule_id_seq" OWNED BY public."Schedule".schedule_id;


--
-- Name: course_offerings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_offerings (
    offering_id integer NOT NULL,
    course_code character varying(50) NOT NULL,
    section character varying(50) NOT NULL,
    units integer NOT NULL,
    section_capacity integer NOT NULL,
    semester character varying(20) DEFAULT '2024-2025-1'::character varying NOT NULL
);


--
-- Name: course_offerings_offering_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_offerings_offering_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_offerings_offering_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_offerings_offering_id_seq OWNED BY public.course_offerings.offering_id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    course_code character varying(50),
    section character varying(50),
    student_count integer
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    room_id character varying(50) NOT NULL,
    capacity integer NOT NULL,
    type character varying(50) NOT NULL
);


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    schedule_id integer NOT NULL,
    course_code character varying(50),
    section character varying(50),
    room_id character varying(50),
    day character varying(20),
    start_time time without time zone,
    end_time time without time zone,
    capacity integer,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedules_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedules_schedule_id_seq OWNED BY public.schedules.schedule_id;


--
-- Name: Schedule schedule_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Schedule" ALTER COLUMN schedule_id SET DEFAULT nextval('public."Schedule_schedule_id_seq"'::regclass);


--
-- Name: course_offerings offering_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_offerings ALTER COLUMN offering_id SET DEFAULT nextval('public.course_offerings_offering_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: schedules schedule_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedules_schedule_id_seq'::regclass);


--
-- Data for Name: Schedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Schedule" (schedule_id, course_code, section, room_id, day, start_time, end_time, created_at) FROM stdin;
\.


--
-- Data for Name: course_offerings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_offerings (offering_id, course_code, section, units, section_capacity, semester) FROM stdin;
1	ITMC313	ZT31	3	35	2024-2025-1
2	CSDC102	ZT12	3	25	2024-2025-1
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, course_code, section, student_count) FROM stdin;
1	ITMC313	ZT31	35
2	ITMC314	ZT32	30
3	ITMC315	ZT33	25
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (room_id, capacity, type) FROM stdin;
LAB-1	30	Laboratory
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedules (schedule_id, course_code, section, room_id, day, start_time, end_time, capacity, status, created_at) FROM stdin;
\.


--
-- Name: Schedule_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Schedule_schedule_id_seq"', 1, false);


--
-- Name: course_offerings_offering_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_offerings_offering_id_seq', 2, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_id_seq', 3, true);


--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schedules_schedule_id_seq', 1, false);


--
-- Name: Schedule Schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Schedule"
    ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY (schedule_id);


--
-- Name: course_offerings course_offerings_course_code_section_semester_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_course_code_section_semester_key UNIQUE (course_code, section, semester);


--
-- Name: course_offerings course_offerings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_pkey PRIMARY KEY (offering_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (schedule_id);


--
-- Name: idx_schedules_room_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedules_room_day ON public.schedules USING btree (room_id, day);


--
-- Name: idx_schedules_section_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedules_section_day ON public.schedules USING btree (section, day);


--
-- PostgreSQL database dump complete
--

\unrestrict a1S17MfsilPwFjsOshZHkgYwV7Hg3WKTpOH5kek0vqK1R5HO7SqLcpeOoEo3c7d

