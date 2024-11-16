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