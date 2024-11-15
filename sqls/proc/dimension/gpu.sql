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
