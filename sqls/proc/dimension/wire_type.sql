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
