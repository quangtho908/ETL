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
