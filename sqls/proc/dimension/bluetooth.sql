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