# FE: REACTJS
# BE: DJANGO
# SQL: POSTGRESQL

Cách chạy môi trường ảo và cài đặt các file cần thiết:

```bash
python3 -m venv venv
source venv/bin/activate  # Trên Linux/macOS
pip install -r requirements.txt

# Cài đặt PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Tạo cơ sở dữ liệu
sudo -u postgres psql
CREATE DATABASE music_app;
\q

# Chạy file schema
psql -U postgres -d music_app -f music_app_schema.sql
# Nếu chạy không được có thể là do đường dẫn file bị sai, có thể dùng `ls` để kiểm tra có file ở vị trí đó không nhé

# Kiểm tra cơ sở dữ liệu
sudo -u postgres psql
\dt  # Liệt kê các bảng
SELECT * FROM artists;  # Thử truy vấn một bảng
```
Nếu truy vấn được là thành công tạo database.

