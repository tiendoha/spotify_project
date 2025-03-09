from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    email = models.EmailField(max_length=254, unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auth_user'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
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
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    track_order = models.IntegerField()

    class Meta:
        db_table = 'playlist_tracks'
        unique_together = [('playlist', 'track_order')]  # Tuple lồng nhau
        constraints = [
            models.CheckConstraint(check=models.Q(track_order__gte=0), name='track_order_gte_0')
        ]

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)

    class Meta:
        db_table = 'followers'
        unique_together = ('user', 'artist')

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    liked_at = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        unique_together = ('user', 'track')