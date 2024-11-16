DROP FUNCTION insert_into_transform;
CREATE OR REPLACE FUNCTION insert_into_transform(
    in_cpu_id INT,
    in_gpu_id INT,
    in_brand_id INT,
    in_tempered_glass_id INT,
    in_battery_id INT,
    in_storage_id INT,
    in_bluetooth_id INT,
    in_port_charge_id INT,
    in_headset_type_id INT,
    in_back_cam_movie_id INT,
    in_design_id INT,
    in_material_id INT,
    in_contacts TEXT,
    in_security TEXT,
    in_special_feature TEXT,
    in_water_resistant TEXT,
    in_record TEXT,
    in_movie TEXT,
    in_music TEXT,
    in_network_mobile TEXT,
    in_sim TEXT,
    in_wifi TEXT,
    in_gps TEXT,
    in_other_connection TEXT,
    in_dimension_weight TEXT,
    in_date_created TEXT,
    in_pricing NUMERIC
)
RETURNS VOID AS $$
DECLARE
    processed_date_created TIMESTAMP WITHOUT TIME ZONE;
BEGIN
    -- Chuyển các giá trị TEXT có giá trị 'NULL' thành NULL
    IF in_contacts = 'NULL' THEN in_contacts := NULL; END IF;
    IF in_security = 'NULL' THEN in_security := NULL; END IF;
    IF in_special_feature = 'NULL' THEN in_special_feature := NULL; END IF;
    IF in_water_resistant = 'NULL' THEN in_water_resistant := NULL; END IF;
    IF in_record = 'NULL' THEN in_record := NULL; END IF;
    IF in_movie = 'NULL' THEN in_movie := NULL; END IF;
    IF in_music = 'NULL' THEN in_music := NULL; END IF;
    IF in_network_mobile = 'NULL' THEN in_network_mobile := NULL; END IF;
    IF in_sim = 'NULL' THEN in_sim := NULL; END IF;
    IF in_wifi = 'NULL' THEN in_wifi := NULL; END IF;
    IF in_gps = 'NULL' THEN in_gps := NULL; END IF;
    IF in_other_connection = 'NULL' THEN in_other_connection := NULL; END IF;
    IF in_dimension_weight = 'NULL' THEN in_dimension_weight := NULL; END IF;

    -- Chuyển giá trị in_date_created từ chuỗi "month/year" thành TIMESTAMP (ngày đầu tháng)
    IF in_date_created = 'NULL' THEN
        processed_date_created := NULL;
    ELSIF in_date_created IS NOT NULL THEN
        -- Chuyển đổi chuỗi "month/year" thành TIMESTAMP (ngày đầu tháng)
        processed_date_created := TO_TIMESTAMP(in_date_created || '-01', 'MM/YYYY-DD')::timestamp;
    END IF;

    -- Thực hiện insert vào bảng warehouse
    INSERT INTO staging_transform(
        cpu_id, gpu_id, brand_id, tempered_glass_id, battery_id,
        storage_id, bluetooth_id, port_charge_id, headset_type_id,
        back_cam_movie_id, design_id, material_id, contacts, security,
        special_feature, water_resistant, record, movie, music,
        network_mobile, sim, wifi, gps, other_connection, dimension_weight,
        date_created, pricing
    )
    VALUES (
        in_cpu_id, in_gpu_id, in_brand_id, in_tempered_glass_id, in_battery_id,
        in_storage_id, in_bluetooth_id, in_port_charge_id, in_headset_type_id,
        in_back_cam_movie_id, in_design_id, in_material_id, in_contacts, in_security,
        in_special_feature, in_water_resistant, in_record, in_movie, in_music,
        in_network_mobile, in_sim, in_wifi, in_gps, in_other_connection, in_dimension_weight,
        processed_date_created, in_pricing
    );
END;
$$ LANGUAGE plpgsql;