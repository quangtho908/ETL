CREATE TABLE "staging_transform" (
  "id" SERIAL PRIMARY KEY,
  "cpu_id" INT,
  "gpu_id" INT,
  "brand_id" INT,
  "tempered_glass_id" INT,
  "battery_id" INT,
  "storage_id" INT,
  "bluetooth_id" INT,
  "port_charge_id" INT,
  "headset_type_id" INT,
  "back_cam_movie_id" INT,
  "design_id" INT,
  "material_id" INT,
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