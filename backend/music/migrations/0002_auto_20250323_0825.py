# music/migrations/0002_fake_existing_tables.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('music', '0001_initial'),  # Thay bằng migration trước đó nếu có
    ]
    operations = [
        migrations.RunSQL('SELECT 1;')  # Dummy operation
    ]