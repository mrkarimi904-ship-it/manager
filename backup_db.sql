--
-- PostgreSQL database dump
--

\restrict wPSFvv33NksL9QG3jLB72200zMeSjWMZt3Bb5Aymxp8kjOmNetVW8bHnPfeyGxa

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-02-16 13:46:36

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
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 274 (class 1259 OID 3134046)
-- Name: _TileviewUser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_TileviewUser" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_TileviewUser" OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 3134053)
-- Name: _TileviewUserGroup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_TileviewUserGroup" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_TileviewUserGroup" OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 2692283)
-- Name: _cameraTocamera_bookmark; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTocamera_bookmark" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTocamera_bookmark" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 1026842)
-- Name: _cameraTocamera_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTocamera_groups" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTocamera_groups" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 1026847)
-- Name: _cameraTocamera_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTocamera_info" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTocamera_info" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 1026852)
-- Name: _cameraTocamera_lpr_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTocamera_lpr_camera" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTocamera_lpr_camera" OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 2692276)
-- Name: _cameraTocamera_recorder_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTocamera_recorder_camera" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTocamera_recorder_camera" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 1026857)
-- Name: _cameraTocamera_service_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTocamera_service_camera" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTocamera_service_camera" OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 2692387)
-- Name: _cameraTolpr_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTolpr_result" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTolpr_result" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 1026867)
-- Name: _cameraTouser_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTouser_accounts" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTouser_accounts" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 1026872)
-- Name: _cameraTouser_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_cameraTouser_groups" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_cameraTouser_groups" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 1026877)
-- Name: _camera_groupsTouser_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_camera_groupsTouser_accounts" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_camera_groupsTouser_accounts" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 1026882)
-- Name: _camera_groupsTouser_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_camera_groupsTouser_groups" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_camera_groupsTouser_groups" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 1026887)
-- Name: _camera_lprTocamera_lpr_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_camera_lprTocamera_lpr_camera" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_camera_lprTocamera_lpr_camera" OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 2692290)
-- Name: _camera_recorderTocamera_recorder_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_camera_recorderTocamera_recorder_camera" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_camera_recorderTocamera_recorder_camera" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 1026892)
-- Name: _camera_serviceTocamera_service_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_camera_serviceTocamera_service_camera" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_camera_serviceTocamera_service_camera" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 1026897)
-- Name: _lpr_listTolpr_list_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_lpr_listTolpr_list_image" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_lpr_listTolpr_list_image" OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 3134039)
-- Name: _lpr_resultTolpr_result_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_lpr_resultTolpr_result_image" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_lpr_resultTolpr_result_image" OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 2364823)
-- Name: _mismatchTomismatch_service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_mismatchTomismatch_service" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_mismatchTomismatch_service" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 1026907)
-- Name: _scheduler_ip_macTouser_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_scheduler_ip_macTouser_accounts" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_scheduler_ip_macTouser_accounts" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 1026912)
-- Name: _scheduler_user_accountTouser_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_scheduler_user_accountTouser_accounts" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_scheduler_user_accountTouser_accounts" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 1026917)
-- Name: _scheduler_user_groupTouser_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_scheduler_user_groupTouser_groups" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_scheduler_user_groupTouser_groups" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 1026922)
-- Name: _user_accountsTouser_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_user_accountsTouser_groups" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_user_accountsTouser_groups" OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 2692472)
-- Name: _user_accountsTouser_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_user_accountsTouser_preference" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_user_accountsTouser_preference" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 1026927)
-- Name: _user_accountsTouser_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_user_accountsTouser_roles" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_user_accountsTouser_roles" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 1026932)
-- Name: _user_accountsTouser_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_user_accountsTouser_tokens" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_user_accountsTouser_tokens" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 1026937)
-- Name: _user_groupsTouser_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_user_groupsTouser_roles" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_user_groupsTouser_roles" OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 1026942)
-- Name: camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera (
    id text NOT NULL,
    url text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ok'::text NOT NULL,
    tcp boolean DEFAULT true NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    "thirdParty" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.camera OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 2692264)
-- Name: camera_bookmark; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_bookmark (
    id text NOT NULL,
    "from" integer NOT NULL,
    "to" integer NOT NULL,
    type text DEFAULT ''::text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    lock boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.camera_bookmark OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 1026952)
-- Name: camera_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_groups (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.camera_groups OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 1026958)
-- Name: camera_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_info (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.camera_info OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 1026963)
-- Name: camera_lpr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_lpr (
    id text NOT NULL,
    url text NOT NULL,
    port text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.camera_lpr OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 1026969)
-- Name: camera_lpr_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_lpr_camera (
    id text NOT NULL,
    title text NOT NULL,
    "processType" double precision NOT NULL,
    country double precision NOT NULL,
    "useROI" boolean NOT NULL,
    "usePlateAlignment" boolean NOT NULL,
    "mustMatchPattern" boolean NOT NULL,
    "useGPU" boolean NOT NULL,
    "maxFPS" double precision NOT NULL,
    "useDetection" boolean NOT NULL,
    "detectionConfidenceTh" double precision NOT NULL,
    "segmentationConfidenceTh" double precision NOT NULL,
    "ocrConfidenceTh" double precision NOT NULL,
    "alprConfidenceTh" double precision NOT NULL,
    "postProcessConfidenceTh" double precision NOT NULL,
    "postProcessSkipLevelTh" double precision NOT NULL,
    "processStopLevelTh" double precision NOT NULL,
    "maxSuccessfulAnalysisCount" double precision NOT NULL,
    "maxAnalysisCount" double precision NOT NULL,
    "minPlateWidth" double precision NOT NULL,
    "min2AnalysisInterval" double precision NOT NULL,
    "useTypeAndModelRecognition" boolean NOT NULL,
    "typeModelRecognitionSkipLevelTh" double precision NOT NULL,
    "typeModelRecognitionStopLevelTh" double precision NOT NULL,
    "useColorRecognition" boolean NOT NULL,
    "colorRecognitionSkipLevelTh" double precision NOT NULL,
    "colorRecognitionStopLevelTh" double precision NOT NULL,
    "trackingDistanceTh" double precision NOT NULL,
    "trackingInactiveTh" double precision NOT NULL,
    "trackingActiveTh" double precision NOT NULL,
    "tickCount" double precision NOT NULL,
    status text DEFAULT 'none'::text NOT NULL,
    session text DEFAULT 'none'::text NOT NULL,
    roi text,
    "roiData" text,
    "isActive" boolean DEFAULT false NOT NULL,
    repeat_detection boolean DEFAULT false NOT NULL,
    repeat_threshold_seconds integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.camera_lpr_camera OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 2692256)
-- Name: camera_playback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_playback (
    id text NOT NULL,
    url text NOT NULL,
    port text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.camera_playback OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 2692239)
-- Name: camera_recorder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_recorder (
    id text NOT NULL,
    url text NOT NULL,
    port text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.camera_recorder OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 2692247)
-- Name: camera_recorder_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_recorder_camera (
    id text NOT NULL,
    title text NOT NULL,
    storage_path text NOT NULL,
    quota integer NOT NULL,
    block_size integer NOT NULL,
    enable_rotation boolean NOT NULL,
    status text DEFAULT 'none'::text NOT NULL,
    session text DEFAULT 'none'::text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.camera_recorder_camera OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 1026977)
-- Name: camera_service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_service (
    id text NOT NULL,
    url text NOT NULL,
    port text NOT NULL,
    port_from text NOT NULL,
    port_to text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.camera_service OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 1026983)
-- Name: camera_service_camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_service_camera (
    id text NOT NULL,
    type text NOT NULL,
    status boolean NOT NULL,
    state text DEFAULT 'none'::text NOT NULL,
    port integer NOT NULL
);


ALTER TABLE public.camera_service_camera OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 1592610)
-- Name: device; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device (
    id text NOT NULL,
    url text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    port_count integer DEFAULT 6 NOT NULL,
    status text DEFAULT 'ok'::text NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    name text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.device OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 1026989)
-- Name: license; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license (
    id text DEFAULT 'main'::text NOT NULL,
    license text DEFAULT ''::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    key text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.license OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 2692366)
-- Name: license_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_keys (
    id text DEFAULT 'main'::text NOT NULL,
    public_key text DEFAULT ''::text NOT NULL,
    private_key text DEFAULT ''::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.license_keys OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 1026998)
-- Name: logger_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logger_logs (
    id text NOT NULL,
    log text NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    by text,
    "user" text,
    user_group text,
    camera text,
    camera_group text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.logger_logs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 1027005)
-- Name: lpr_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lpr_list (
    id text NOT NULL,
    ocr text NOT NULL,
    vehiclebrand text NOT NULL,
    vehiclecolor text NOT NULL,
    vehiclemodel text NOT NULL,
    vehicletype text NOT NULL,
    drivername text NOT NULL,
    driverfamily text NOT NULL,
    driverphone text NOT NULL,
    driverdesc text NOT NULL,
    "isBlackList" boolean NOT NULL,
    "isWhiteList" boolean NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isNotifable" boolean NOT NULL,
    "isPartial" boolean NOT NULL,
    "alarmColor" text NOT NULL,
    "alarmText" text NOT NULL
);


ALTER TABLE public.lpr_list OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 1027011)
-- Name: lpr_list_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lpr_list_image (
    id text NOT NULL,
    image text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lpr_list_image OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 1027017)
-- Name: lpr_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lpr_result (
    id text NOT NULL,
    country text NOT NULL,
    direction text NOT NULL,
    lineid text NOT NULL,
    ocr text NOT NULL,
    platetype text NOT NULL,
    trackid text NOT NULL,
    vehiclebrand text NOT NULL,
    vehiclecolor text NOT NULL,
    vehiclemodel text NOT NULL,
    vehicletype text NOT NULL,
    "time" text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isBlackList" boolean NOT NULL,
    "isWhiteList" boolean NOT NULL,
    "isNotifable" boolean DEFAULT false NOT NULL,
    "camAddress" text DEFAULT ''::text NOT NULL,
    "camMapLat" text DEFAULT ''::text NOT NULL,
    "camMapLng" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.lpr_result OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 2642556)
-- Name: lpr_result_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lpr_result_image (
    id text NOT NULL,
    plateimage text NOT NULL,
    vehicleimage text NOT NULL,
    frame text NOT NULL,
    generatedplateimage text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lpr_result_image OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 2364812)
-- Name: mismatch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mismatch (
    id text NOT NULL,
    title text NOT NULL,
    camera1_id text NOT NULL,
    camera2_id text NOT NULL,
    status text DEFAULT 'STOPPED'::text NOT NULL,
    session text DEFAULT 'none'::text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    delay double precision DEFAULT 60 NOT NULL
);


ALTER TABLE public.mismatch OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 2364804)
-- Name: mismatch_service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mismatch_service (
    id text NOT NULL,
    url text NOT NULL,
    port text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.mismatch_service OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 1592621)
-- Name: operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations (
    id text NOT NULL,
    lpr_list_id text NOT NULL,
    device_id text NOT NULL,
    name text NOT NULL,
    enabled_from text NOT NULL,
    enabled_to text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    status text DEFAULT 'idle'::text NOT NULL,
    port integer NOT NULL,
    step1_action text NOT NULL,
    step1_delay_ms integer NOT NULL,
    step2_action text,
    step2_delay_ms integer,
    cameras jsonb,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.operations OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 1027029)
-- Name: scheduler_ip_mac; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduler_ip_mac (
    id text NOT NULL,
    title text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    typee text NOT NULL
);


ALTER TABLE public.scheduler_ip_mac OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 1027035)
-- Name: scheduler_user_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduler_user_account (
    id text NOT NULL,
    title text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "from" text NOT NULL,
    "to" text NOT NULL
);


ALTER TABLE public.scheduler_user_account OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 1027041)
-- Name: scheduler_user_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduler_user_group (
    id text NOT NULL,
    title text NOT NULL,
    "from" text NOT NULL,
    "to" text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.scheduler_user_group OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 1027047)
-- Name: setting_password_complexity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setting_password_complexity (
    id text DEFAULT 'main'::text NOT NULL,
    "minimumCharactersCount" integer DEFAULT 8 NOT NULL,
    "haveSpecialCharacters" boolean DEFAULT true NOT NULL,
    "haveUppercaseCharacters" boolean DEFAULT true NOT NULL,
    "haveLowercaseCharacters" boolean DEFAULT true NOT NULL,
    "haveDigits" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.setting_password_complexity OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 3136877)
-- Name: tilelayout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tilelayout (
    id text NOT NULL,
    title text NOT NULL,
    schema text NOT NULL,
    private boolean DEFAULT false NOT NULL,
    is_editable boolean DEFAULT true NOT NULL,
    owner_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tilelayout OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 3134030)
-- Name: tileview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tileview (
    id text NOT NULL,
    title text NOT NULL,
    schema text NOT NULL,
    private boolean DEFAULT false NOT NULL,
    owner_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_editable boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tileview OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 1027058)
-- Name: user_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_accounts (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    expired boolean DEFAULT false NOT NULL,
    expire_at timestamp(3) without time zone,
    "expireInterval" integer DEFAULT 30 NOT NULL,
    mustchangepassword boolean DEFAULT false NOT NULL,
    firstname text NOT NULL,
    lastname text NOT NULL,
    description text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isSuperAdmin" boolean DEFAULT false NOT NULL,
    "isHidden" boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    concurrent integer DEFAULT 1 NOT NULL,
    totp_secret text DEFAULT ''::text NOT NULL,
    totp_status boolean DEFAULT false NOT NULL,
    totp_url text DEFAULT ''::text NOT NULL,
    online_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_accounts OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 1027074)
-- Name: user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_groups (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_groups OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 2692464)
-- Name: user_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preference (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_preference OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 1027080)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "default" boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 1027087)
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_tokens (
    id text NOT NULL,
    token text NOT NULL,
    expiration timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    ip text DEFAULT ''::text NOT NULL,
    service text DEFAULT ''::text NOT NULL,
    mac text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.user_tokens OWNER TO postgres;

--
-- TOC entry 5455 (class 0 OID 3134046)
-- Dependencies: 274
-- Data for Name: _TileviewUser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_TileviewUser" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5456 (class 0 OID 3134053)
-- Dependencies: 275
-- Data for Name: _TileviewUserGroup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_TileviewUserGroup" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5447 (class 0 OID 2692283)
-- Dependencies: 266
-- Data for Name: _cameraTocamera_bookmark; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTocamera_bookmark" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5398 (class 0 OID 1026842)
-- Dependencies: 217
-- Data for Name: _cameraTocamera_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTocamera_groups" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5399 (class 0 OID 1026847)
-- Dependencies: 218
-- Data for Name: _cameraTocamera_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTocamera_info" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5400 (class 0 OID 1026852)
-- Dependencies: 219
-- Data for Name: _cameraTocamera_lpr_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTocamera_lpr_camera" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5446 (class 0 OID 2692276)
-- Dependencies: 265
-- Data for Name: _cameraTocamera_recorder_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTocamera_recorder_camera" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5401 (class 0 OID 1026857)
-- Dependencies: 220
-- Data for Name: _cameraTocamera_service_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTocamera_service_camera" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5450 (class 0 OID 2692387)
-- Dependencies: 269
-- Data for Name: _cameraTolpr_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTolpr_result" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5402 (class 0 OID 1026867)
-- Dependencies: 221
-- Data for Name: _cameraTouser_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTouser_accounts" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5403 (class 0 OID 1026872)
-- Dependencies: 222
-- Data for Name: _cameraTouser_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_cameraTouser_groups" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5404 (class 0 OID 1026877)
-- Dependencies: 223
-- Data for Name: _camera_groupsTouser_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_camera_groupsTouser_accounts" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5405 (class 0 OID 1026882)
-- Dependencies: 224
-- Data for Name: _camera_groupsTouser_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_camera_groupsTouser_groups" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5406 (class 0 OID 1026887)
-- Dependencies: 225
-- Data for Name: _camera_lprTocamera_lpr_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_camera_lprTocamera_lpr_camera" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5448 (class 0 OID 2692290)
-- Dependencies: 267
-- Data for Name: _camera_recorderTocamera_recorder_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_camera_recorderTocamera_recorder_camera" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5407 (class 0 OID 1026892)
-- Dependencies: 226
-- Data for Name: _camera_serviceTocamera_service_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_camera_serviceTocamera_service_camera" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5408 (class 0 OID 1026897)
-- Dependencies: 227
-- Data for Name: _lpr_listTolpr_list_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_lpr_listTolpr_list_image" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5454 (class 0 OID 3134039)
-- Dependencies: 273
-- Data for Name: _lpr_resultTolpr_result_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_lpr_resultTolpr_result_image" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5440 (class 0 OID 2364823)
-- Dependencies: 259
-- Data for Name: _mismatchTomismatch_service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_mismatchTomismatch_service" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5409 (class 0 OID 1026907)
-- Dependencies: 228
-- Data for Name: _scheduler_ip_macTouser_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_scheduler_ip_macTouser_accounts" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5410 (class 0 OID 1026912)
-- Dependencies: 229
-- Data for Name: _scheduler_user_accountTouser_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_scheduler_user_accountTouser_accounts" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5411 (class 0 OID 1026917)
-- Dependencies: 230
-- Data for Name: _scheduler_user_groupTouser_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_scheduler_user_groupTouser_groups" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5412 (class 0 OID 1026922)
-- Dependencies: 231
-- Data for Name: _user_accountsTouser_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_user_accountsTouser_groups" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5452 (class 0 OID 2692472)
-- Dependencies: 271
-- Data for Name: _user_accountsTouser_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_user_accountsTouser_preference" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5413 (class 0 OID 1026927)
-- Dependencies: 232
-- Data for Name: _user_accountsTouser_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_user_accountsTouser_roles" ("A", "B") FROM stdin;
83a47630-c1f7-4c25-936e-bfe25171201a	32f70e39-b1c1-431a-a0ef-1c5b452096a6
83a47630-c1f7-4c25-936e-bfe25171201a	45f16606-7276-48ff-9d1e-9753acacc22a
83a47630-c1f7-4c25-936e-bfe25171201a	a491acec-b978-4853-a07d-09eb7261c6a8
83a47630-c1f7-4c25-936e-bfe25171201a	53c9df01-5911-477b-a33d-eb8b97a3025e
83a47630-c1f7-4c25-936e-bfe25171201a	66bece2f-80ed-47de-9782-0a7529d6d971
83a47630-c1f7-4c25-936e-bfe25171201a	cdc49697-d21a-4156-9be9-ce60b306558d
83a47630-c1f7-4c25-936e-bfe25171201a	8bd4331b-a682-491f-94aa-74f5b4e12dff
83a47630-c1f7-4c25-936e-bfe25171201a	a4c3641d-d19c-472a-bc0c-33cb4e33606e
83a47630-c1f7-4c25-936e-bfe25171201a	bd370f0b-7a20-4476-9134-08e6b14704c1
83a47630-c1f7-4c25-936e-bfe25171201a	dd8dbb08-2d67-4c28-8d07-327d58538c70
83a47630-c1f7-4c25-936e-bfe25171201a	2d422f4f-4907-4f43-a6e4-152fd8426a8d
83a47630-c1f7-4c25-936e-bfe25171201a	ab384e6b-231e-4971-844d-bb315b148bf6
83a47630-c1f7-4c25-936e-bfe25171201a	40d2dfed-cf76-4a87-86ed-3de2c4abf872
83a47630-c1f7-4c25-936e-bfe25171201a	47f25f14-4ebd-46b3-8263-2c9b056dc6cd
83a47630-c1f7-4c25-936e-bfe25171201a	9291d52b-9ae4-469e-a353-5ca808b4490c
83a47630-c1f7-4c25-936e-bfe25171201a	b9e3d061-ddc0-4e14-aab0-8e7c2e843dc8
83a47630-c1f7-4c25-936e-bfe25171201a	b707a824-2a3b-4dbd-85f5-5034c3d99f6e
83a47630-c1f7-4c25-936e-bfe25171201a	423b4eb7-42cd-4e08-af58-1733619f5f87
83a47630-c1f7-4c25-936e-bfe25171201a	9d27b7b3-5e1c-47d1-81b2-ab4e70ea944e
83a47630-c1f7-4c25-936e-bfe25171201a	70fd306e-5855-4d24-bab5-96872a8f7ee7
83a47630-c1f7-4c25-936e-bfe25171201a	abbacb8a-65d0-4781-8ec0-72737f42cb70
83a47630-c1f7-4c25-936e-bfe25171201a	2a7dccfa-247a-4d5d-9c82-116b4f2256f6
83a47630-c1f7-4c25-936e-bfe25171201a	1ea91127-7cf3-4257-972d-fc55831419b6
83a47630-c1f7-4c25-936e-bfe25171201a	55b25533-dece-447f-993f-de10aa5220b1
83a47630-c1f7-4c25-936e-bfe25171201a	ffa2e0a3-c15d-42e4-8fd0-b239227047c4
83a47630-c1f7-4c25-936e-bfe25171201a	1a6e9b42-8bdb-44ae-9a29-8a9864bb6fc1
83a47630-c1f7-4c25-936e-bfe25171201a	916dfa23-ba40-42c1-a065-443d787cbbfb
83a47630-c1f7-4c25-936e-bfe25171201a	a1b34714-d183-49dd-b54c-f566a1043d74
83a47630-c1f7-4c25-936e-bfe25171201a	de1d6219-57b8-45a6-a036-2bf5783b7cab
83a47630-c1f7-4c25-936e-bfe25171201a	60641770-d9d6-4c98-861e-5917b16dc653
83a47630-c1f7-4c25-936e-bfe25171201a	c395f2db-7772-41b8-811b-a3d9d8121f33
83a47630-c1f7-4c25-936e-bfe25171201a	7e2b8daa-1e8f-4b78-98b9-725c42254bbe
83a47630-c1f7-4c25-936e-bfe25171201a	65b98110-8e15-42b6-b9ee-08d7e143f718
83a47630-c1f7-4c25-936e-bfe25171201a	ac2ae165-2ed8-4f25-befc-a48acfdcc074
83a47630-c1f7-4c25-936e-bfe25171201a	876c22c2-af58-4a20-ae9a-fdbd53e5e716
83a47630-c1f7-4c25-936e-bfe25171201a	89c67cc2-c348-4027-920c-0adb2e1815ae
83a47630-c1f7-4c25-936e-bfe25171201a	f9a2f8fd-f577-44be-b7af-82fa0e9822e9
83a47630-c1f7-4c25-936e-bfe25171201a	c85d6db0-26d0-4a44-8db6-9c83285d7da7
83a47630-c1f7-4c25-936e-bfe25171201a	e25a719c-65e4-4b56-9813-1423e00fe29a
83a47630-c1f7-4c25-936e-bfe25171201a	f1c603d9-1030-4b67-b41c-6a4cde030bb5
83a47630-c1f7-4c25-936e-bfe25171201a	02e10f22-d8b4-4d58-9d29-e41a16888968
83a47630-c1f7-4c25-936e-bfe25171201a	d2d6a705-ead9-4786-a94c-c00741fd4403
\.


--
-- TOC entry 5414 (class 0 OID 1026932)
-- Dependencies: 233
-- Data for Name: _user_accountsTouser_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_user_accountsTouser_tokens" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5415 (class 0 OID 1026937)
-- Dependencies: 234
-- Data for Name: _user_groupsTouser_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_user_groupsTouser_roles" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5416 (class 0 OID 1026942)
-- Dependencies: 235
-- Data for Name: camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera (id, url, username, password, created_at, updated_at, status, tcp, deleted, "thirdParty") FROM stdin;
\.


--
-- TOC entry 5445 (class 0 OID 2692264)
-- Dependencies: 264
-- Data for Name: camera_bookmark; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_bookmark (id, "from", "to", type, title, description, lock, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5417 (class 0 OID 1026952)
-- Dependencies: 236
-- Data for Name: camera_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_groups (id, name, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5418 (class 0 OID 1026958)
-- Dependencies: 237
-- Data for Name: camera_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_info (id, key, value) FROM stdin;
\.


--
-- TOC entry 5419 (class 0 OID 1026963)
-- Dependencies: 238
-- Data for Name: camera_lpr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_lpr (id, url, port, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5420 (class 0 OID 1026969)
-- Dependencies: 239
-- Data for Name: camera_lpr_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_lpr_camera (id, title, "processType", country, "useROI", "usePlateAlignment", "mustMatchPattern", "useGPU", "maxFPS", "useDetection", "detectionConfidenceTh", "segmentationConfidenceTh", "ocrConfidenceTh", "alprConfidenceTh", "postProcessConfidenceTh", "postProcessSkipLevelTh", "processStopLevelTh", "maxSuccessfulAnalysisCount", "maxAnalysisCount", "minPlateWidth", "min2AnalysisInterval", "useTypeAndModelRecognition", "typeModelRecognitionSkipLevelTh", "typeModelRecognitionStopLevelTh", "useColorRecognition", "colorRecognitionSkipLevelTh", "colorRecognitionStopLevelTh", "trackingDistanceTh", "trackingInactiveTh", "trackingActiveTh", "tickCount", status, session, roi, "roiData", "isActive", repeat_detection, repeat_threshold_seconds) FROM stdin;
\.


--
-- TOC entry 5444 (class 0 OID 2692256)
-- Dependencies: 263
-- Data for Name: camera_playback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_playback (id, url, port, created_at, updated_at) FROM stdin;
a0172665-091f-4fd4-b638-989b15bb8f83	172.19.19.17	3013	2026-02-16 10:13:31.782	2026-02-16 10:13:31.782
\.


--
-- TOC entry 5442 (class 0 OID 2692239)
-- Dependencies: 261
-- Data for Name: camera_recorder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_recorder (id, url, port, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5443 (class 0 OID 2692247)
-- Dependencies: 262
-- Data for Name: camera_recorder_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_recorder_camera (id, title, storage_path, quota, block_size, enable_rotation, status, session, "isActive") FROM stdin;
\.


--
-- TOC entry 5421 (class 0 OID 1026977)
-- Dependencies: 240
-- Data for Name: camera_service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_service (id, url, port, port_from, port_to, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5422 (class 0 OID 1026983)
-- Dependencies: 241
-- Data for Name: camera_service_camera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_service_camera (id, type, status, state, port) FROM stdin;
\.


--
-- TOC entry 5436 (class 0 OID 1592610)
-- Dependencies: 255
-- Data for Name: device; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device (id, url, username, password, port_count, status, deleted, created_at, updated_at, name) FROM stdin;
\.


--
-- TOC entry 5423 (class 0 OID 1026989)
-- Dependencies: 242
-- Data for Name: license; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license (id, license, created_at, updated_at, key) FROM stdin;
main	{"name":"omid","org":"omid","expire":"2026-11-11T07:26:24.470Z","features":{"camera":100,"recorder":true,"lpr":true,"recorder_count":5,"lpr_count":5},"issued_at":"2026-01-14T12:25:46.749Z","fingerprint":{"hwid":"f2a8e1585b0c31f2e61f3ea7be4721658fc502ced3a1947417efd735f3bc6f8b","strong":{"machine_id":"dcd212fd686741eca0a6ef07c920b582","smbios_uuid":"dd1ad899d2531c76a4b4fc34971289d3","disk_serial":"","tpm_present":false}}}	2025-04-06 10:51:43.605	2026-01-14 12:25:56.749	eyJ2IjoxLCJhbGciOnsic2lnIjoiRWQyNTUxOSIsImVuYyI6IkFFUy0yNTYtR0NNIiwia2RmIjoiSEtERi1TSEEyNTYifSwic2FsdCI6Im9yZHV4a3hZRG9Qc2xQOUJTa0xITEEiLCJub25jZSI6InVxM1I4VkNuaDF5OHhNbmYiLCJjZWtXcmFwIjoiV2NqcVpSOGlqd1pScURXeVRnSFhCbERrQ1NVamswaTF6aXFFQzFQOHZOem5HZDJUNTA4ck1DNzFDVXJKcm51RVFuZ0ZPNXk0dV9RNW9rT3YiLCJjdCI6ImQweGZjNFM0SnZBNVdPRUZNVjdqOXE1UGNGN1JDVFZldVFqWUoyRU5kS2lhV294V1dSTEJzcElzTi1xVGlnMWgzMTA4RGhlWjFMZ2RWWkxrd19Edy10OWhvRmRGVWplS2k1bE1FTTF6a0xZbVgxX1VhazduSEM1QldwLVdwcjZBV1ZqNHhRa0FGMENuWVRZUDRwcVBVUkwyTUV2cmRwYjRQMk8wUWNWNzRZZkZ3cEpNWHJpaEFydkwxZHNLUDA3R0JrXzljRk5nTE01MHFKNE5XR2psaVdDOXJQZXpMNkJITV9NNk40OGlQMjB5TExBQldXQ1RTV3hMaXBLeEtGXzYtdEFfMDNNZklfQVNKeDJ4dnhWUnZPalVsSmYzckthSTBLRFB1VGZnS1NuMnhjVXBrbnUtSmdIXzltODVBUnF3OXFwaGRyTkVOYzQ5U0tXY3ZSV3FPU1pTOXNEdlNxQUVYc0xpb1E5SmNfS3BlZkNMNFRSdC11OE9GbURyNlIyUWJuM2w3RU5oajliRjFuLVZiek5SZnNuV0htLUFDeEVIal8yd0V2SHhTcEpJd1hla1NNODJNNGljN3F4Q3dEbHIyUXJKUFNLcnNYQ3dDdGVqLVZ6TndmZGtQZW13WUtlWTFSWXhvSi16WUZfQUQzZnFDNE5fdU02bFZQUTFtVGc5NVJNTVIwaVBQSVZQTHdHZjhLV3hDTjFDN1JFMkIyTDU3dUFKM0xpWUxFSUxhVm1DOGtfUVJBIiwidGFnIjoiOWhHTlI3ZmtMVnV2dkd2LTgyMXlzZyIsInNpZyI6IlpYN0ljclhaRGxBQmpyYnlFd2Z6R2hwZ2NjbXVBRlVpbi1kYVpQNVFwQ1JLUUE1bGo4Nm5kMDlOVG5xY3ZsZ3NHaUNkcjd5MEdycktqeGRpUldIQUJ3In0
\.


--
-- TOC entry 5449 (class 0 OID 2692366)
-- Dependencies: 268
-- Data for Name: license_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_keys (id, public_key, private_key, created_at, updated_at) FROM stdin;
main	-----BEGIN PUBLIC KEY-----\\nMCowBQYDK2VwAyEAGM/UPzMpiQMei++xgPSheUuEHLAMh+0OvoI2/lvm/74=\\n-----END PUBLIC KEY-----	-----BEGIN PRIVATE KEY-----\\nMC4CAQAwBQYDK2VwBCIEILgSkMD7cGXzdnLcRFSVDblE82Wsiyw987w1M2+OgDEu\\n-----END PRIVATE KEY-----	2025-11-11 06:33:23.051	2025-11-11 07:26:24.47
\.


--
-- TOC entry 5424 (class 0 OID 1026998)
-- Dependencies: 243
-- Data for Name: logger_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logger_logs (id, log, level, by, "user", user_group, camera, camera_group, created_at) FROM stdin;
f006cc47-c741-4aea-8441-85e3876827d3	camera playbak instance registered	0	\N	\N	\N	\N	\N	2026-02-16 10:13:31.783
\.


--
-- TOC entry 5425 (class 0 OID 1027005)
-- Dependencies: 244
-- Data for Name: lpr_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lpr_list (id, ocr, vehiclebrand, vehiclecolor, vehiclemodel, vehicletype, drivername, driverfamily, driverphone, driverdesc, "isBlackList", "isWhiteList", created_at, "isNotifable", "isPartial", "alarmColor", "alarmText") FROM stdin;
\.


--
-- TOC entry 5426 (class 0 OID 1027011)
-- Dependencies: 245
-- Data for Name: lpr_list_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lpr_list_image (id, image, created_at) FROM stdin;
\.


--
-- TOC entry 5427 (class 0 OID 1027017)
-- Dependencies: 246
-- Data for Name: lpr_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lpr_result (id, country, direction, lineid, ocr, platetype, trackid, vehiclebrand, vehiclecolor, vehiclemodel, vehicletype, "time", created_at, "isBlackList", "isWhiteList", "isNotifable", "camAddress", "camMapLat", "camMapLng") FROM stdin;
\.


--
-- TOC entry 5441 (class 0 OID 2642556)
-- Dependencies: 260
-- Data for Name: lpr_result_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lpr_result_image (id, plateimage, vehicleimage, frame, generatedplateimage, created_at) FROM stdin;
\.


--
-- TOC entry 5439 (class 0 OID 2364812)
-- Dependencies: 258
-- Data for Name: mismatch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mismatch (id, title, camera1_id, camera2_id, status, session, "isActive", created_at, updated_at, delay) FROM stdin;
\.


--
-- TOC entry 5438 (class 0 OID 2364804)
-- Dependencies: 257
-- Data for Name: mismatch_service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mismatch_service (id, url, port, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5437 (class 0 OID 1592621)
-- Dependencies: 256
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations (id, lpr_list_id, device_id, name, enabled_from, enabled_to, active, status, port, step1_action, step1_delay_ms, step2_action, step2_delay_ms, cameras, deleted, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5428 (class 0 OID 1027029)
-- Dependencies: 247
-- Data for Name: scheduler_ip_mac; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scheduler_ip_mac (id, title, value, created_at, typee) FROM stdin;
\.


--
-- TOC entry 5429 (class 0 OID 1027035)
-- Dependencies: 248
-- Data for Name: scheduler_user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scheduler_user_account (id, title, created_at, "from", "to") FROM stdin;
\.


--
-- TOC entry 5430 (class 0 OID 1027041)
-- Dependencies: 249
-- Data for Name: scheduler_user_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scheduler_user_group (id, title, "from", "to", created_at) FROM stdin;
\.


--
-- TOC entry 5431 (class 0 OID 1027047)
-- Dependencies: 250
-- Data for Name: setting_password_complexity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setting_password_complexity (id, "minimumCharactersCount", "haveSpecialCharacters", "haveUppercaseCharacters", "haveLowercaseCharacters", "haveDigits") FROM stdin;
main	4	f	f	f	f
\.


--
-- TOC entry 5457 (class 0 OID 3136877)
-- Dependencies: 276
-- Data for Name: tilelayout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tilelayout (id, title, schema, private, is_editable, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5453 (class 0 OID 3134030)
-- Dependencies: 272
-- Data for Name: tileview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tileview (id, title, schema, private, owner_id, created_at, updated_at, is_editable) FROM stdin;
\.


--
-- TOC entry 5432 (class 0 OID 1027058)
-- Dependencies: 251
-- Data for Name: user_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_accounts (id, username, password, expired, expire_at, "expireInterval", mustchangepassword, firstname, lastname, description, "isActive", "isSuperAdmin", "isHidden", created_at, updated_at, concurrent, totp_secret, totp_status, totp_url, online_at) FROM stdin;
6cf8dd12-daca-4c9c-8f11-779b27714041	super@dm!n	$2a$10$tFiD9THMmbnaavuMiJ2jMOJz6vy4A0GWjrCf3MQeYYL0xDdohygIe	f	2035-02-02 11:35:20.658	3650	f	Technical	Support	default account	t	t	t	2024-12-30 13:06:35.849	2025-12-16 11:37:19.859	0		f		2025-12-16 11:37:19.858
83a47630-c1f7-4c25-936e-bfe25171201a	hamid	$2b$10$Uno8L476aDpmqkTXuzwjMuCfXHccLZLA8MAZc3PqOnnZVYxfseKbW	f	\N	0	f	hamid	hamid		t	t	f	2025-12-29 07:12:37.871	2026-02-16 09:10:59.442	0		f		2026-02-16 09:10:59.44
\.


--
-- TOC entry 5433 (class 0 OID 1027074)
-- Dependencies: 252
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_groups (id, name, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5451 (class 0 OID 2692464)
-- Dependencies: 270
-- Data for Name: user_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preference (id, key, value, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5434 (class 0 OID 1027080)
-- Dependencies: 253
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, name, description, "default", created_at, updated_at) FROM stdin;
876c22c2-af58-4a20-ae9a-fdbd53e5e716	camera_add	camera : add	t	2024-12-31 10:57:01.187	2025-02-01 12:24:04.091
f1c603d9-1030-4b67-b41c-6a4cde030bb5	camera_delete	camera : delete	t	2024-12-31 10:57:01.187	2025-02-01 12:24:04.091
45f16606-7276-48ff-9d1e-9753acacc22a	camera_edit	camera : edit	t	2024-12-31 10:57:01.187	2025-02-01 12:24:04.091
e25a719c-65e4-4b56-9813-1423e00fe29a	camera_list	camera : list	t	2024-12-31 10:57:01.187	2025-02-01 12:24:04.091
c85d6db0-26d0-4a44-8db6-9c83285d7da7	logger_list	logs : list	t	2024-12-31 10:57:01.187	2025-02-01 12:24:04.091
7e2b8daa-1e8f-4b78-98b9-725c42254bbe	usergroup_list	user group : list	t	2025-02-01 12:25:44.442	2025-02-01 12:24:33.823
ac2ae165-2ed8-4f25-befc-a48acfdcc074	usergroup_add	user group : add	t	2025-02-01 12:25:44.442	2025-02-01 12:24:34.527
65b98110-8e15-42b6-b9ee-08d7e143f718	usergroup_edit	user group : edit	t	2025-02-01 12:25:44.442	2025-02-01 12:24:34.743
c395f2db-7772-41b8-811b-a3d9d8121f33	usergroup_delete	user group : delete	t	2025-02-01 12:25:44.442	2025-02-01 12:24:34.991
f9a2f8fd-f577-44be-b7af-82fa0e9822e9	account_add	user : add	t	2024-12-31 10:57:01.187	2025-02-01 12:26:00.121
89c67cc2-c348-4027-920c-0adb2e1815ae	account_delete	user : delete	t	2024-12-31 10:57:01.187	2025-02-01 12:26:00.121
02e10f22-d8b4-4d58-9d29-e41a16888968	account_edit	user : edit	t	2024-12-31 10:57:01.187	2025-02-01 12:26:00.121
d2d6a705-ead9-4786-a94c-c00741fd4403	account_list	user : list	f	2024-12-30 13:08:30.06	2025-02-01 12:26:00.121
de1d6219-57b8-45a6-a036-2bf5783b7cab	cameragroup_list	camera group : list	t	2025-02-01 12:27:52.754	2025-02-01 12:27:16.501
b9e3d061-ddc0-4e14-aab0-8e7c2e843dc8	cameragroup_add	camera group : add	t	2025-02-01 12:27:52.754	2025-02-01 12:27:16.74
60641770-d9d6-4c98-861e-5917b16dc653	cameragroup_edit	camera group : edit	t	2025-02-01 12:27:52.754	2025-02-01 12:27:17.004
a1b34714-d183-49dd-b54c-f566a1043d74	cameragroup_delete	camera group : delete	t	2025-02-01 12:27:52.754	2025-02-01 12:27:17.212
47f25f14-4ebd-46b3-8263-2c9b056dc6cd	assign_entities	assign : entities	t	2025-02-01 12:29:33.983	2025-02-01 12:28:56.568
9291d52b-9ae4-469e-a353-5ca808b4490c	assign_roles	assign: roles	t	2025-02-01 12:29:33.983	2025-02-01 12:28:56.71
40d2dfed-cf76-4a87-86ed-3de2c4abf872	actions_recorder	actions : recorder	t	2025-02-01 12:33:26.393	2025-02-01 12:31:44.773
2d422f4f-4907-4f43-a6e4-152fd8426a8d	actions_playback	actions: playback	t	2025-02-01 12:33:26.393	2025-02-01 12:31:51.714
ab384e6b-231e-4971-844d-bb315b148bf6	actions_live	actions: live	t	2025-02-01 12:33:26.393	2025-02-01 12:31:51.883
bd370f0b-7a20-4476-9134-08e6b14704c1	scheduler_user_account	scheduler : user	t	2025-02-01 12:35:18.836	2025-02-01 12:34:57.198
dd8dbb08-2d67-4c28-8d07-327d58538c70	scheduler_user_group	scheduler : user group	t	2025-02-01 12:35:18.836	2025-02-01 12:34:57.415
a4c3641d-d19c-472a-bc0c-33cb4e33606e	settings_password	settings : password complexity	t	2025-02-23 10:36:59.856	2025-02-23 10:36:21.609
cdc49697-d21a-4156-9be9-ce60b306558d	bookmark_list	bookmarks: list	t	2025-03-09 08:37:35.068	2025-03-09 08:36:55.817
53c9df01-5911-477b-a33d-eb8b97a3025e	bookmark_add	bookmarks: add	t	2025-03-09 08:38:06.225	2025-03-09 08:37:36.199
66bece2f-80ed-47de-9782-0a7529d6d971	bookmark_delete	bookmarks: delete	t	2025-03-09 08:38:06.225	2025-03-09 08:37:41.658
8bd4331b-a682-491f-94aa-74f5b4e12dff	license	License	t	2025-02-23 10:36:59.856	2025-04-06 10:16:26.128
1a6e9b42-8bdb-44ae-9a29-8a9864bb6fc1	client_blacklist_add	Client : add blacklist	t	2025-08-13 09:29:24.681	2025-08-13 09:26:27.829
ffa2e0a3-c15d-42e4-8fd0-b239227047c4	client_blacklist_delete	Client : delete blacklist	t	2025-08-13 09:29:24.681	2025-08-13 09:26:28.068
916dfa23-ba40-42c1-a065-443d787cbbfb	client_whitelist_add	Client : add whitelist	t	2025-08-13 09:29:24.681	2025-08-13 09:26:28.644
55b25533-dece-447f-993f-de10aa5220b1	client_whitelist_delete	Client : delete whitelist	t	2025-08-13 09:29:24.681	2025-08-13 09:26:29.108
2a7dccfa-247a-4d5d-9c82-116b4f2256f6	client_driver_add	Client : add driver	t	2025-08-13 09:29:24.681	2025-08-13 09:26:29.492
1ea91127-7cf3-4257-972d-fc55831419b6	client_driver_delete	Client : delete driver	t	2025-08-13 09:29:24.681	2025-08-13 09:26:30.212
a491acec-b978-4853-a07d-09eb7261c6a8	client_db_export	Client : export db	t	2025-08-13 09:29:24.681	2025-08-13 09:26:30.42
abbacb8a-65d0-4781-8ec0-72737f42cb70	client_db_import	Client : import db	t	2025-08-13 09:29:24.681	2025-08-13 09:26:30.604
70fd306e-5855-4d24-bab5-96872a8f7ee7	client_operation_add	Client : add operation	t	2025-08-27 08:01:02.457	2025-08-27 08:00:16.988
9d27b7b3-5e1c-47d1-81b2-ab4e70ea944e	client_operation_delete	Client : delete operation	t	2025-08-27 08:01:02.457	2025-08-27 08:00:46.948
423b4eb7-42cd-4e08-af58-1733619f5f87	client_whitelist_show	Client : show whitelist	t	2025-09-08 08:02:51.999	2025-09-08 08:02:23.85
b707a824-2a3b-4dbd-85f5-5034c3d99f6e	client_manage_view	Client : Manage Views	t	2026-02-14 09:07:09.259	2026-02-14 09:06:07.716
32f70e39-b1c1-431a-a0ef-1c5b452096a6	client_manage_layout	Client : Manage Layouts	t	2026-02-14 09:07:09.259	2026-02-14 09:06:33.597
\.


--
-- TOC entry 5435 (class 0 OID 1027087)
-- Dependencies: 254
-- Data for Name: user_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_tokens (id, token, expiration, created_at, updated_at, ip, service, mac) FROM stdin;
\.


--
-- TOC entry 5189 (class 2606 OID 3134059)
-- Name: _TileviewUserGroup _TileviewUserGroup_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TileviewUserGroup"
    ADD CONSTRAINT "_TileviewUserGroup_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5186 (class 2606 OID 3134052)
-- Name: _TileviewUser _TileviewUser_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TileviewUser"
    ADD CONSTRAINT "_TileviewUser_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5165 (class 2606 OID 2692289)
-- Name: _cameraTocamera_bookmark _cameraTocamera_bookmark_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_bookmark"
    ADD CONSTRAINT "_cameraTocamera_bookmark_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5023 (class 2606 OID 1027097)
-- Name: _cameraTocamera_groups _cameraTocamera_groups_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_groups"
    ADD CONSTRAINT "_cameraTocamera_groups_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5026 (class 2606 OID 1027099)
-- Name: _cameraTocamera_info _cameraTocamera_info_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_info"
    ADD CONSTRAINT "_cameraTocamera_info_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5029 (class 2606 OID 1027101)
-- Name: _cameraTocamera_lpr_camera _cameraTocamera_lpr_camera_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_lpr_camera"
    ADD CONSTRAINT "_cameraTocamera_lpr_camera_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5162 (class 2606 OID 2692282)
-- Name: _cameraTocamera_recorder_camera _cameraTocamera_recorder_camera_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_recorder_camera"
    ADD CONSTRAINT "_cameraTocamera_recorder_camera_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5032 (class 2606 OID 1027103)
-- Name: _cameraTocamera_service_camera _cameraTocamera_service_camera_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_service_camera"
    ADD CONSTRAINT "_cameraTocamera_service_camera_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5173 (class 2606 OID 2692393)
-- Name: _cameraTolpr_result _cameraTolpr_result_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTolpr_result"
    ADD CONSTRAINT "_cameraTolpr_result_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5035 (class 2606 OID 1027107)
-- Name: _cameraTouser_accounts _cameraTouser_accounts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTouser_accounts"
    ADD CONSTRAINT "_cameraTouser_accounts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5038 (class 2606 OID 1027109)
-- Name: _cameraTouser_groups _cameraTouser_groups_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTouser_groups"
    ADD CONSTRAINT "_cameraTouser_groups_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5041 (class 2606 OID 1027111)
-- Name: _camera_groupsTouser_accounts _camera_groupsTouser_accounts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_groupsTouser_accounts"
    ADD CONSTRAINT "_camera_groupsTouser_accounts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5044 (class 2606 OID 1027113)
-- Name: _camera_groupsTouser_groups _camera_groupsTouser_groups_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_groupsTouser_groups"
    ADD CONSTRAINT "_camera_groupsTouser_groups_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5047 (class 2606 OID 1027115)
-- Name: _camera_lprTocamera_lpr_camera _camera_lprTocamera_lpr_camera_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_lprTocamera_lpr_camera"
    ADD CONSTRAINT "_camera_lprTocamera_lpr_camera_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5168 (class 2606 OID 2692296)
-- Name: _camera_recorderTocamera_recorder_camera _camera_recorderTocamera_recorder_camera_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_recorderTocamera_recorder_camera"
    ADD CONSTRAINT "_camera_recorderTocamera_recorder_camera_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5050 (class 2606 OID 1027117)
-- Name: _camera_serviceTocamera_service_camera _camera_serviceTocamera_service_camera_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_serviceTocamera_service_camera"
    ADD CONSTRAINT "_camera_serviceTocamera_service_camera_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5053 (class 2606 OID 1027119)
-- Name: _lpr_listTolpr_list_image _lpr_listTolpr_list_image_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_lpr_listTolpr_list_image"
    ADD CONSTRAINT "_lpr_listTolpr_list_image_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5183 (class 2606 OID 3134045)
-- Name: _lpr_resultTolpr_result_image _lpr_resultTolpr_result_image_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_lpr_resultTolpr_result_image"
    ADD CONSTRAINT "_lpr_resultTolpr_result_image_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5146 (class 2606 OID 2364829)
-- Name: _mismatchTomismatch_service _mismatchTomismatch_service_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_mismatchTomismatch_service"
    ADD CONSTRAINT "_mismatchTomismatch_service_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5056 (class 2606 OID 1027123)
-- Name: _scheduler_ip_macTouser_accounts _scheduler_ip_macTouser_accounts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_ip_macTouser_accounts"
    ADD CONSTRAINT "_scheduler_ip_macTouser_accounts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5059 (class 2606 OID 1027125)
-- Name: _scheduler_user_accountTouser_accounts _scheduler_user_accountTouser_accounts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_user_accountTouser_accounts"
    ADD CONSTRAINT "_scheduler_user_accountTouser_accounts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5062 (class 2606 OID 1027127)
-- Name: _scheduler_user_groupTouser_groups _scheduler_user_groupTouser_groups_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_user_groupTouser_groups"
    ADD CONSTRAINT "_scheduler_user_groupTouser_groups_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5065 (class 2606 OID 1027129)
-- Name: _user_accountsTouser_groups _user_accountsTouser_groups_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_groups"
    ADD CONSTRAINT "_user_accountsTouser_groups_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5178 (class 2606 OID 2692478)
-- Name: _user_accountsTouser_preference _user_accountsTouser_preference_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_preference"
    ADD CONSTRAINT "_user_accountsTouser_preference_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5068 (class 2606 OID 1027131)
-- Name: _user_accountsTouser_roles _user_accountsTouser_roles_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_roles"
    ADD CONSTRAINT "_user_accountsTouser_roles_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5071 (class 2606 OID 1027133)
-- Name: _user_accountsTouser_tokens _user_accountsTouser_tokens_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_tokens"
    ADD CONSTRAINT "_user_accountsTouser_tokens_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5074 (class 2606 OID 1027135)
-- Name: _user_groupsTouser_roles _user_groupsTouser_roles_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_groupsTouser_roles"
    ADD CONSTRAINT "_user_groupsTouser_roles_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5160 (class 2606 OID 2692275)
-- Name: camera_bookmark camera_bookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_bookmark
    ADD CONSTRAINT camera_bookmark_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 1027137)
-- Name: camera_groups camera_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_groups
    ADD CONSTRAINT camera_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 1027139)
-- Name: camera_info camera_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_info
    ADD CONSTRAINT camera_info_pkey PRIMARY KEY (id);


--
-- TOC entry 5090 (class 2606 OID 1027141)
-- Name: camera_lpr_camera camera_lpr_camera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_lpr_camera
    ADD CONSTRAINT camera_lpr_camera_pkey PRIMARY KEY (id);


--
-- TOC entry 5086 (class 2606 OID 1027143)
-- Name: camera_lpr camera_lpr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_lpr
    ADD CONSTRAINT camera_lpr_pkey PRIMARY KEY (id);


--
-- TOC entry 5079 (class 2606 OID 1027145)
-- Name: camera camera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera
    ADD CONSTRAINT camera_pkey PRIMARY KEY (id);


--
-- TOC entry 5157 (class 2606 OID 2692263)
-- Name: camera_playback camera_playback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_playback
    ADD CONSTRAINT camera_playback_pkey PRIMARY KEY (id);


--
-- TOC entry 5155 (class 2606 OID 2692255)
-- Name: camera_recorder_camera camera_recorder_camera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_recorder_camera
    ADD CONSTRAINT camera_recorder_camera_pkey PRIMARY KEY (id);


--
-- TOC entry 5151 (class 2606 OID 2692246)
-- Name: camera_recorder camera_recorder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_recorder
    ADD CONSTRAINT camera_recorder_pkey PRIMARY KEY (id);


--
-- TOC entry 5096 (class 2606 OID 1027147)
-- Name: camera_service_camera camera_service_camera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_service_camera
    ADD CONSTRAINT camera_service_camera_pkey PRIMARY KEY (id);


--
-- TOC entry 5093 (class 2606 OID 1027149)
-- Name: camera_service camera_service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_service
    ADD CONSTRAINT camera_service_pkey PRIMARY KEY (id);


--
-- TOC entry 5134 (class 2606 OID 1592620)
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- TOC entry 5171 (class 2606 OID 2692376)
-- Name: license_keys license_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_keys
    ADD CONSTRAINT license_keys_pkey PRIMARY KEY (id);


--
-- TOC entry 5098 (class 2606 OID 1027151)
-- Name: license license_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT license_pkey PRIMARY KEY (id);


--
-- TOC entry 5100 (class 2606 OID 1027153)
-- Name: logger_logs logger_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logger_logs
    ADD CONSTRAINT logger_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5106 (class 2606 OID 1027155)
-- Name: lpr_list_image lpr_list_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lpr_list_image
    ADD CONSTRAINT lpr_list_image_pkey PRIMARY KEY (id);


--
-- TOC entry 5104 (class 2606 OID 1027157)
-- Name: lpr_list lpr_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lpr_list
    ADD CONSTRAINT lpr_list_pkey PRIMARY KEY (id);


--
-- TOC entry 5149 (class 2606 OID 2642563)
-- Name: lpr_result_image lpr_result_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lpr_result_image
    ADD CONSTRAINT lpr_result_image_pkey PRIMARY KEY (id);


--
-- TOC entry 5111 (class 2606 OID 1027161)
-- Name: lpr_result lpr_result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lpr_result
    ADD CONSTRAINT lpr_result_pkey PRIMARY KEY (id);


--
-- TOC entry 5144 (class 2606 OID 2364822)
-- Name: mismatch mismatch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mismatch
    ADD CONSTRAINT mismatch_pkey PRIMARY KEY (id);


--
-- TOC entry 5141 (class 2606 OID 2364811)
-- Name: mismatch_service mismatch_service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mismatch_service
    ADD CONSTRAINT mismatch_service_pkey PRIMARY KEY (id);


--
-- TOC entry 5138 (class 2606 OID 1592631)
-- Name: operations operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_pkey PRIMARY KEY (id);


--
-- TOC entry 5114 (class 2606 OID 1027163)
-- Name: scheduler_ip_mac scheduler_ip_mac_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduler_ip_mac
    ADD CONSTRAINT scheduler_ip_mac_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 1027165)
-- Name: scheduler_user_account scheduler_user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduler_user_account
    ADD CONSTRAINT scheduler_user_account_pkey PRIMARY KEY (id);


--
-- TOC entry 5118 (class 2606 OID 1027167)
-- Name: scheduler_user_group scheduler_user_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduler_user_group
    ADD CONSTRAINT scheduler_user_group_pkey PRIMARY KEY (id);


--
-- TOC entry 5120 (class 2606 OID 1027169)
-- Name: setting_password_complexity setting_password_complexity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setting_password_complexity
    ADD CONSTRAINT setting_password_complexity_pkey PRIMARY KEY (id);


--
-- TOC entry 5192 (class 2606 OID 3136886)
-- Name: tilelayout tilelayout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tilelayout
    ADD CONSTRAINT tilelayout_pkey PRIMARY KEY (id);


--
-- TOC entry 5181 (class 2606 OID 3134038)
-- Name: tileview tileview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tileview
    ADD CONSTRAINT tileview_pkey PRIMARY KEY (id);


--
-- TOC entry 5122 (class 2606 OID 1027171)
-- Name: user_accounts user_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_accounts
    ADD CONSTRAINT user_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5125 (class 2606 OID 1027173)
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5176 (class 2606 OID 2692471)
-- Name: user_preference user_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference
    ADD CONSTRAINT user_preference_pkey PRIMARY KEY (id);


--
-- TOC entry 5128 (class 2606 OID 1027175)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5131 (class 2606 OID 1027177)
-- Name: user_tokens user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5190 (class 1259 OID 3134062)
-- Name: _TileviewUserGroup_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_TileviewUserGroup_B_index" ON public."_TileviewUserGroup" USING btree ("B");


--
-- TOC entry 5187 (class 1259 OID 3134061)
-- Name: _TileviewUser_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_TileviewUser_B_index" ON public."_TileviewUser" USING btree ("B");


--
-- TOC entry 5166 (class 1259 OID 2692300)
-- Name: _cameraTocamera_bookmark_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTocamera_bookmark_B_index" ON public."_cameraTocamera_bookmark" USING btree ("B");


--
-- TOC entry 5024 (class 1259 OID 1027178)
-- Name: _cameraTocamera_groups_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTocamera_groups_B_index" ON public."_cameraTocamera_groups" USING btree ("B");


--
-- TOC entry 5027 (class 1259 OID 1027179)
-- Name: _cameraTocamera_info_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTocamera_info_B_index" ON public."_cameraTocamera_info" USING btree ("B");


--
-- TOC entry 5030 (class 1259 OID 1027180)
-- Name: _cameraTocamera_lpr_camera_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTocamera_lpr_camera_B_index" ON public."_cameraTocamera_lpr_camera" USING btree ("B");


--
-- TOC entry 5163 (class 1259 OID 2692299)
-- Name: _cameraTocamera_recorder_camera_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTocamera_recorder_camera_B_index" ON public."_cameraTocamera_recorder_camera" USING btree ("B");


--
-- TOC entry 5033 (class 1259 OID 1027181)
-- Name: _cameraTocamera_service_camera_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTocamera_service_camera_B_index" ON public."_cameraTocamera_service_camera" USING btree ("B");


--
-- TOC entry 5174 (class 1259 OID 2692401)
-- Name: _cameraTolpr_result_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTolpr_result_B_index" ON public."_cameraTolpr_result" USING btree ("B");


--
-- TOC entry 5036 (class 1259 OID 1027183)
-- Name: _cameraTouser_accounts_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTouser_accounts_B_index" ON public."_cameraTouser_accounts" USING btree ("B");


--
-- TOC entry 5039 (class 1259 OID 1027184)
-- Name: _cameraTouser_groups_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_cameraTouser_groups_B_index" ON public."_cameraTouser_groups" USING btree ("B");


--
-- TOC entry 5042 (class 1259 OID 1027185)
-- Name: _camera_groupsTouser_accounts_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_camera_groupsTouser_accounts_B_index" ON public."_camera_groupsTouser_accounts" USING btree ("B");


--
-- TOC entry 5045 (class 1259 OID 1027186)
-- Name: _camera_groupsTouser_groups_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_camera_groupsTouser_groups_B_index" ON public."_camera_groupsTouser_groups" USING btree ("B");


--
-- TOC entry 5048 (class 1259 OID 1027187)
-- Name: _camera_lprTocamera_lpr_camera_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_camera_lprTocamera_lpr_camera_B_index" ON public."_camera_lprTocamera_lpr_camera" USING btree ("B");


--
-- TOC entry 5169 (class 1259 OID 2692301)
-- Name: _camera_recorderTocamera_recorder_camera_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_camera_recorderTocamera_recorder_camera_B_index" ON public."_camera_recorderTocamera_recorder_camera" USING btree ("B");


--
-- TOC entry 5051 (class 1259 OID 1027188)
-- Name: _camera_serviceTocamera_service_camera_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_camera_serviceTocamera_service_camera_B_index" ON public."_camera_serviceTocamera_service_camera" USING btree ("B");


--
-- TOC entry 5054 (class 1259 OID 1027189)
-- Name: _lpr_listTolpr_list_image_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_lpr_listTolpr_list_image_B_index" ON public."_lpr_listTolpr_list_image" USING btree ("B");


--
-- TOC entry 5184 (class 1259 OID 3134060)
-- Name: _lpr_resultTolpr_result_image_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_lpr_resultTolpr_result_image_B_index" ON public."_lpr_resultTolpr_result_image" USING btree ("B");


--
-- TOC entry 5147 (class 1259 OID 2364831)
-- Name: _mismatchTomismatch_service_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_mismatchTomismatch_service_B_index" ON public."_mismatchTomismatch_service" USING btree ("B");


--
-- TOC entry 5057 (class 1259 OID 1027191)
-- Name: _scheduler_ip_macTouser_accounts_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_scheduler_ip_macTouser_accounts_B_index" ON public."_scheduler_ip_macTouser_accounts" USING btree ("B");


--
-- TOC entry 5060 (class 1259 OID 1027192)
-- Name: _scheduler_user_accountTouser_accounts_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_scheduler_user_accountTouser_accounts_B_index" ON public."_scheduler_user_accountTouser_accounts" USING btree ("B");


--
-- TOC entry 5063 (class 1259 OID 1027193)
-- Name: _scheduler_user_groupTouser_groups_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_scheduler_user_groupTouser_groups_B_index" ON public."_scheduler_user_groupTouser_groups" USING btree ("B");


--
-- TOC entry 5066 (class 1259 OID 1027194)
-- Name: _user_accountsTouser_groups_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_user_accountsTouser_groups_B_index" ON public."_user_accountsTouser_groups" USING btree ("B");


--
-- TOC entry 5179 (class 1259 OID 2692479)
-- Name: _user_accountsTouser_preference_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_user_accountsTouser_preference_B_index" ON public."_user_accountsTouser_preference" USING btree ("B");


--
-- TOC entry 5069 (class 1259 OID 1027195)
-- Name: _user_accountsTouser_roles_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_user_accountsTouser_roles_B_index" ON public."_user_accountsTouser_roles" USING btree ("B");


--
-- TOC entry 5072 (class 1259 OID 1027196)
-- Name: _user_accountsTouser_tokens_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_user_accountsTouser_tokens_B_index" ON public."_user_accountsTouser_tokens" USING btree ("B");


--
-- TOC entry 5075 (class 1259 OID 1027197)
-- Name: _user_groupsTouser_roles_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_user_groupsTouser_roles_B_index" ON public."_user_groupsTouser_roles" USING btree ("B");


--
-- TOC entry 5076 (class 1259 OID 3134064)
-- Name: camera_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX camera_created_at_idx ON public.camera USING btree (created_at);


--
-- TOC entry 5077 (class 1259 OID 3134063)
-- Name: camera_deleted_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX camera_deleted_status_idx ON public.camera USING btree (deleted, status);


--
-- TOC entry 5088 (class 1259 OID 3134066)
-- Name: camera_lpr_camera_isActive_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "camera_lpr_camera_isActive_status_idx" ON public.camera_lpr_camera USING btree ("isActive", status);


--
-- TOC entry 5091 (class 1259 OID 3134065)
-- Name: camera_lpr_camera_session_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX camera_lpr_camera_session_idx ON public.camera_lpr_camera USING btree (session);


--
-- TOC entry 5087 (class 1259 OID 1027198)
-- Name: camera_lpr_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX camera_lpr_url_key ON public.camera_lpr USING btree (url);


--
-- TOC entry 5158 (class 1259 OID 2692298)
-- Name: camera_playback_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX camera_playback_url_key ON public.camera_playback USING btree (url);


--
-- TOC entry 5153 (class 1259 OID 3136772)
-- Name: camera_recorder_camera_isActive_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "camera_recorder_camera_isActive_status_idx" ON public.camera_recorder_camera USING btree ("isActive", status);


--
-- TOC entry 5152 (class 1259 OID 2692297)
-- Name: camera_recorder_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX camera_recorder_url_key ON public.camera_recorder USING btree (url);


--
-- TOC entry 5094 (class 1259 OID 1027199)
-- Name: camera_service_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX camera_service_url_key ON public.camera_service USING btree (url);


--
-- TOC entry 5080 (class 1259 OID 1027200)
-- Name: camera_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX camera_url_key ON public.camera USING btree (url);


--
-- TOC entry 5135 (class 1259 OID 1592632)
-- Name: device_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX device_url_key ON public.device USING btree (url);


--
-- TOC entry 5101 (class 1259 OID 3134068)
-- Name: lpr_list_isPartial_isBlackList_isWhiteList_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lpr_list_isPartial_isBlackList_isWhiteList_idx" ON public.lpr_list USING btree ("isPartial", "isBlackList", "isWhiteList");


--
-- TOC entry 5102 (class 1259 OID 3134067)
-- Name: lpr_list_ocr_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lpr_list_ocr_idx ON public.lpr_list USING btree (ocr);


--
-- TOC entry 5107 (class 1259 OID 3134069)
-- Name: lpr_result_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lpr_result_created_at_idx ON public.lpr_result USING btree (created_at);


--
-- TOC entry 5108 (class 1259 OID 3134071)
-- Name: lpr_result_isBlackList_isWhiteList_isNotifable_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lpr_result_isBlackList_isWhiteList_isNotifable_idx" ON public.lpr_result USING btree ("isBlackList", "isWhiteList", "isNotifable");


--
-- TOC entry 5109 (class 1259 OID 3134070)
-- Name: lpr_result_ocr_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lpr_result_ocr_idx ON public.lpr_result USING btree (ocr);


--
-- TOC entry 5112 (class 1259 OID 3134072)
-- Name: lpr_result_vehiclebrand_vehiclecolor_vehiclemodel_vehiclety_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lpr_result_vehiclebrand_vehiclecolor_vehiclemodel_vehiclety_idx ON public.lpr_result USING btree (vehiclebrand, vehiclecolor, vehiclemodel, vehicletype);


--
-- TOC entry 5142 (class 1259 OID 2364830)
-- Name: mismatch_service_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mismatch_service_url_key ON public.mismatch_service USING btree (url);


--
-- TOC entry 5136 (class 1259 OID 3134073)
-- Name: operations_lpr_list_id_active_deleted_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_lpr_list_id_active_deleted_idx ON public.operations USING btree (lpr_list_id, active, deleted);


--
-- TOC entry 5139 (class 1259 OID 3134074)
-- Name: operations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX operations_status_idx ON public.operations USING btree (status);


--
-- TOC entry 5123 (class 1259 OID 1027201)
-- Name: user_accounts_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_accounts_username_key ON public.user_accounts USING btree (username);


--
-- TOC entry 5126 (class 1259 OID 1027202)
-- Name: user_roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_roles_name_key ON public.user_roles USING btree (name);


--
-- TOC entry 5129 (class 1259 OID 3134075)
-- Name: user_tokens_expiration_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_tokens_expiration_idx ON public.user_tokens USING btree (expiration);


--
-- TOC entry 5132 (class 1259 OID 3134076)
-- Name: user_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_tokens_token_idx ON public.user_tokens USING btree (token);


--
-- TOC entry 5250 (class 2606 OID 3134102)
-- Name: _TileviewUserGroup _TileviewUserGroup_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TileviewUserGroup"
    ADD CONSTRAINT "_TileviewUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES public.tileview(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5251 (class 2606 OID 3134107)
-- Name: _TileviewUserGroup _TileviewUserGroup_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TileviewUserGroup"
    ADD CONSTRAINT "_TileviewUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5248 (class 2606 OID 3134092)
-- Name: _TileviewUser _TileviewUser_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TileviewUser"
    ADD CONSTRAINT "_TileviewUser_A_fkey" FOREIGN KEY ("A") REFERENCES public.tileview(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5249 (class 2606 OID 3134097)
-- Name: _TileviewUser _TileviewUser_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TileviewUser"
    ADD CONSTRAINT "_TileviewUser_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5237 (class 2606 OID 2692312)
-- Name: _cameraTocamera_bookmark _cameraTocamera_bookmark_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_bookmark"
    ADD CONSTRAINT "_cameraTocamera_bookmark_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5238 (class 2606 OID 2692317)
-- Name: _cameraTocamera_bookmark _cameraTocamera_bookmark_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_bookmark"
    ADD CONSTRAINT "_cameraTocamera_bookmark_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_bookmark(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5193 (class 2606 OID 1027203)
-- Name: _cameraTocamera_groups _cameraTocamera_groups_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_groups"
    ADD CONSTRAINT "_cameraTocamera_groups_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5194 (class 2606 OID 1027208)
-- Name: _cameraTocamera_groups _cameraTocamera_groups_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_groups"
    ADD CONSTRAINT "_cameraTocamera_groups_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5195 (class 2606 OID 1027213)
-- Name: _cameraTocamera_info _cameraTocamera_info_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_info"
    ADD CONSTRAINT "_cameraTocamera_info_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5196 (class 2606 OID 1027218)
-- Name: _cameraTocamera_info _cameraTocamera_info_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_info"
    ADD CONSTRAINT "_cameraTocamera_info_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_info(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5197 (class 2606 OID 1027223)
-- Name: _cameraTocamera_lpr_camera _cameraTocamera_lpr_camera_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_lpr_camera"
    ADD CONSTRAINT "_cameraTocamera_lpr_camera_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5198 (class 2606 OID 1027228)
-- Name: _cameraTocamera_lpr_camera _cameraTocamera_lpr_camera_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_lpr_camera"
    ADD CONSTRAINT "_cameraTocamera_lpr_camera_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_lpr_camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5235 (class 2606 OID 2692302)
-- Name: _cameraTocamera_recorder_camera _cameraTocamera_recorder_camera_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_recorder_camera"
    ADD CONSTRAINT "_cameraTocamera_recorder_camera_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5236 (class 2606 OID 2692307)
-- Name: _cameraTocamera_recorder_camera _cameraTocamera_recorder_camera_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_recorder_camera"
    ADD CONSTRAINT "_cameraTocamera_recorder_camera_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_recorder_camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5199 (class 2606 OID 1027233)
-- Name: _cameraTocamera_service_camera _cameraTocamera_service_camera_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_service_camera"
    ADD CONSTRAINT "_cameraTocamera_service_camera_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5200 (class 2606 OID 1027238)
-- Name: _cameraTocamera_service_camera _cameraTocamera_service_camera_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTocamera_service_camera"
    ADD CONSTRAINT "_cameraTocamera_service_camera_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_service_camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5241 (class 2606 OID 2692403)
-- Name: _cameraTolpr_result _cameraTolpr_result_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTolpr_result"
    ADD CONSTRAINT "_cameraTolpr_result_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5242 (class 2606 OID 2692408)
-- Name: _cameraTolpr_result _cameraTolpr_result_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTolpr_result"
    ADD CONSTRAINT "_cameraTolpr_result_B_fkey" FOREIGN KEY ("B") REFERENCES public.lpr_result(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5201 (class 2606 OID 1027253)
-- Name: _cameraTouser_accounts _cameraTouser_accounts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTouser_accounts"
    ADD CONSTRAINT "_cameraTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5202 (class 2606 OID 1027258)
-- Name: _cameraTouser_accounts _cameraTouser_accounts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTouser_accounts"
    ADD CONSTRAINT "_cameraTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5203 (class 2606 OID 1027263)
-- Name: _cameraTouser_groups _cameraTouser_groups_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTouser_groups"
    ADD CONSTRAINT "_cameraTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5204 (class 2606 OID 1027268)
-- Name: _cameraTouser_groups _cameraTouser_groups_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_cameraTouser_groups"
    ADD CONSTRAINT "_cameraTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5205 (class 2606 OID 1027273)
-- Name: _camera_groupsTouser_accounts _camera_groupsTouser_accounts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_groupsTouser_accounts"
    ADD CONSTRAINT "_camera_groupsTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5206 (class 2606 OID 1027278)
-- Name: _camera_groupsTouser_accounts _camera_groupsTouser_accounts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_groupsTouser_accounts"
    ADD CONSTRAINT "_camera_groupsTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5207 (class 2606 OID 1027283)
-- Name: _camera_groupsTouser_groups _camera_groupsTouser_groups_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_groupsTouser_groups"
    ADD CONSTRAINT "_camera_groupsTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5208 (class 2606 OID 1027288)
-- Name: _camera_groupsTouser_groups _camera_groupsTouser_groups_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_groupsTouser_groups"
    ADD CONSTRAINT "_camera_groupsTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5209 (class 2606 OID 1027293)
-- Name: _camera_lprTocamera_lpr_camera _camera_lprTocamera_lpr_camera_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_lprTocamera_lpr_camera"
    ADD CONSTRAINT "_camera_lprTocamera_lpr_camera_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera_lpr(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5210 (class 2606 OID 1027298)
-- Name: _camera_lprTocamera_lpr_camera _camera_lprTocamera_lpr_camera_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_lprTocamera_lpr_camera"
    ADD CONSTRAINT "_camera_lprTocamera_lpr_camera_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_lpr_camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5239 (class 2606 OID 2692322)
-- Name: _camera_recorderTocamera_recorder_camera _camera_recorderTocamera_recorder_camera_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_recorderTocamera_recorder_camera"
    ADD CONSTRAINT "_camera_recorderTocamera_recorder_camera_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera_recorder(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5240 (class 2606 OID 2692327)
-- Name: _camera_recorderTocamera_recorder_camera _camera_recorderTocamera_recorder_camera_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_recorderTocamera_recorder_camera"
    ADD CONSTRAINT "_camera_recorderTocamera_recorder_camera_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_recorder_camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5211 (class 2606 OID 1027303)
-- Name: _camera_serviceTocamera_service_camera _camera_serviceTocamera_service_camera_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_serviceTocamera_service_camera"
    ADD CONSTRAINT "_camera_serviceTocamera_service_camera_A_fkey" FOREIGN KEY ("A") REFERENCES public.camera_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5212 (class 2606 OID 1027308)
-- Name: _camera_serviceTocamera_service_camera _camera_serviceTocamera_service_camera_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_camera_serviceTocamera_service_camera"
    ADD CONSTRAINT "_camera_serviceTocamera_service_camera_B_fkey" FOREIGN KEY ("B") REFERENCES public.camera_service_camera(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5213 (class 2606 OID 1027313)
-- Name: _lpr_listTolpr_list_image _lpr_listTolpr_list_image_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_lpr_listTolpr_list_image"
    ADD CONSTRAINT "_lpr_listTolpr_list_image_A_fkey" FOREIGN KEY ("A") REFERENCES public.lpr_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5214 (class 2606 OID 1027318)
-- Name: _lpr_listTolpr_list_image _lpr_listTolpr_list_image_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_lpr_listTolpr_list_image"
    ADD CONSTRAINT "_lpr_listTolpr_list_image_B_fkey" FOREIGN KEY ("B") REFERENCES public.lpr_list_image(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5246 (class 2606 OID 3134082)
-- Name: _lpr_resultTolpr_result_image _lpr_resultTolpr_result_image_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_lpr_resultTolpr_result_image"
    ADD CONSTRAINT "_lpr_resultTolpr_result_image_A_fkey" FOREIGN KEY ("A") REFERENCES public.lpr_result(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5247 (class 2606 OID 3134087)
-- Name: _lpr_resultTolpr_result_image _lpr_resultTolpr_result_image_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_lpr_resultTolpr_result_image"
    ADD CONSTRAINT "_lpr_resultTolpr_result_image_B_fkey" FOREIGN KEY ("B") REFERENCES public.lpr_result_image(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5233 (class 2606 OID 2364842)
-- Name: _mismatchTomismatch_service _mismatchTomismatch_service_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_mismatchTomismatch_service"
    ADD CONSTRAINT "_mismatchTomismatch_service_A_fkey" FOREIGN KEY ("A") REFERENCES public.mismatch(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5234 (class 2606 OID 2364847)
-- Name: _mismatchTomismatch_service _mismatchTomismatch_service_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_mismatchTomismatch_service"
    ADD CONSTRAINT "_mismatchTomismatch_service_B_fkey" FOREIGN KEY ("B") REFERENCES public.mismatch_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5215 (class 2606 OID 1027333)
-- Name: _scheduler_ip_macTouser_accounts _scheduler_ip_macTouser_accounts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_ip_macTouser_accounts"
    ADD CONSTRAINT "_scheduler_ip_macTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES public.scheduler_ip_mac(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5216 (class 2606 OID 1027338)
-- Name: _scheduler_ip_macTouser_accounts _scheduler_ip_macTouser_accounts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_ip_macTouser_accounts"
    ADD CONSTRAINT "_scheduler_ip_macTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5217 (class 2606 OID 1027343)
-- Name: _scheduler_user_accountTouser_accounts _scheduler_user_accountTouser_accounts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_user_accountTouser_accounts"
    ADD CONSTRAINT "_scheduler_user_accountTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES public.scheduler_user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5218 (class 2606 OID 1027348)
-- Name: _scheduler_user_accountTouser_accounts _scheduler_user_accountTouser_accounts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_user_accountTouser_accounts"
    ADD CONSTRAINT "_scheduler_user_accountTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5219 (class 2606 OID 1027353)
-- Name: _scheduler_user_groupTouser_groups _scheduler_user_groupTouser_groups_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_user_groupTouser_groups"
    ADD CONSTRAINT "_scheduler_user_groupTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES public.scheduler_user_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5220 (class 2606 OID 1027358)
-- Name: _scheduler_user_groupTouser_groups _scheduler_user_groupTouser_groups_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_scheduler_user_groupTouser_groups"
    ADD CONSTRAINT "_scheduler_user_groupTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5221 (class 2606 OID 1027363)
-- Name: _user_accountsTouser_groups _user_accountsTouser_groups_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_groups"
    ADD CONSTRAINT "_user_accountsTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5222 (class 2606 OID 1027368)
-- Name: _user_accountsTouser_groups _user_accountsTouser_groups_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_groups"
    ADD CONSTRAINT "_user_accountsTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5243 (class 2606 OID 2692480)
-- Name: _user_accountsTouser_preference _user_accountsTouser_preference_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_preference"
    ADD CONSTRAINT "_user_accountsTouser_preference_A_fkey" FOREIGN KEY ("A") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5244 (class 2606 OID 2692485)
-- Name: _user_accountsTouser_preference _user_accountsTouser_preference_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_preference"
    ADD CONSTRAINT "_user_accountsTouser_preference_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_preference(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5223 (class 2606 OID 1027373)
-- Name: _user_accountsTouser_roles _user_accountsTouser_roles_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_roles"
    ADD CONSTRAINT "_user_accountsTouser_roles_A_fkey" FOREIGN KEY ("A") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5224 (class 2606 OID 1027378)
-- Name: _user_accountsTouser_roles _user_accountsTouser_roles_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_roles"
    ADD CONSTRAINT "_user_accountsTouser_roles_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5225 (class 2606 OID 1027383)
-- Name: _user_accountsTouser_tokens _user_accountsTouser_tokens_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_tokens"
    ADD CONSTRAINT "_user_accountsTouser_tokens_A_fkey" FOREIGN KEY ("A") REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5226 (class 2606 OID 1027388)
-- Name: _user_accountsTouser_tokens _user_accountsTouser_tokens_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_accountsTouser_tokens"
    ADD CONSTRAINT "_user_accountsTouser_tokens_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_tokens(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5227 (class 2606 OID 1027393)
-- Name: _user_groupsTouser_roles _user_groupsTouser_roles_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_groupsTouser_roles"
    ADD CONSTRAINT "_user_groupsTouser_roles_A_fkey" FOREIGN KEY ("A") REFERENCES public.user_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5228 (class 2606 OID 1027398)
-- Name: _user_groupsTouser_roles _user_groupsTouser_roles_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_user_groupsTouser_roles"
    ADD CONSTRAINT "_user_groupsTouser_roles_B_fkey" FOREIGN KEY ("B") REFERENCES public.user_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5231 (class 2606 OID 2364832)
-- Name: mismatch mismatch_camera1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mismatch
    ADD CONSTRAINT mismatch_camera1_id_fkey FOREIGN KEY (camera1_id) REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5232 (class 2606 OID 2364837)
-- Name: mismatch mismatch_camera2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mismatch
    ADD CONSTRAINT mismatch_camera2_id_fkey FOREIGN KEY (camera2_id) REFERENCES public.camera(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5229 (class 2606 OID 1592638)
-- Name: operations operations_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5230 (class 2606 OID 1592633)
-- Name: operations operations_lpr_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_lpr_list_id_fkey FOREIGN KEY (lpr_list_id) REFERENCES public.lpr_list(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5252 (class 2606 OID 3136887)
-- Name: tilelayout tilelayout_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tilelayout
    ADD CONSTRAINT tilelayout_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5245 (class 2606 OID 3134077)
-- Name: tileview tileview_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tileview
    ADD CONSTRAINT tileview_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.user_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-02-16 13:46:36

--
-- PostgreSQL database dump complete
--

\unrestrict wPSFvv33NksL9QG3jLB72200zMeSjWMZt3Bb5Aymxp8kjOmNetVW8bHnPfeyGxa

