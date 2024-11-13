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
