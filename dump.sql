--
-- PostgreSQL database dump
--

-- Dumped from database version 17.8 (ad62774)
-- Dumped by pg_dump version 17.5

-- Started on 2026-05-11 21:10:35

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
-- TOC entry 3 (class 3079 OID 40960)
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- TOC entry 3491 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- TOC entry 2 (class 3079 OID 16510)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3492 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 911 (class 1247 OID 24577)
-- Name: item_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.item_status AS ENUM (
    'tersedia',
    'tutup',
    'kosong'
);


ALTER TYPE public.item_status OWNER TO neondb_owner;

--
-- TOC entry 893 (class 1247 OID 16522)
-- Name: role_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.role_enum AS ENUM (
    'user',
    'seller'
);


ALTER TYPE public.role_enum OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16559)
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    category_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- TOC entry 222 (class 1259 OID 16567)
-- Name: items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.items (
    item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    stall_id uuid NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price integer NOT NULL,
    rating_avg double precision DEFAULT 0,
    picture_url text,
    created_at timestamp without time zone DEFAULT now(),
    status public.item_status DEFAULT 'tutup'::public.item_status
);


ALTER TABLE public.items OWNER TO neondb_owner;

--
-- TOC entry 223 (class 1259 OID 16587)
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    review_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    stall_id uuid,
    item_id uuid,
    comment text,
    rating integer,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 16541)
-- Name: stalls; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stalls (
    stall_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    owner_id uuid NOT NULL,
    block_id integer NOT NULL,
    name text NOT NULL,
    phone_number text NOT NULL,
    description text,
    picture_url text,
    rating_avg double precision DEFAULT 0,
    is_open boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stalls OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 16527)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public.role_enum DEFAULT 'user'::public.role_enum,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 3321 (class 2606 OID 16566)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3330 (class 2606 OID 16576)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);


--
-- TOC entry 3334 (class 2606 OID 16596)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 3317 (class 2606 OID 16553)
-- Name: stalls stalls_block_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT stalls_block_id_key UNIQUE (block_id);


--
-- TOC entry 3319 (class 2606 OID 16551)
-- Name: stalls stalls_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT stalls_pkey PRIMARY KEY (stall_id);


--
-- TOC entry 3306 (class 2606 OID 16540)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3308 (class 2606 OID 16536)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3310 (class 2606 OID 16538)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3322 (class 1259 OID 41052)
-- Name: idx_categories_name; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_categories_name ON public.categories USING btree (name);


--
-- TOC entry 3323 (class 1259 OID 41050)
-- Name: idx_items_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_items_created ON public.items USING btree (created_at DESC);


--
-- TOC entry 3324 (class 1259 OID 41051)
-- Name: idx_items_name_trgm; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_items_name_trgm ON public.items USING gin (name public.gin_trgm_ops);


--
-- TOC entry 3325 (class 1259 OID 41049)
-- Name: idx_items_price_asc; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_items_price_asc ON public.items USING btree (price);


--
-- TOC entry 3326 (class 1259 OID 41048)
-- Name: idx_items_rating; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_items_rating ON public.items USING btree (rating_avg DESC NULLS LAST);


--
-- TOC entry 3327 (class 1259 OID 41047)
-- Name: idx_items_stall_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_items_stall_category ON public.items USING btree (stall_id, category_id, price);


--
-- TOC entry 3328 (class 1259 OID 41041)
-- Name: idx_items_stall_price; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_items_stall_price ON public.items USING btree (stall_id, price);


--
-- TOC entry 3331 (class 1259 OID 41054)
-- Name: idx_reviews_item_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_reviews_item_id ON public.reviews USING btree (item_id);


--
-- TOC entry 3332 (class 1259 OID 41053)
-- Name: idx_reviews_stall_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_reviews_stall_id ON public.reviews USING btree (stall_id);


--
-- TOC entry 3311 (class 1259 OID 41042)
-- Name: idx_stalls_block_open; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stalls_block_open ON public.stalls USING btree (block_id, is_open);


--
-- TOC entry 3312 (class 1259 OID 41045)
-- Name: idx_stalls_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stalls_created ON public.stalls USING btree (created_at DESC);


--
-- TOC entry 3313 (class 1259 OID 41046)
-- Name: idx_stalls_name_trgm; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stalls_name_trgm ON public.stalls USING gin (name public.gin_trgm_ops);


--
-- TOC entry 3314 (class 1259 OID 41043)
-- Name: idx_stalls_owner; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stalls_owner ON public.stalls USING btree (owner_id);


--
-- TOC entry 3315 (class 1259 OID 41044)
-- Name: idx_stalls_rating; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stalls_rating ON public.stalls USING btree (rating_avg DESC NULLS LAST);


--
-- TOC entry 3336 (class 2606 OID 16582)
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE RESTRICT;


--
-- TOC entry 3337 (class 2606 OID 16577)
-- Name: items items_stall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_stall_id_fkey FOREIGN KEY (stall_id) REFERENCES public.stalls(stall_id) ON DELETE CASCADE;


--
-- TOC entry 3338 (class 2606 OID 16607)
-- Name: reviews reviews_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id) ON DELETE CASCADE;


--
-- TOC entry 3339 (class 2606 OID 16602)
-- Name: reviews reviews_stall_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_stall_id_fkey FOREIGN KEY (stall_id) REFERENCES public.stalls(stall_id) ON DELETE CASCADE;


--
-- TOC entry 3340 (class 2606 OID 16597)
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3335 (class 2606 OID 16554)
-- Name: stalls stalls_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT stalls_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 2125 (class 826 OID 16394)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2124 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-05-11 21:11:05

--
-- PostgreSQL database dump complete
--

