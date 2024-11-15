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