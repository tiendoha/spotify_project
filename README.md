# FE: REACTJS
# BE: DJANGO
# SQL: POSTGRESQL
Cách chạy môi trường ảo và cài đặt các file cần thiết 
`
python3 -m venv venv
source venv/bin/activate  # Trên Linux/macOS
pip install -r requirements.txt
python3 -m venv venv
source venv/bin/activate
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql
CREATE DATABASE music_app;
\q
psql -U postgres -d music_app -f music_app_schema.sql -- Nếu chạy không được có thể là do đường dẫn file bị sai ó có thể ls để kiểm tra có file ở vị trí đó không nhé
sudo -u postgres psql
\dt  -- Liệt kê các bảng
SELECT * FROM artists;  -- Thử truy vấn một bảng
`
Nếu truy vấn được là thành công tạo database