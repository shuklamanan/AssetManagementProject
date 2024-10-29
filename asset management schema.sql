CREATE TYPE role AS ENUM ('admin','employee');
CREATE TYPE asset_type AS ENUM ('hardware','software');

CREATE TABLE "user" (
  "id" bigint PRIMARY KEY,
  "username" varchar UNIQUE NOT NULL,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "role" role,
  "email" varchar UNIQUE NOT NULL,
  "password" varchar NOT NULL,
  "phone_number" integer UNIQUE NOT NULL,
  "department" varchar,
  "date_of_birth" timestamp,
  "created_at" timestamp,
  "archived_at" timestamp
);

CREATE TABLE "assets" (
  "id" bigint PRIMARY KEY,
  "name" varchar NOT NULL,
  "asset_type" asset_type,
  "config" json,
  "user_id" bigint,
  "archived_at" timestamp
);

CREATE TABLE "asset_history" (
  "id" bigint PRIMARY KEY,
  "asset_id" bigint,
  "user_id" bigint,
  "assigned_by" bigint,
  "assigned_at" timestamp,
  "unassigned_at" timestamp
);

ALTER TABLE "assets" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "asset_history" ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id");

ALTER TABLE "asset_history" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "asset_history" ADD FOREIGN KEY ("assigned_by") REFERENCES "user" ("id");
