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
