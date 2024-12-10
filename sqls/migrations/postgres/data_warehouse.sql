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

CREATE OR REPLACE FUNCTION upsert_battery(
    in_battery_size INTEGER,
    in_battery_type TEXT,
    in_max_charge NUMERIC,
    in_battery_technology TEXT
) RETURNS INTEGER AS $$
DECLARE
    found_id INTEGER;
    existing_technology TEXT;
BEGIN
    -- Kiểm tra và thay đổi giá trị 'null' thành NULL cho in_battery_technology và in_battery_type
    IF in_battery_technology = 'NULL' THEN
        in_battery_technology := NULL;
    END IF;

    IF in_battery_type = 'NULL' THEN
        in_battery_type := NULL;
    END IF;

    -- Kiểm tra nếu tất cả giá trị input đều là NULL, không thực hiện insert
    IF in_battery_size IS NULL AND in_battery_type IS NULL AND in_max_charge IS NULL AND in_battery_technology IS NULL THEN
        RETURN NULL;
    END IF;

    -- Tìm kiếm bản ghi có `battery_size`, `battery_type`, và `max_charge` tương ứng
    SELECT id, battery_technology INTO found_id, existing_technology
    FROM battery
    WHERE (in_battery_size IS NULL OR battery_size = in_battery_size)
      AND (in_battery_type IS NULL OR battery_type = in_battery_type)
      AND (in_max_charge IS NULL OR max_charge = in_max_charge)
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, kiểm tra và cộng dồn `battery_technology` nếu có sự thay đổi
    IF found_id IS NOT NULL THEN
        IF in_battery_technology IS NOT NULL AND (existing_technology IS NULL OR in_battery_technology <> existing_technology) THEN
            -- Cộng dồn `battery_technology`
            UPDATE battery
            SET battery_technology =
                    CASE
                        WHEN existing_technology IS NULL THEN in_battery_technology
                        ELSE existing_technology || ', ' || in_battery_technology
                    END,
                updated_at = NOW()
            WHERE id = found_id;
        END IF;
        RETURN found_id;
    END IF;

    -- Nếu không tìm thấy bản ghi, thực hiện insert một bản ghi mới
    INSERT INTO battery(battery_size, battery_type, max_charge, battery_technology)
    VALUES (in_battery_size, in_battery_type, in_max_charge, in_battery_technology)
    ON CONFLICT (battery_size, battery_type, max_charge)
    DO UPDATE SET battery_technology =
        CASE
           WHEN existing_technology IS NULL THEN in_battery_technology
           ELSE existing_technology || ', ' || in_battery_technology
        END,
        updated_at = NOW()
    RETURNING id INTO found_id;

    RETURN found_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_bluetooth(
    in_bluetooth TEXT
) RETURNS INTEGER AS $$
DECLARE
    result_id INTEGER;
BEGIN
    -- Kiểm tra nếu giá trị đầu vào là chuỗi "NULL", bỏ qua
    IF in_bluetooth = 'NULL' THEN
        RETURN NULL;
    END IF;

    -- Tìm kiếm bản ghi đã tồn tại
    SELECT id INTO result_id
    FROM bluetooth
    WHERE bluetooth = in_bluetooth
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, trả về id
    IF result_id IS NOT NULL THEN
        RETURN result_id;
    END IF;

    -- Nếu không tìm thấy, thực hiện insert và trả về id của bản ghi mới
    INSERT INTO bluetooth(bluetooth)
    VALUES (in_bluetooth)
    ON CONFLICT (bluetooth)
    DO NOTHING
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_brand(
    in_brand VARCHAR,
    in_name VARCHAR,
    in_ram VARCHAR,
    in_os VARCHAR,
    in_back_cam_resolution VARCHAR,
    in_back_cam_flash BOOLEAN,
    in_back_cam_features VARCHAR,
    in_front_cam_resolution VARCHAR,
    in_screen_technology VARCHAR,
    in_screen_resolution VARCHAR,
    in_screen_size VARCHAR,
    in_max_brightness VARCHAR
) RETURNS INTEGER AS $$
DECLARE
    result_id INTEGER;
BEGIN
    -- Kiểm tra nếu in_brand, in_name, in_ram là chuỗi "NULL" và chuyển thành NULL
    IF in_brand = 'NULL' THEN in_brand := 'Other'; END IF;
    IF in_name = 'NULL' THEN in_name := in_brand; END IF;
    IF in_ram = 'NULL' THEN in_ram := 'Other'; END IF;

    -- Nếu cả ba giá trị in_brand, in_name, in_ram đều là NULL, trả về NULL
    IF in_brand IS NULL AND in_name IS NULL AND in_ram IS NULL THEN
        RETURN NULL;
    END IF;
    IF in_os = 'NULL' THEN in_os := ''; END IF;
    IF in_back_cam_resolution = 'NULL' THEN in_back_cam_resolution := ''; END IF;
    IF in_back_cam_features = 'NULL' THEN in_back_cam_features := ''; END IF;
    IF in_front_cam_resolution = 'NULL' THEN in_front_cam_resolution := ''; END IF;
    IF in_screen_technology = 'NULL' THEN in_screen_technology := ''; END IF;
    IF in_screen_resolution = 'NULL' THEN in_screen_resolution := ''; END IF;
    IF in_screen_size = 'NULL' THEN in_screen_size := ''; END IF;
    IF in_max_brightness = 'NULL' THEN in_max_brightness := ''; END IF;

    -- Tìm kiếm bản ghi đã tồn tại
    SELECT id INTO result_id
    FROM brand
    WHERE (brand = in_brand OR in_brand IS NULL)
      AND (name = in_name OR in_name IS NULL)
      AND (ram = in_ram OR in_ram IS NULL)
    LIMIT 1;

    -- Nếu bản ghi đã tồn tại, thực hiện cập nhật
    IF result_id IS NOT NULL THEN
        UPDATE brand
        SET os = COALESCE(NULLIF(in_os, ''), os),
            back_cam_resolution = COALESCE(NULLIF(in_back_cam_resolution, ''), back_cam_resolution),
            back_cam_features = COALESCE(NULLIF(in_back_cam_features, ''), back_cam_features),
            front_cam_resolution = COALESCE(NULLIF(in_front_cam_resolution, ''), front_cam_resolution),
            screen_technology = COALESCE(NULLIF(in_screen_technology, ''), screen_technology),
            screen_resolution = COALESCE(NULLIF(in_screen_resolution, ''), screen_resolution),
            screen_size = COALESCE(NULLIF(in_screen_size, ''), screen_size),
            max_brightness = COALESCE(NULLIF(in_max_brightness, ''), max_brightness),
            back_cam_flash = COALESCE(in_back_cam_flash, back_cam_flash),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = result_id;
        -- Trả về id của bản ghi đã cập nhật
        RETURN result_id;
    END IF;

    -- Nếu không tìm thấy bản ghi, thực hiện insert và trả về id mới
    INSERT INTO brand(brand, name, ram, os, back_cam_resolution, back_cam_flash, back_cam_features, front_cam_resolution,
                        screen_technology, screen_resolution, screen_size, max_brightness)
    VALUES (in_brand, in_name, in_ram, in_os, in_back_cam_resolution, in_back_cam_flash, in_back_cam_features,
            in_front_cam_resolution, in_screen_technology, in_screen_resolution, in_screen_size, in_max_brightness)
    ON CONFLICT (brand, name, ram)
    DO UPDATE SET os = COALESCE(NULLIF(in_os, ''), brand.os),
       back_cam_resolution = COALESCE(NULLIF(in_back_cam_resolution, ''), brand.back_cam_resolution),
       back_cam_features = COALESCE(NULLIF(in_back_cam_features, ''), brand.back_cam_features),
       front_cam_resolution = COALESCE(NULLIF(in_front_cam_resolution, ''), brand.front_cam_resolution),
       screen_technology = COALESCE(NULLIF(in_screen_technology, ''), brand.screen_technology),
       screen_resolution = COALESCE(NULLIF(in_screen_resolution, ''), brand.screen_resolution),
       screen_size = COALESCE(NULLIF(in_screen_size, ''), brand.screen_size),
       max_brightness = COALESCE(NULLIF(in_max_brightness, ''), brand.max_brightness),
       back_cam_flash = COALESCE(in_back_cam_flash, brand.back_cam_flash),
       updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO result_id;

    -- Trả về id của bản ghi mới được insert
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_cpu(
    in_cpu VARCHAR,
    in_speed_cpu VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_cpu là chuỗi "NULL", chuyển về NULL
    IF in_cpu = 'NULL' THEN
        in_cpu := NULL;
    END IF;

    -- Nếu in_speed_cpu là chuỗi "NULL", chuyển về NULL
    IF in_speed_cpu = 'NULL' THEN
        in_speed_cpu := NULL;
    END IF;

    -- Nếu in_cpu là NULL, trả về ngay lập tức
    IF in_cpu IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_cpu đã tồn tại chưa
    SELECT id INTO existing_id
    FROM cpu
    WHERE cpu = in_cpu
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, kiểm tra và cập nhật nếu có sự thay đổi
    IF FOUND THEN
        -- Cập nhật speed_cpu nếu có sự thay đổi
        IF in_speed_cpu IS DISTINCT FROM (SELECT speed_cpu FROM cpu WHERE id = existing_id) THEN
            UPDATE cpu
            SET speed_cpu = in_speed_cpu, updated_at = CURRENT_TIMESTAMP
            WHERE id = existing_id;
        END IF;

        -- Trả về id của bản ghi
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO cpu(cpu, speed_cpu)
        VALUES (in_cpu, in_speed_cpu)
        ON CONFLICT (cpu)
        DO UPDATE SET speed_cpu = in_speed_cpu, updated_at = CURRENT_TIMESTAMP
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_design(
    in_design VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_gpu là chuỗi "NULL", chuyển về NULL
    IF in_design = 'NULL' THEN
        in_design := NULL;
    END IF;

    -- Nếu in_gpu là NULL, trả về ngay lập tức
    IF in_design IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_gpu đã tồn tại chưa
    SELECT id INTO existing_id
    FROM design
    WHERE design = in_design
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, chỉ cần trả về id mà không cần cập nhật
    IF FOUND THEN
        -- Trả về id của bản ghi
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO design(design)
        VALUES (in_design)
        ON CONFLICT (design)
        DO NOTHING
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_gpu(
    in_gpu VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_gpu là chuỗi "NULL", chuyển về NULL
    IF in_gpu = 'NULL' THEN
        in_gpu := NULL;
    END IF;

    -- Nếu in_gpu là NULL, trả về ngay lập tức
    IF in_gpu IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_gpu đã tồn tại chưa
    SELECT id INTO existing_id
    FROM gpu
    WHERE gpu = in_gpu
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, chỉ cần trả về id mà không cần cập nhật
    IF FOUND THEN
        -- Trả về id của bản ghi
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO gpu(gpu)
        VALUES (in_gpu)
        ON CONFLICT (gpu)
        DO NOTHING
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_material(
    in_material VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_gpu là chuỗi "NULL", chuyển về NULL
    IF in_material = 'NULL' THEN
        in_material := NULL;
    END IF;

    -- Nếu in_gpu là NULL, trả về ngay lập tức
    IF in_material IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_gpu đã tồn tại chưa
    SELECT id INTO existing_id
    FROM material
    WHERE material = in_material
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, chỉ cần trả về id mà không cần cập nhật
    IF FOUND THEN
        -- Trả về id của bản ghi
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO material(material)
        VALUES (in_material)
        ON CONFLICT (material)
        DO NOTHING
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_movie(
    in_movie VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_gpu là chuỗi "NULL", chuyển về NULL
    IF in_movie = 'NULL' THEN
        in_movie := NULL;
    END IF;

    -- Nếu in_gpu là NULL, trả về ngay lập tức
    IF in_movie IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_gpu đã tồn tại chưa
    SELECT id INTO existing_id
    FROM movie
    WHERE movie = in_movie
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, chỉ cần trả về id mà không cần cập nhật
    IF FOUND THEN
        -- Trả về id của bản ghi
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO movie(movie)
        VALUES (in_movie)
        ON CONFLICT (movie)
        DO NOTHING
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_storage(
    in_storage VARCHAR,
    in_free_storage VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_storage hoặc in_free_storage là chuỗi "NULL", chuyển về NULL
    IF in_storage = 'NULL' THEN
        in_storage := NULL;
    END IF;

    IF in_free_storage = 'NULL' THEN
        in_free_storage := 'OTHER';
    END IF;

    -- Nếu in_storage là NULL, trả về ngay lập tức
    IF in_storage IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_storage đã tồn tại chưa
    SELECT id INTO existing_id
    FROM storage
    WHERE storage = in_storage AND free_storage = in_free_storage
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, chỉ cần cập nhật free_storage và updated_at
    IF FOUND THEN
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO storage(storage, free_storage)
        VALUES (in_storage, in_free_storage)
        ON CONFLICT (storage, free_storage)
        DO NOTHING
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_tempered_glass(
    in_tempered_glass VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    existing_id INTEGER;
BEGIN
    -- Nếu in_tempered_glass là chuỗi "NULL", chuyển về NULL
    IF in_tempered_glass = 'NULL' THEN
        in_tempered_glass := NULL;
    END IF;

    -- Nếu in_tempered_glass là NULL, trả về ngay lập tức
    IF in_tempered_glass IS NULL THEN
        RETURN NULL;
    END IF;

    -- Kiểm tra xem có bản ghi nào với in_tempered_glass đã tồn tại chưa
    SELECT id INTO existing_id
    FROM tempered_glass
    WHERE tempered_glass = in_tempered_glass
    LIMIT 1;

    -- Nếu tìm thấy bản ghi, cập nhật updated_at
    IF FOUND THEN
        RETURN existing_id;
    ELSE
        -- Nếu không tìm thấy bản ghi, thực hiện insert mới
        INSERT INTO tempered_glass(tempered_glass)
        VALUES (in_tempered_glass)
        ON CONFLICT (tempered_glass)
        DO NOTHING
        RETURNING id INTO existing_id;

        -- Trả về id của bản ghi vừa insert
        RETURN existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_or_get_wire_type_ids(
    in_port_charge VARCHAR,
    in_headset_type VARCHAR
)
RETURNS TABLE(port_charge_id INTEGER, headset_type_id INTEGER) AS $$
BEGIN
    -- Xử lý cho port_charge
    IF in_port_charge IS NOT NULL THEN
        -- Tìm kiếm port_charge trong bảng wire_type
        SELECT id INTO port_charge_id
        FROM wire_type
        WHERE name = in_port_charge
        LIMIT 1;

        -- Nếu không tìm thấy, chèn giá trị mới và lấy ID
        IF NOT FOUND THEN
            INSERT INTO wire_type(name, updated_at)
            VALUES (in_port_charge, CURRENT_TIMESTAMP)
            ON CONFLICT
            DO NOTHING
            RETURNING id INTO port_charge_id;
        END IF;
    ELSE
        port_charge_id := NULL;
    END IF;

    -- Xử lý cho headset_type
    IF in_headset_type IS NOT NULL THEN
        -- Tìm kiếm headset_type trong bảng wire_type
        SELECT id INTO headset_type_id
        FROM wire_type
        WHERE name = in_headset_type
        LIMIT 1;

        -- Nếu không tìm thấy, chèn giá trị mới và lấy ID
        IF NOT FOUND THEN
            INSERT INTO wire_type(name, updated_at)
            VALUES (in_headset_type, CURRENT_TIMESTAMP)
            ON CONFLICT
            DO NOTHING
            RETURNING id INTO headset_type_id;
        END IF;
    ELSE
        headset_type_id := NULL;
    END IF;

    -- Trả về cả hai ID
    RETURN QUERY SELECT port_charge_id, headset_type_id;
END;
$$ LANGUAGE plpgsql;


-- phone table
CREATE OR REPLACE FUNCTION upsert_phone_table(
    p_contacts VARCHAR,
    p_security VARCHAR,
    p_special_feature VARCHAR,
    p_water_resistant VARCHAR,
    p_record VARCHAR,
    p_movie VARCHAR,
    p_music VARCHAR,
    p_network_mobile VARCHAR,
    p_sim VARCHAR,
    p_wifi VARCHAR,
    p_gps VARCHAR,
    p_other_connection VARCHAR,
    p_dimension_weight VARCHAR,
    p_date_created VARCHAR,
    p_pricing NUMERIC,
    p_brand_id INT,
    p_storage_id INT,
    p_tempered_glass_id INT,
    p_battery_id INT,
    p_bluetooth_id INT,
    p_port_charge_id INT,
    p_headset_type_id INT,
    p_back_cam_movie_id INT,
    p_design_id INT,
    p_material_id INT,
    p_cpu_id INT,
    p_gpu_id INT
) RETURNS INT AS $$
DECLARE
    v_id INT;
    up_date_created TIMESTAMP WITHOUT TIME ZONE;
BEGIN
    -- Check if a record with the same brand_id and storage_id exists
    SELECT id INTO v_id
    FROM phone_table
    WHERE brand_id = p_brand_id AND storage_id = p_storage_id
    LIMIT 1;

    IF p_contacts = 'NULL' THEN p_contacts := NULL; END IF;
    IF p_security = 'NULL' THEN p_security := NULL; END IF;
    IF p_special_feature = 'NULL' THEN p_special_feature := NULL; END IF;
    IF p_water_resistant = 'NULL' THEN p_water_resistant := NULL; END IF;
    IF p_record = 'NULL' THEN p_record := NULL; END IF;
    IF p_movie = 'NULL' THEN p_movie := NULL; END IF;
    IF p_music = 'NULL' THEN p_music := NULL; END IF;
    IF p_network_mobile = 'NULL' THEN p_network_mobile := NULL; END IF;
    IF p_sim = 'NULL' THEN p_sim := NULL; END IF;
    IF p_wifi = 'NULL' THEN p_wifi := NULL; END IF;
    IF p_gps = 'NULL' THEN p_gps := NULL; END IF;
    IF p_other_connection = 'NULL' THEN p_other_connection := NULL; END IF;
    IF p_dimension_weight = 'NULL' THEN p_dimension_weight := NULL; END IF;

    IF p_date_created = 'NULL' THEN
        up_date_created := NULL;
    ELSIF p_date_created IS NOT NULL THEN
        up_date_created := TO_TIMESTAMP(
            substring(p_date_created FROM '^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2}'),
            'Dy Mon DD YYYY HH24:MI:SS'
        )::timestamp;
    END IF;

    IF FOUND THEN
        -- If record exists, perform update
        UPDATE phone_table
        SET
            contacts = p_contacts,
            security = p_security,
            special_feature = p_special_feature,
            water_resistant = p_water_resistant,
            record = p_record,
            movie = p_movie,
            music = p_music,
            network_mobile = p_network_mobile,
            sim = p_sim,
            wifi = p_wifi,
            gps = p_gps,
            other_connection = p_other_connection,
            dimension_weight = p_dimension_weight,
            date_created = up_date_created,
            pricing = p_pricing,
            tempered_glass_id = p_tempered_glass_id,
            battery_id = p_battery_id,
            bluetooth_id = p_bluetooth_id,
            port_charge_id = p_port_charge_id,
            headset_type_id = p_headset_type_id,
            back_cam_movie_id = p_back_cam_movie_id,
            design_id = p_design_id,
            material_id = p_material_id,
            updated_at = CURRENT_TIMESTAMP,
            cpu_id = p_cpu_id,
            gpu_id = p_gpu_id
        WHERE id = v_id;

        -- Return the id of the updated record
        RETURN v_id;

    ELSE
        -- If record does not exist, insert new record
        INSERT INTO phone_table (
            contacts, security, special_feature, water_resistant, record, movie, music, network_mobile, sim, wifi, gps, other_connection,
            dimension_weight, date_created, pricing, brand_id, storage_id, tempered_glass_id, battery_id, bluetooth_id,
            port_charge_id, headset_type_id, back_cam_movie_id, design_id, material_id, cpu_id, gpu_id
        )
        VALUES (
            p_contacts, p_security, p_special_feature, p_water_resistant, p_record, p_movie, p_music, p_network_mobile, p_sim, p_wifi,
            p_gps, p_other_connection, p_dimension_weight, up_date_created, p_pricing, p_brand_id, p_storage_id, p_tempered_glass_id,
            p_battery_id, p_bluetooth_id, p_port_charge_id, p_headset_type_id, p_back_cam_movie_id, p_design_id, p_material_id, p_cpu_id, p_gpu_id
        )
        RETURNING id INTO v_id;

        -- Return the id of the newly inserted record
        RETURN v_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

