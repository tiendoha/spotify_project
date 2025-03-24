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

# Chạy file schema
sudo -u postgres psql -f music_app_schema.sql
# Nếu chạy không được có thể là do đường dẫn file bị sai, có thể dùng `ls` để kiểm tra có file ở vị trí đó không nhé

sudo -u postgres psql -d music_app
SELECT COUNT(*) FROM users;    -- 26
SELECT COUNT(*) FROM tracks;   -- 36
SELECT COUNT(*) FROM playlists; -- 25
\q
```
Nếu truy vấn được là thành công tạo database.

