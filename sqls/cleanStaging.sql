DO $$
DECLARE
    col_name TEXT;
    query TEXT;
BEGIN
    FOR col_name IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'staging'
          AND data_type IN ('character varying', 'text')
    LOOP

        query := FORMAT('
            UPDATE public.staging
            SET %I = REPLACE(REPLACE(%I, ''undefined'', ''''), ''Hãng không công bố'', '''')
            WHERE %I LIKE ''%%undefined%%'' OR %I LIKE ''%%Hãng không công bố%%'';
        ', col_name, col_name, col_name, col_name);

        -- Thực thi câu lệnh
        EXECUTE query;
    END LOOP;


    -- 2. Loại bỏ các mẫu khớp với regex '\b\d+ nhân\b' trong cột 'cpu'
    UPDATE public.staging
    SET cpu = regexp_replace(cpu, '\s\d+\s*nhân$', '', 'g')
    WHERE cpu ~ '\s\d+\s*nhân$';


    -- 3a. Loại bỏ chuỗi '. Xem thông tin hãng' trong cột 'brand'
    UPDATE public.staging
    SET
        brand = REPLACE(brand, '. Xem thông tin hãng', '')
    WHERE
        brand LIKE '%. Xem thông tin hãng%';

    -- 3b. Đặt 'brand' thành 'Apple' nếu 'name' chứa 'iphone' (không phân biệt chữ hoa chữ thường)
    UPDATE public.staging
    SET
        brand = 'Apple'
    WHERE
        LOWER(name) LIKE '%iphone%';



    --3c. Thay brand từ name
    UPDATE public.staging
    SET brand = split_part(name, ' ', 1);

    -- 4. Loại bỏ dấu chấm và ký hiệu tiền tệ '₫' trong cột 'pricing'
    UPDATE public.staging
    SET
        pricing = regexp_replace(pricing, '[\\.₫]', '', 'g')
    WHERE
        pricing ~ '[\\.₫]';

    -- 5. Loại bỏ các mẫu khớp với regex '\b\d+GB/\d+GB\b' trong cột 'name'
    UPDATE public.staging
    SET name = regexp_replace(name, '\d+GB/\d+GB', '', 'g')
    WHERE name ~ '\d+GB/\d+GB';

    UPDATE public.staging
    SET name = regexp_replace(name, '\d+G$', '', 'g')
    WHERE name ~ '\d+G$';

    -- Chuyển dữ liệu back cam thành các độ phân giải
    UPDATE public.staging
    SET back_cam_movie = CASE
        WHEN back_cam_movie ~* '(8K|4320p)' THEN '8K'
        WHEN back_cam_movie ~* '(4K|2160p)' THEN '4K'
        WHEN back_cam_movie ~* '(FullHD|1080p)' THEN 'FullHD'
        WHEN back_cam_movie ~* '(HD|720p)' THEN 'HD'
        ELSE back_cam_movie
    END
    WHERE back_cam_movie IS NOT NULL;

    -- Replace giờ và mAh
    UPDATE public.staging
    SET battery_size = regexp_replace(battery_size, '\\b\\d+\\s*giờ|mAh', '', 'g')
    WHERE battery_size IS NOT NULL;


    -- Loại bỏ W
    UPDATE public.staging
    SET max_charge = CASE
        WHEN max_charge ILIKE '% W' THEN CAST(regexp_replace(max_charge, ' W', '', 'g') AS NUMERIC)
        ELSE CAST(max_charge AS NUMERIC)
    END
    WHERE max_charge IS NOT NULL AND max_charge ~ '[0-9]+\s*W';

    -- 9. Xoá các hàng dữ liệu trùng lặp dựa trên id
    DELETE FROM public.staging
    WHERE id IN (
        SELECT id
        FROM (
            SELECT id, ROW_NUMBER() OVER(PARTITION BY id ORDER BY id) AS row_num
            FROM public.staging
        ) AS duplicates
        WHERE row_num > 1
    );

    --  10 Cập nhật bảng dữ liệu

    UPDATE public.staging
      SET back_cam_flash = CASE
        WHEN back_cam_flash IS NOT NULL AND back_cam_flash <> '' THEN 'TRUE'
        ELSE 'FALSE'
      END;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END $$;