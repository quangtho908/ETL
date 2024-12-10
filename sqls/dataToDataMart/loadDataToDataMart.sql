USE datamart;
DELIMITER //

CREATE PROCEDURE LoadDataFromDWToDM()
BEGIN
START TRANSACTION;

-- Xóa các bảng tạm nếu tồn tại
DROP TABLE IF EXISTS loadDataToDataMart;
DROP TABLE IF EXISTS loadDataToDataMart.date_temp;

-- Tạm thời vô hiệu hóa ràng buộc khóa ngoại
SET foreign_key_checks = 0;

    -- Tạo bảng tạm để lưu dữ liệu từ product_dim
CREATE TABLE datamart.product_temp AS
SELECT
    p.id,
    p.name,
    p.price,
    p.priceSale,
    p.brand,
    p.color,
    p.size,
    p.status,
    p.description_part1,
    p.description_part2,
    p.description_part3,
    p.created_at,
    p.isDelete,
    CURRENT_TIMESTAMP AS date_insert, -- Thời gian insert vào Data Mart
    p.expired_date,
    p.date_sk
FROM datawarehouse.product_dim p;

-- Tạo bảng tạm để lưu dữ liệu từ date_dim
CREATE TABLE datamart.date_temp AS
SELECT *
FROM datawarehouse.date_dim;

-- Đổi tên bảng chính trong DM thành old
RENAME TABLE datamart.product TO datamart.product_old;
    RENAME TABLE datamart.date TO datamart.date_old;

    -- Đổi tên bảng tạm thành bảng chính trong DM
    RENAME TABLE datamart.product_temp TO datamart.product;
    RENAME TABLE datamart.date_temp TO datamart.date;

    -- Xóa các bảng cũ trong DM nếu có
DROP TABLE IF EXISTS datamart.product_old;
DROP TABLE IF EXISTS datamart.date_old;

-- Đảm bảo các giá trị date_sk trong datamart.product phải tồn tại trong datamart.date
-- Tạo chỉ mục cho date_sk trong bảng date nếu chưa có
CREATE INDEX idx_date_sk ON datamart.date(date_sk);

-- Thêm khóa ngoại vào bảng product
ALTER TABLE datamart.product
    ADD CONSTRAINT fk_product_date FOREIGN KEY (date_sk) REFERENCES datamart.date(date_sk)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- Bật lại ràng buộc khóa ngoại
SET foreign_key_checks = 1;

COMMIT;
END //

DELIMITER ;

-- Gọi procedure LoadDataFromDWToDM để chuyển dữ liệu
CALL LoadDataFromDWToDM();

-- Xóa procedure sau khi gọi (nếu không còn cần thiết)
DROP PROCEDURE LoadDataFromDWToDM;

-- Kiểm tra dữ liệu đã được chuyển vào trong Data Mart
SELECT * FROM datamart.product;
SELECT * FROM datamart.date;