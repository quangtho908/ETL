COPY public.staging
FROM 'http://10.0.11.87:3000/dienmayxanh.csv'
DELIMITER ','
CSV HEADER;