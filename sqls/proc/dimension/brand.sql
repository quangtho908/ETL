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