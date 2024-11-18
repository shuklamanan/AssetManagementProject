CREATE TYPE role AS ENUM ('Admin','Employee');
CREATE TYPE asset_type AS ENUM ('Hardware','Software');
CREATE TYPE status AS ENUM ('Pending','Approved','Disapproved');

CREATE TABLE "users"
(
    "id"            SERIAL PRIMARY KEY,
    "username"      varchar UNIQUE NOT NULL,
    "first_name"    varchar        NOT NULL,
    "last_name"     varchar        NOT NULL,
    "role"          role[]         ,
    "email"         varchar UNIQUE NOT NULL,
    "password"      varchar        NOT NULL,
    "phone_number"  integer UNIQUE NOT NULL,
    "department"    varchar,
    "date_of_birth" timestamp,
    "created_at"    timestamp default now(),
    "archived_at"   timestamp
);

CREATE TABLE "assets"
(
    "id"          SERIAL PRIMARY KEY,
    "name"        varchar NOT NULL,
    "asset_type"  asset_type,
    "config"      json,
    "user_id"     bigint,
    "created_at"    timestamp default now(),
    "archived_at" timestamp
);

CREATE TABLE "asset_requests"
(
    "id"          SERIAL PRIMARY KEY,
    "asset_id"        bigint not null,
    "user_id"     bigint not null,
    "status"  status not null

);

CREATE TABLE "asset_history"
(
    "id"            SERIAL PRIMARY KEY,
    "asset_id"      bigint,
    "user_id"       bigint,
    "assigned_by"   bigint,
    "assigned_at"   timestamp,
    "unassigned_at" timestamp
);

CREATE TABLE "message"
(
    "id"            SERIAL PRIMARY KEY,
    "message_sender"   bigint,
    "message"       varchar(255),
    "sending_at"   timestamp
);

ALTER TABLE "assets"
    ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "asset_history"
    ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id");

ALTER TABLE "asset_history"
    ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "asset_history"
    ADD FOREIGN KEY ("assigned_by") REFERENCES "users" ("id");

ALTER TABLE "asset_requests"
    ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "asset_requests"
    ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id");

ALTER TABLE "message"
    ADD FOREIGN KEY ("message_sender") REFERENCES "users" ("id");