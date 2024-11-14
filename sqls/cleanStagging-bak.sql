-- 1. Thay thế 'undefined' bằng chuỗi rỗng trong các cột liên quan
UPDATE public.staging
SET
    cpu = REPLACE(cpu, 'undefined', ''),
    brand = REPLACE(brand, 'undefined', ''),
    pricing = REPLACE(pricing, 'undefined', ''),
    name = REPLACE(name, 'undefined', '')
WHERE
    cpu LIKE '%undefined%' OR
    brand LIKE '%undefined%' OR
    pricing LIKE '%undefined%' OR
    name LIKE '%undefined%';

-- 2. Loại bỏ các mẫu khớp với regex '\b\d+ nhân\b' trong cột 'cpu'
UPDATE public.staging
SET
    cpu = regexp_replace(cpu, '\\b\\d+ nhân\\b', '', 'g')
WHERE
    cpu ~ '\\b\\d+ nhân\\b';

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

-- 4. Loại bỏ dấu chấm và ký hiệu tiền tệ '₫' trong cột 'pricing'
UPDATE public.staging
SET
    pricing = regexp_replace(pricing, '[\\.₫]', '', 'g')
WHERE
    pricing ~ '[\\.₫]';

-- 5. Loại bỏ các mẫu khớp với regex '\b\d+GB/\d+GB\b' trong cột 'name'
UPDATE public.staging
SET
    name = regexp_replace(name, '\\b\\d+GB/\\d+GB\\b', '', 'g')
WHERE
    name ~ '\\b\\d+GB/\\d+GB\\b';

-- 6. Chuẩn hoá định dạng 'pricing' thành kiểu số
UPDATE public.staging
SET
    pricing = pricing::NUMERIC;

-- 7. Chuẩn hoá định dạng ngày tháng trong cột 'date_created' về dạng 'YYYY-MM-DD'
UPDATE public.staging
SET
    date_created = TO_DATE(date_created, 'MM/YYYY')
WHERE
    date_created ~ '^[0-9]{2}/[0-9]{4}$';

-- 8. Chuyển đổi đơn vị lưu trữ RAM, bộ nhớ thành số nguyên (VD: '8 GB' -> 8)
UPDATE public.staging
SET
    ram = REPLACE(ram, ' GB', '')::INTEGER,
    storage = REPLACE(storage, ' GB', '')::INTEGER,
    free_storage = REPLACE(free_storage, ' GB', '')::INTEGER;

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

-- 10. Xác minh không có giá trị NULL trong các cột quan trọng
ALTER TABLE public.staging
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN brand SET NOT NULL,
ALTER COLUMN pricing SET NOT NULL;

-- 11. Xoá các hàng có dữ liệu bị thiếu hoặc không hợp lệ ở các cột quan trọng
DELETE FROM public.staging
WHERE name IS NULL OR brand IS NULL OR pricing IS NULL;
