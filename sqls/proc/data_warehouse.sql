CREATE OR REPLACE FUNCTION upsert_phone_table(
    p_contacts VARCHAR,
    p_security VARCHAR,
    p_special_feature VARCHAR,
    p_water_resistant VARCHAR,
    p_record VARCHAR,
    p_movie VARCHAR,
    p_music VARCHAR,
    p_network_mobile VARCHAR,
    p_sim VARCHAR,
    p_wifi VARCHAR,
    p_gps VARCHAR,
    p_other_connection VARCHAR,
    p_dimension_weight VARCHAR,
    p_date_created VARCHAR,
    p_pricing NUMERIC,
    p_brand_id INT,
    p_storage_id INT,
    p_tempered_glass_id INT,
    p_battery_id INT,
    p_bluetooth_id INT,
    p_port_charge_id INT,
    p_headset_type_id INT,
    p_back_cam_movie_id INT,
    p_design_id INT,
    p_material_id INT,
    p_cpu_id INT,
    p_gpu_id INT
) RETURNS INT AS $$
DECLARE
    v_id INT;
    up_date_created TIMESTAMP WITHOUT TIME ZONE;
BEGIN
    -- Check if a record with the same brand_id and storage_id exists
    SELECT id INTO v_id
    FROM phone_table
    WHERE brand_id = p_brand_id AND storage_id = p_storage_id
    LIMIT 1;

    IF p_contacts = 'NULL' THEN p_contacts := NULL; END IF;
    IF p_security = 'NULL' THEN p_security := NULL; END IF;
    IF p_special_feature = 'NULL' THEN p_special_feature := NULL; END IF;
    IF p_water_resistant = 'NULL' THEN p_water_resistant := NULL; END IF;
    IF p_record = 'NULL' THEN p_record := NULL; END IF;
    IF p_movie = 'NULL' THEN p_movie := NULL; END IF;
    IF p_music = 'NULL' THEN p_music := NULL; END IF;
    IF p_network_mobile = 'NULL' THEN p_network_mobile := NULL; END IF;
    IF p_sim = 'NULL' THEN p_sim := NULL; END IF;
    IF p_wifi = 'NULL' THEN p_wifi := NULL; END IF;
    IF p_gps = 'NULL' THEN p_gps := NULL; END IF;
    IF p_other_connection = 'NULL' THEN p_other_connection := NULL; END IF;
    IF p_dimension_weight = 'NULL' THEN p_dimension_weight := NULL; END IF;

    IF p_date_created = 'NULL' THEN
        up_date_created := NULL;
    ELSIF p_date_created IS NOT NULL THEN
        up_date_created := TO_TIMESTAMP(
            substring(p_date_created FROM '^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2}'),
            'Dy Mon DD YYYY HH24:MI:SS'
        )::timestamp;
    END IF;

    IF FOUND THEN
        -- If record exists, perform update
        UPDATE phone_table
        SET
            contacts = p_contacts,
            security = p_security,
            special_feature = p_special_feature,
            water_resistant = p_water_resistant,
            record = p_record,
            movie = p_movie,
            music = p_music,
            network_mobile = p_network_mobile,
            sim = p_sim,
            wifi = p_wifi,
            gps = p_gps,
            other_connection = p_other_connection,
            dimension_weight = p_dimension_weight,
            date_created = up_date_created,
            pricing = p_pricing,
            tempered_glass_id = p_tempered_glass_id,
            battery_id = p_battery_id,
            bluetooth_id = p_bluetooth_id,
            port_charge_id = p_port_charge_id,
            headset_type_id = p_headset_type_id,
            back_cam_movie_id = p_back_cam_movie_id,
            design_id = p_design_id,
            material_id = p_material_id,
            updated_at = CURRENT_TIMESTAMP,
            cpu_id = p_cpu_id,
            gpu_id = p_gpu_id
        WHERE id = v_id;

        -- Return the id of the updated record
        RETURN v_id;

    ELSE
        -- If record does not exist, insert new record
        INSERT INTO phone_table (
            contacts, security, special_feature, water_resistant, record, movie, music, network_mobile, sim, wifi, gps, other_connection,
            dimension_weight, date_created, pricing, brand_id, storage_id, tempered_glass_id, battery_id, bluetooth_id,
            port_charge_id, headset_type_id, back_cam_movie_id, design_id, material_id, cpu_id, gpu_id
        )
        VALUES (
            p_contacts, p_security, p_special_feature, p_water_resistant, p_record, p_movie, p_music, p_network_mobile, p_sim, p_wifi,
            p_gps, p_other_connection, p_dimension_weight, up_date_created, p_pricing, p_brand_id, p_storage_id, p_tempered_glass_id,
            p_battery_id, p_bluetooth_id, p_port_charge_id, p_headset_type_id, p_back_cam_movie_id, p_design_id, p_material_id, p_cpu_id, p_gpu_id
        )
        RETURNING id INTO v_id;

        -- Return the id of the newly inserted record
        RETURN v_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
