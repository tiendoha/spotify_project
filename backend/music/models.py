from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    # Xóa các trường mặc định không có trong CSDL
    last_login = None
    is_superuser = None
    is_staff = None
    is_active = None
    first_name = None
    last_name = None

    email = models.EmailField(max_length=254, unique=True)
    date_joined = models.DateTimeField()  # Sửa thành DateTimeField

    class Meta:
        db_table = 'auth_user'


class Profile(models.Model):
    id = models.AutoField(primary_key=True)  # Thêm trường này
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id')
    date_of_birth = models.DateField(null=True, blank=True)
    profile_image = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'profiles'



class Artist(models.Model):
    GENRE_CHOICES = [
        ('pop', 'Pop'),
        ('rock', 'Rock'),
        ('jazz', 'Jazz'),
    ]
    name = models.CharField(max_length=255)
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES)
    image = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'artists'

class Album(models.Model):
    name = models.CharField(max_length=255)
    release_date = models.DateField()
    image = models.CharField(max_length=255, null=True, blank=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)

    class Meta:
        db_table = 'albums'

class Track(models.Model):
    name = models.CharField(max_length=255)
    duration = models.DurationField()
    file = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'tracks'

class Playlist(models.Model):
    name = models.CharField(max_length=255)
    image = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'playlists'

class PlaylistTrack(models.Model):
    id = models.AutoField(primary_key=True)  # Thêm trường này
    playlist = models.ForeignKey('Playlist', on_delete=models.CASCADE, db_column='playlist_id')
    track = models.ForeignKey('Track', on_delete=models.CASCADE, db_column='track_id')
    track_order = models.IntegerField()

    class Meta:
        db_table = 'playlist_tracks'
        unique_together = [('playlist', 'track_order')]


class Follower(models.Model):
    id = models.AutoField(primary_key=True)  # Thêm trường này
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    artist = models.ForeignKey('Artist', on_delete=models.CASCADE, db_column='artist_id')

    class Meta:
        db_table = 'followers'
        unique_together = ('user', 'artist')


class Like(models.Model):
    id = models.AutoField(primary_key=True)  # Thêm trường này
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    track = models.ForeignKey('Track', on_delete=models.CASCADE, db_column='track_id')
    liked_at = models.DateTimeField(auto_now_add=True)  # Sửa thành DateTimeField

    class Meta:
        db_table = 'likes'
        unique_together = ('user', 'track')