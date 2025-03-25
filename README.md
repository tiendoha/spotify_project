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

sudo -u postgres psql

SELECT pg_stat_activity.pid, pg_stat_activity.usename, pg_stat_activity.query 
FROM pg_stat_activity 
WHERE pg_stat_activity.datname = 'music_app' AND state = 'active';

DROP DATABASE music_app;

CREATE DATABASE music_app;
\q

cd ../spotify_project/backend

python manage.py makemigrations
python manage.py migrate

cd ../spotify_project

sudo -u postgres psql -d music_app -f music_app_schema.sql

sudo -u postgres psql -d music_app
SELECT COUNT(*) FROM users;    -- 26
SELECT COUNT(*) FROM tracks;   -- 36
SELECT COUNT(*) FROM playlists; -- 25
\q
```
Nếu truy vấn được là thành công tạo database.

