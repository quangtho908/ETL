CREATE TABLE "battery" (
  "id" SERIAL PRIMARY KEY,
  "battery_type" VARCHAR,
  "battery_size" INT,
  "max_charge" NUMERIC,
  "battery_technology" VARCHAR,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE,
  UNIQUE ("battery_type", "battery_size", "max_charge")
);

CREATE TABLE "bluetooth" (
  "id" SERIAL PRIMARY KEY,
  "bluetooth" VARCHAR UNIQUE NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "brand" (
  "id" SERIAL PRIMARY KEY,
  "brand" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "ram" VARCHAR NOT NULL,
  "os" VARCHAR,
  "back_cam_resolution" VARCHAR,
  "back_cam_flash" BOOLEAN NOT NULL DEFAULT true,
  "back_cam_features" VARCHAR,
  "front_cam_resolution" VARCHAR,
  "screen_technology" VARCHAR,
  "screen_resolution" VARCHAR,
  "screen_size" VARCHAR,
  "max_brightness" VARCHAR,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE,
  UNIQUE ("brand", "name", "ram")
);

CREATE TABLE "design" (
    "id" SERIAL PRIMARY KEY,
    "design" VARCHAR UNIQUE NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "material" (
    "id" SERIAL PRIMARY KEY,
    "material" VARCHAR UNIQUE NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "movie" (
    "id" SERIAL PRIMARY KEY,
    "movie" VARCHAR UNIQUE NOT NULL,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "cpu" (
  "id" SERIAL PRIMARY KEY,
  "cpu" VARCHAR UNIQUE NOT NULL,
  "speed_cpu" VARCHAR,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "gpu" (
  "id" SERIAL PRIMARY KEY,
  "gpu" VARCHAR UNIQUE NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "storage" (
  "id" SERIAL PRIMARY KEY,
  "storage" VARCHAR NOT NULL,
  "free_storage" VARCHAR,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE,
  UNIQUE ("storage", "free_storage")
);

CREATE TABLE "tempered_glass" (
  "id" SERIAL PRIMARY KEY,
  "tempered_glass" VARCHAR UNIQUE NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "wire_type" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR UNIQUE NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE "phone_table" (
  "id" SERIAL PRIMARY KEY,
  "contacts" VARCHAR,
  "security" VARCHAR,
  "special_feature" VARCHAR,
  "water_resistant" VARCHAR,
  "record" VARCHAR,
  "movie" VARCHAR,
  "music" VARCHAR,
  "network_mobile" VARCHAR,
  "sim" VARCHAR,
  "wifi" VARCHAR,
  "gps" VARCHAR,
  "other_connection" VARCHAR,
  "dimension_weight" VARCHAR,
  "date_created" TIMESTAMP WITHOUT TIME ZONE,
  "pricing" NUMERIC,
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE
);

-- Foreign Key Relationships (One-to-Many)

-- CPU relationship
ALTER TABLE "phone_table" ADD COLUMN "cpu_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_cpu" FOREIGN KEY ("cpu_id") REFERENCES "cpu" ("id");

-- GPU relationship
ALTER TABLE "phone_table" ADD COLUMN "gpu_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_gpu" FOREIGN KEY ("gpu_id") REFERENCES "gpu" ("id");

-- Brand relationship
ALTER TABLE "phone_table" ADD COLUMN "brand_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_brand" FOREIGN KEY ("brand_id") REFERENCES "brand" ("id");

-- TemperedGlass relationship
ALTER TABLE "phone_table" ADD COLUMN "tempered_glass_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_tempered_glass" FOREIGN KEY ("tempered_glass_id") REFERENCES "tempered_glass" ("id");

-- Battery relationship
ALTER TABLE "phone_table" ADD COLUMN "battery_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_battery" FOREIGN KEY ("battery_id") REFERENCES "battery" ("id");

-- Storage relationship
ALTER TABLE "phone_table" ADD COLUMN "storage_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_storage" FOREIGN KEY ("storage_id") REFERENCES "storage" ("id");

-- Bluetooth relationship
ALTER TABLE "phone_table" ADD COLUMN "bluetooth_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_bluetooth" FOREIGN KEY ("bluetooth_id") REFERENCES "bluetooth" ("id");

-- WireType (port_charge) relationship
ALTER TABLE "phone_table" ADD COLUMN "port_charge_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_port_charge" FOREIGN KEY ("port_charge_id") REFERENCES "wire_type" ("id");

-- WireType (headset_type) relationship
ALTER TABLE "phone_table" ADD COLUMN "headset_type_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_headset_type" FOREIGN KEY ("headset_type_id") REFERENCES "wire_type" ("id");

ALTER TABLE "phone_table" ADD COLUMN "back_cam_movie_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_back_cam_movie" FOREIGN KEY ("back_cam_movie_id") REFERENCES "movie" ("id");

ALTER TABLE "phone_table" ADD COLUMN "design_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_design_id" FOREIGN KEY ("design_id") REFERENCES "design" ("id");

ALTER TABLE "phone_table" ADD COLUMN "material_id" INT;
ALTER TABLE "phone_table" ADD CONSTRAINT "FK_material_id" FOREIGN KEY ("material_id") REFERENCES "material" ("id");
