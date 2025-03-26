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
        db_table = 'users'


class Profile(models.Model):
    id = models.AutoField(primary_key=True)  # Thêm trường này
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id')
    date_of_birth = models.DateField(null=True, blank=True)
    profile_image = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'profiles'


class Artist(models.Model):
    name = models.CharField(max_length=255)
    image = models.CharField(max_length=255, null=True, blank=True)  # Giữ lại image trong Artist

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
    GENRE_CHOICES = [
        ('pop', 'Pop'),
        ('rock', 'Rock'),
        ('jazz', 'Jazz'),
    ]
    name = models.CharField(max_length=255)
    duration = models.DurationField()
    file = models.CharField(max_length=255)
    image = models.CharField(max_length=255, null=True, blank=True)  # Thêm image vào Track
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True)
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES, null=True, blank=True)  # Thêm genre vào Track

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


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', db_column='sender_id')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', db_column='receiver_id')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'messages'
        ordering = ['sent_at']  # Sắp xếp theo thời gian gửi

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:20]}"


# Các model mới từ SQL
class SharedListeningInvitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations', db_column='sender_id')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations', db_column='receiver_id')
    track = models.ForeignKey(Track, on_delete=models.CASCADE, db_column='track_id')
    start_time = models.DateTimeField()
    current_position = models.DurationField()  # INTERVAL trong SQL ánh xạ thành DurationField
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    class Meta:
        db_table = 'shared_listening_invitations'
        constraints = [
            models.UniqueConstraint(fields=['sender', 'receiver', 'track'], name='unique_invitation'),
        ]
        indexes = [
            models.Index(fields=['sender', 'receiver'], name='shared_listening_idx'),
        ]

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.track.name} ({self.status})"


class MusicVideo(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, db_column='track_id')
    video_file = models.CharField(max_length=255)
    duration = models.DurationField(null=True, blank=True)  # INTERVAL có thể NULL
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'music_videos'

    def __str__(self):
        return f"Video for {self.track.name}"

class Token(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    created = models.DateTimeField(auto_now_add=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='auth_token')

    class Meta:
        db_table = 'authtoken_token'
        
class UserAlbum(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    image = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_albums'

    def __str__(self):
        return f"{self.name} by {self.user.username}"


class UserAlbumTrack(models.Model):
    user_album = models.ForeignKey(UserAlbum, on_delete=models.CASCADE, db_column='user_album_id')
    track = models.ForeignKey(Track, on_delete=models.CASCADE, db_column='track_id')
    track_order = models.IntegerField()

    class Meta:
        db_table = 'user_album_tracks'
        constraints = [
            models.UniqueConstraint(fields=['user_album', 'track_order'], name='unique_user_album_order'),
            models.CheckConstraint(check=models.Q(track_order__gte=0), name='track_order_non_negative'),
        ]

    def __str__(self):
        return f"{self.user_album.name} - Track {self.track.name} (Order: {self.track_order})"