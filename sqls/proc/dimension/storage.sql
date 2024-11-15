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